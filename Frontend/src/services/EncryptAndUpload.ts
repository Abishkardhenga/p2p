// Copyright (c), Mystue Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { Transaction } from '@mysten/sui/transactions';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';

export type Data = {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
  isImage: string;
};

type WalrusService = {
  id: string;
  name: string;
  publisherUrl: string;
  aggregatorUrl: string;
};

const NUM_EPOCH = 1;

export const walrusServices: WalrusService[] = [
  {
    id: 'service1',
    name: 'walrus.space',
    publisherUrl: '/publisher1',
    aggregatorUrl: '/aggregator1',
  },
];

/**
 * Encrypt data with SEAL and upload to Walrus
 * @param data - raw bytes to encrypt (e.g. system prompt utf8 bytes)
 * @param policyObject - policy object string for SEAL
 * @param suiClient - Sui client
 * @param packageId - package ID
 * @param selectedService - walrus service id
 */
export async function encryptAndUpload(
  data: Uint8Array,
  policyObject: string,
  suiClient: any,
  packageId: string,
  selectedService: string = 'service1'
): Promise<Data> {
  // init SEAL client
  const serverObjectIds = getAllowlistedKeyServers('testnet');
  const client = new SealClient({
    suiClient,
    serverObjectIds,
    verifyKeyServers: false,
  });
  // encrypt
  const result = await client.encrypt({
    id: policyObject,
    packageId,
    threshold: NUM_EPOCH,
    data,
  });
  // upload encrypted blob
  const info = await storeBlob(result.encryptedObject, selectedService);
  return info;
}

/**
 * Upload plain (unencrypted) blob to Walrus
 * @param blob - Blob or Uint8Array (e.g. image file or user prompt utf8 bytes)
 * @param selectedService - walrus service id
 */
export async function uploadPlain(
  blob: Blob | Uint8Array,
  selectedService: string = 'service1'
): Promise<Data> {
  const raw = blob instanceof Uint8Array ? blob : new Uint8Array(await blob.arrayBuffer());
  const info = await storeBlob(raw, selectedService);
  return info;
}

/**
 * Store raw bytes to Walrus via HTTP PUT
 */
async function storeBlob(
  encryptedData: Uint8Array,
  selectedService: string
): Promise<Data> {
  const service = walrusServices.find((s) => s.id === selectedService)!;
  const url = `${service.publisherUrl.replace(/^\/+/, '')}/v1/blobs?epochs=${NUM_EPOCH}`;
  const res = await fetch(url, { method: 'PUT', body: encryptedData });
  if (res.status !== 200) {
    throw new Error('Failed to upload blob to Walrus');
  }
  return await res.json();
}

/**
 * Publish blob id on Sui via move call
 */
export async function publishToSui(
  suiClient: any,
  policyObject: string,
  capId: string,
  moduleName: string,
  blobId: string
): Promise<any> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${moduleName}::publish`,
    arguments: [tx.object(policyObject), tx.object(capId), tx.pure.string(blobId)],
  });
  tx.setGasBudget(10000000);
  return suiClient.executeTransactionBlock(tx);
}