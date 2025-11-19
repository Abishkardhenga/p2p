import {
  EncryptedObject,
  NoAccessError,
  SealClient,
  SessionKey,
} from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/bcs";

/**
 * Decrypts data using SEAL decryption
 * @param sessionKey - The session key for decryption
 * @param packageId - The package ID for the SEAL contract
 * @param suiClient - Instance of SuiClient
 * @param sealClient - Instance of SealClient
 * @param bottledMessageId - The bottled message ID
 * @param encryptedBytes - The encrypted data as Uint8Array
 * @returns The decrypted data or null if decryption fails
 */
export async function decryptData(
  sessionKey: SessionKey,
  packageId: string,
  suiClient: SuiClient,
  sealClient: SealClient,
  bottledMessageId: string,
  encryptedBytes: Uint8Array
) {
  const encryptedObjectInformation = EncryptedObject.parse(encryptedBytes);
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::core::seal_approve`,
    arguments: [
      tx.pure.vector("u8", fromHex(encryptedObjectInformation.id)),
      tx.object(bottledMessageId),
    ],
  });
  
  const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });
  
  try {
    const decryptedData = await sealClient.decrypt({
      data: encryptedBytes,
      sessionKey,
      txBytes,
      checkShareConsistency: true,
    });
    return decryptedData;
  } catch (err) {
    const errorMsg =
      err instanceof NoAccessError
        ? "No access to decryption keys"
        : "Unable to decrypt files, try again";
    console.error(errorMsg);
    return null;
  }
}
