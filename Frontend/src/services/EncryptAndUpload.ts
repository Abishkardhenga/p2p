import { Transaction } from '@mysten/sui/transactions';
import { getAllowlistedKeyServers, SealClient } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';
import { listPrompt } from './MarketplaceService';
import { TESTNET_MARKETPLACE_ID } from '@/constants';
import { Address } from 'cluster';

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
  const json = await res.json();
  // Extract blobId from response (v1 nested or top-level)
  const blobId = (json as any).blobId || (json as any).newlyCreated?.blobObject?.blobId;
  if (!blobId) {
    console.error('storeBlob: missing blobId in response', json);
    throw new Error('storeBlob: could not extract blobId');
  }
  return { ...(json as any), blobId } as Data;
}

/**
 * Publish blob id on Sui via move call
 */
export async function publishToSui(
  policyObject: string,
  capId: string,
  blobId: string,
  packageId: string,
  signAndExecute: any,
  currentAddress: any
): Promise<any> {
  // Ensure required params
  if (!policyObject || !capId || !blobId || !packageId) {
    console.error('publishToSui: missing parameters', { policyObject, capId, blobId, packageId });
    return;
  }
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::ai_marketplace::publish`,
      typeArguments: [],
      arguments: [
        tx.object(TESTNET_MARKETPLACE_ID),
        tx.object(policyObject),
        tx.object(capId),
        tx.pure.string(blobId),
        tx.pure.address(currentAddress),
      ],
    });

    tx.setGasBudget(10000000);
    // Execute transaction and return a promise
    return await new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('publishToSui success', result);
            resolve(result);
          },
          onError: (error: any) => {
            console.error('publishToSui error callback', error);
            reject(error);
          },
        }
      );
    });
  } catch (err: any) {
    console.error('publishToSui exception', err);
    throw err;
  }
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
 * @param capId - Sui object ID for the cap
 * @param signAndExecute - Function to sign and execute transaction
 * @param currentAddress - Current wallet address
 */
export async function handleSubmit(
  formData: PromptFormData,
  suiClient: any,
  packageId: string,
  policyObject: any,
  capId: string,
  signAndExecute: any,
  currentAddress:any,
  currentSuiPrice:any
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
  console.log('handleSubmit: storeBlob encrypted info', infoEncrypted, 'policyObject', policyObject, 'capId', capId);
  const encryptedPromptUri = infoEncrypted.blobId;
  console.log('handleSubmit: encryptedPromptUri', encryptedPromptUri);
  // Ensure encrypted URI exists
  if (!encryptedPromptUri) throw new Error('handleSubmit: missing encryptedPromptUri');
  // Publish encrypted blob on-chain
  await publishToSui(policyObject, capId, encryptedPromptUri, packageId, signAndExecute, currentAddress);

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
    price: (formData.price / currentSuiPrice),
    testPrice: (formData.testPrice / currentSuiPrice),
  };
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const uploaded = await uploadPlain(metadataBlob);
  console.log('handleSubmit: uploadPlain metadata result', uploaded);
  const metadataUri = uploaded.blobId;
  console.log('handleSubmit: metadataUri', metadataUri);
  // Ensure metadata URI exists
  if (!metadataUri) throw new Error('handleSubmit: missing metadataUri');
  // Publish metadata blob on-chain
  await publishToSui(policyObject, capId, metadataUri, packageId, signAndExecute, currentAddress);

  return listPrompt(
    suiClient,
    packageId,
    TESTNET_MARKETPLACE_ID,
    metadataUri,
    encryptedPromptUri,
    (formData.price / currentSuiPrice),
    (formData.testPrice / currentSuiPrice),
    signAndExecute,
  );
}