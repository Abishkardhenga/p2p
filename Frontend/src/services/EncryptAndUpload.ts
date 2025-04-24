import { Transaction } from '@mysten/sui/transactions';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';
import { listPrompt } from './MarketplaceService';
import { TESTNET_MARKETPLACE_ID } from '@/constants';

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

const NUM_EPOCH = 2;

export const walrusServices: WalrusService[] = [
  {
    id: 'service1',
    name: 'walrus.space',
    publisherUrl: '/publisher1',
    aggregatorUrl: '/aggregator1',
  },
];

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
  policyObject: string,
  capId: string,
  blobId: string,
  packageId: string,
  signAndExecute: any
): Promise<any> {
  const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::ai_marketplace::publish`,
      arguments: [tx.object(policyObject), tx.object(capId), tx.pure.string(blobId)],
    });

    tx.setGasBudget(10000000);
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: async (result) => {
          console.log('res', result);
          alert('Blob attached successfully, now share the link or upload more.');
        },
      },
    );
}

// ---- Unified prompt submission (migrated from PromptService) ----
export interface PromptFormData {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  model: string;
  price: number;
  testPrice: number;
  userPrompt: string;
  systemPrompt: string;
  sampleInputs: string[];
  sampleOutputs: string[];
  sampleImages: string[];
}

/**
 * Handles full prompt submission: encrypts with SEAL under a policy object, uploads, and lists on-chain
 * @param formData - prompt form values
 * @param suiClient - Sui client
 * @param packageId - Move package ID for on-chain listing
 * @param policyObject - Sui object ID to use as SEAL policy object (e.g. allowlist cap)
 */
export async function handleSubmit(
  formData: PromptFormData,
  suiClient: any,
  packageId: string,
  policyObject: any,
  capId: string,
  signAndExecute: any
): Promise<any> {
  const encoder = new TextEncoder();
  // Inline SEAL encryption & Walrus upload (instead of encryptAndUpload)
  const serverObjectIds = getAllowlistedKeyServers('testnet');
  if (!serverObjectIds || serverObjectIds.length === 0) {
    throw new Error('No key server addresses found for network "testnet"');
  }
  const client = new SealClient({ suiClient, serverObjectIds, verifyKeyServers: false });
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyObjectBytes = fromHex(policyObject);
  const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
  const result = await client.encrypt({ id, packageId, threshold: NUM_EPOCH, data: encoder.encode(formData.systemPrompt) });
  const infoEncrypted = await storeBlob(result.encryptedObject, 'service1');
  const encryptedPromptUri = infoEncrypted.blobId;

  publishToSui(policyObject, capId, encryptedPromptUri, packageId, signAndExecute)

  const metadata = {
    title: formData.title,
    description: formData.description,
    systemPrompt: encryptedPromptUri,
    userPrompt: formData.userPrompt,
    longDescription: formData.longDescription,
    category: formData.category,
    subcategory: formData.subcategory,
    model: formData.model,
    sampleInputs: formData.sampleInputs,
    sampleOutputs: formData.sampleOutputs,
    sampleImages: formData.sampleImages,
    price: formData.price,
    testPrice: formData.testPrice,
  };
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const uploaded = await uploadPlain(metadataBlob);
  const metadataUri = uploaded.blobId;

  publishToSui(policyObject, capId, metadataUri, packageId, signAndExecute)

  return listPrompt(
    suiClient,
    packageId,
    TESTNET_MARKETPLACE_ID,
    metadataUri,
    encryptedPromptUri,
    formData.price,
    formData.testPrice
  );
}