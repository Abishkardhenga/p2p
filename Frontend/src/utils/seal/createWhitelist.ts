import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";

/**
 * Creates a new bottle for storing encrypted messages
 * @param packageId - The package ID for the SEAL contract
 * @param suiClient - Instance of SuiClient
 * @param keypair - The keypair for signing transactions
 * @returns The created bottle ID
 */
export async function createBottle(
  packageId: string,
  suiClient: SuiClient,
  keypair: any
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::core::create_bottle`,
  });

  const result = await suiClient.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  await suiClient.waitForTransaction({
    digest: result.digest,
  });

  const createdObjects = result.objectChanges?.filter(
    (obj) => obj.type === "created"
  );

  console.log("All object changes:", result.objectChanges);
  console.log("Created objects:", createdObjects);

  const bottleId = createdObjects?.[0]?.objectId;
  console.log("Created bottle:", bottleId);

  if (!bottleId) {
    throw new Error("Failed to get bottle ID from transaction result");
  }

  return bottleId;
}

/**
 * Puts an encrypted message into a bottle
 * @param packageId - The package ID for the SEAL contract
 * @param suiClient - Instance of SuiClient
 * @param keypair - The keypair for signing transactions
 * @param bottleId - The bottle ID to put the message in
 * @param encryptedData - The encrypted data as Uint8Array
 * @returns The transaction result
 */
export async function putMessageInBottle(
  packageId: string,
  suiClient: SuiClient,
  keypair: any,
  bottleId: string,
  encryptedData: Uint8Array
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::core::put_message_in_bottle`,
    arguments: [
      tx.object(bottleId),
      tx.pure.vector("u8", Array.from(encryptedData)),
    ],
  });

  const result = await suiClient.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  console.log("Put message in bottle:", result.digest);
  return result;
}

/**
 * Sets the recipient for a bottle
 * @param packageId - The package ID for the SEAL contract
 * @param suiClient - Instance of SuiClient
 * @param keypair - The keypair for signing transactions
 * @param bottleId - The bottle ID to set the recipient for
 * @param recipientAddress - The recipient's address
 * @returns The transaction result
 */
export async function setRecipient(
  packageId: string,
  suiClient: SuiClient,
  keypair: any,
  bottleId: string,
  recipientAddress: string
) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::core::set_recipient`,
    arguments: [tx.object(bottleId), tx.pure.address(recipientAddress)],
  });

  const result = await suiClient.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  console.log("Set recipient:", result.digest);
  return result;
}
