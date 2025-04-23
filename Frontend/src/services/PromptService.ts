// Copyright (c), Mystue Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { encryptAndUpload, uploadPlain } from './EncryptAndUpload';
import { listPrompt } from './MarketplaceService';
import { TESTNET_MARKETPLACE_ID } from '../constants';

// TextEncoder is globally available in browser environments

export interface PromptFormData {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  model: string;
  price: number;
  testPrice: number;
  systemPrompt: string;
  sampleInputs: string[];
  sampleOutputs: string[];
  sampleImages: string[];
}

/**
 * Submits a prompt by encrypting the system prompt, uploading metadata and invoking the blockchain call.
 */
export async function submitPrompt(
  formData: PromptFormData,
  suiClient: any,
  packageId: string
): Promise<any> {
  // Encrypt system prompt and upload
  const encoder = new TextEncoder();
  const encrypted = await encryptAndUpload(
    encoder.encode(formData.systemPrompt),
    'POLICY_OBJECT_ID',
    suiClient,
    packageId
  );
  const encryptedPromptUri = encrypted.blobId;

  // Prepare plain metadata
  const metadata = {
    title: formData.title,
    description: formData.description,
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

  // Invoke chain listing
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
