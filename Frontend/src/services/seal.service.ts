/**
 * SEAL Encryption Service for Backend Integration
 * 
 * This service provides methods for encrypting prompts on the backend
 * using a default account, so sellers don't need to approve transactions
 * for every purchase.
 */

import { SealClient, SessionKey } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { encryptData } from "@/utils/seal/encrypt";
import { decryptData } from "@/utils/seal/decrypt";

// Backend configuration
const BACKEND_MNEMONIC = "chronic loan situate honey wreck point job mansion hub sunset educate page";
const PACKAGE_ID = "0x71ac54b16bcfcb9ee4eadc343206885c816a79f0fe4621cf78dd028c65325818";
const KEY_SERVER_LIST_TESTNET = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

/**
 * Backend SEAL Service
 * Note: This should ideally run on the backend, not in the browser
 */
export class BackendSealService {
  private keypair: Ed25519Keypair;
  private suiClient: SuiClient;
  private sealClient: SealClient;

  constructor(rpcUrl: string) {
    // Create keypair from mnemonic
    this.keypair = Ed25519Keypair.deriveKeypair(BACKEND_MNEMONIC);
    
    // Initialize clients
    this.suiClient = new SuiClient({ url: rpcUrl });
    this.sealClient = new SealClient({
      suiClient: this.suiClient as any,
      serverConfigs: KEY_SERVER_LIST_TESTNET.map((id: string) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: true,
    });
  }

  /**
   * Get the backend account address
   */
  getBackendAddress(): string {
    return this.keypair.toSuiAddress();
  }

  /**
   * Encrypt a prompt for a buyer
   * This creates a bottle, encrypts the prompt, stores it, and sets the buyer as recipient
   * 
   * @param promptContent - The prompt content to encrypt
   * @param buyerAddress - The buyer's address who will be able to decrypt
   * @returns Object with bottleId and encryptedData
   */
  async encryptPromptForBuyer(
    promptContent: string,
    buyerAddress: string
  ): Promise<{ bottleId: string; encryptedData: Uint8Array }> {
    try {
      // Step 1: Create bottle
      const createBottleTx = new Transaction();
      createBottleTx.moveCall({
        target: `${PACKAGE_ID}::core::create_bottle`,
      });

      const createResult = await this.suiClient.signAndExecuteTransaction({
        signer: this.keypair,
        transaction: createBottleTx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      await this.suiClient.waitForTransaction({
        digest: createResult.digest,
      });

      // Extract bottle ID
      const createdObjects = createResult.objectChanges?.filter(
        (obj: any) => obj.type === "created"
      ) as any[];
      const bottleId = createdObjects?.[0]?.objectId;

      if (!bottleId) {
        throw new Error("Failed to get bottle ID");
      }

      // Step 2: Encrypt the prompt
      const promptBytes = new TextEncoder().encode(promptContent);
      const encryptedData = await encryptData(
        PACKAGE_ID,
        this.sealClient,
        bottleId,
        promptBytes
      );

      // Step 3: Put message in bottle
      const putMessageTx = new Transaction();
      putMessageTx.moveCall({
        target: `${PACKAGE_ID}::core::put_message_in_bottle`,
        arguments: [
          putMessageTx.object(bottleId),
          putMessageTx.pure.vector("u8", Array.from(encryptedData)),
        ],
      });

      const putResult = await this.suiClient.signAndExecuteTransaction({
        signer: this.keypair,
        transaction: putMessageTx,
      });

      await this.suiClient.waitForTransaction({
        digest: putResult.digest,
      });

      // Step 4: Set buyer as recipient
      const setRecipientTx = new Transaction();
      setRecipientTx.moveCall({
        target: `${PACKAGE_ID}::core::set_recipient`,
        arguments: [
          setRecipientTx.object(bottleId),
          setRecipientTx.pure.address(buyerAddress),
        ],
      });

      const recipientResult = await this.suiClient.signAndExecuteTransaction({
        signer: this.keypair,
        transaction: setRecipientTx,
      });

      await this.suiClient.waitForTransaction({
        digest: recipientResult.digest,
      });

      return {
        bottleId,
        encryptedData,
      };
    } catch (error) {
      console.error("Backend encryption error:", error);
      throw error;
    }
  }

  /**
   * Add a recipient to an existing bottle
   * Only works if the backend account owns the bottle
   * 
   * @param bottleId - The bottle ID
   * @param recipientAddress - The new recipient's address
   */
  async addRecipientToBottle(
    bottleId: string,
    recipientAddress: string
  ): Promise<void> {
    try {
      const tx = new Transaction();
      tx.setGasBudget(100000000);
      tx.moveCall({
        target: `${PACKAGE_ID}::core::set_recipient`,
        arguments: [
          tx.object(bottleId),
          tx.pure.address(recipientAddress),
        ],
      });

      const result = await this.suiClient.signAndExecuteTransaction({
        signer: this.keypair,
        transaction: tx,
      });

      console.log("✅ Recipient added successfully:", recipientAddress);
      console.log("Transaction digest:", result.digest);
    } catch (error) {
      console.error("Add recipient error:", error);
      throw error;
    }
  }

  /**
   * Encrypt prompt using automated backend (3 transactions, but no user approval)
   * Note: SEAL bottles are shared objects, so we can't combine into one transaction
   */
  async encryptPromptQuick(
    promptContent: string,
    buyerAddress: string
  ): Promise<{ bottleId: string; encryptedData: Uint8Array }> {
    // Just use the standard 3-transaction method
    // It's automated on backend, so user doesn't see the difference
    return this.encryptPromptForBuyer(promptContent, buyerAddress);
  }
}

/**
 * Example usage in backend API:
 * 
 * // Initialize service
 * const sealService = new BackendSealService("https://fullnode.testnet.sui.io");
 * 
 * // When user purchases a prompt
 * app.post('/api/purchase-prompt', async (req, res) => {
 *   const { promptId, buyerAddress } = req.body;
 *   
 *   // Get prompt content from database
 *   const prompt = await db.getPrompt(promptId);
 *   
 *   // Encrypt for buyer using backend account
 *   const { bottleId, encryptedData } = await sealService.encryptPromptQuick(
 *     prompt.content,
 *     buyerAddress
 *   );
 *   
 *   // Save to database
 *   await db.savePurchase({
 *     promptId,
 *     buyerAddress,
 *     bottleId,
 *     encryptedData: Buffer.from(encryptedData).toString('base64')
 *   });
 *   
 *   // Return to buyer
 *   res.json({ bottleId, encryptedData: Buffer.from(encryptedData).toString('base64') });
 * });
 */
