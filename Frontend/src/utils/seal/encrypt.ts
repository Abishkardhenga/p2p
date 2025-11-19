import { SealClient } from "@mysten/seal";

/**
 * Encrypts data using SEAL encryption
 * @param packageId - The package ID for the SEAL contract
 * @param sealClient - Instance of SealClient
 * @param bottleId - The bottle ID to associate with the encrypted data
 * @param data - The data to encrypt as Uint8Array
 * @returns The encrypted object
 */
export async function encryptData(
  packageId: string,
  sealClient: SealClient,
  bottleId: string,
  data: Uint8Array
) {
  const { encryptedObject } = await sealClient.encrypt({
    threshold: 2,
    packageId,
    id: bottleId,
    demType: 1,
    kemType: 0,
    data,
  });
  return encryptedObject;
}
