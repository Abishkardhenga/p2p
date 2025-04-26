// Copyright (c), Mystue Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
// using DappKit provider client directly, no explicit SuiClient import

/**
 * List a new prompt on Sui blockchain by calling `list_prompt` entry function
 * @param suiClient - Sui client from dapp-kit
 * @param packageId - Package ID of the marketplace package
 * @param marketplaceId - Object ID of the marketplace resource
 * @param metadataUri - Blob ID for plain metadata stored in Walrus
 * @param encryptedPromptUri - Blob ID for encrypted system prompt stored in Walrus
 * @param price - One-time purchase price (u64)
 * @param testPrice - Test access price (u64)
 */
export async function listPrompt(
  suiClient: any,
  packageId: string,
  marketplaceId: string,
  metadataUri: string,
  encryptedPromptUri: string,
  price: number,
  testPrice: number,
  signAndExecute: any,
): Promise<any> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::ai_marketplace::list_prompt`,
    arguments: [
      tx.object(marketplaceId),
      tx.pure.string(metadataUri),
      tx.pure.string(encryptedPromptUri),
      tx.pure.u64(Math.floor(price * (10**9))),
      tx.pure.u64(Math.floor(testPrice * (10**9))),
      // tx.pure(bcs.option(bcs.Address).serialize(null).toBytes()), // no allowlist
    ],
  });
  // tx.setGasBudget(1000000);
  // sign and execute transaction block via provider (wallet will sign)

  const res2: any = await new Promise((res, rej) =>
    signAndExecute({ transaction: tx }, { onSuccess: res, onError: rej })
  );
  return res2;
}

// Added fetchPrompts to retrieve listed prompts on-chain
export type OnChainPrompt = {
  id: string;
  metadataUri: string;
  encryptedPromptUri: string;
  price: number;
  testPrice: number;
};

export async function fetchPrompts(
  suiClient: any,
  marketplaceId: string
): Promise<OnChainPrompt[]> {
  console.log('fetchPrompts: marketplaceId', marketplaceId);
  const marketRes = await suiClient.getObject({ id: marketplaceId, options: { showContent: true } });
  console.log('fetchPrompts: marketRes', marketRes);
  if (!marketRes.data?.content) {
    console.error('fetchPrompts: missing marketplace content');
    return [];
  }
  const mFields = (marketRes.data.content as any).fields;
  const promptsTable = mFields.prompts;
  console.log('fetchPrompts: promptsTable struct', promptsTable);
  const tableId = typeof promptsTable === 'string'
    ? promptsTable
    : promptsTable.id?.id || promptsTable.fields?.id?.id || promptsTable.objectId;
  console.log('fetchPrompts: tableId', tableId);
  const dfs = await suiClient.getDynamicFields({ parentId: tableId, cursor: null, limit: 100 });
  console.log('fetchPrompts: dynamic fields', dfs.data);
  const results: OnChainPrompt[] = [];
  for (const df of dfs.data) {
    console.log('fetchPrompts: fetching prompt', df.objectId);
    const pr = await suiClient.getObject({ id: df.objectId, options: { showContent: true } });
    if (!pr.data?.content) continue;
    // Dynamic field wrapper: actual Prompt fields may be under .fields.value.fields
    let pf: any = (pr.data.content as any).fields;
    if (pf.value && pf.value.fields) {
      pf = pf.value.fields;
    }
    const metadataUri = pf.metadata_uri;
    const encryptedPromptUri = pf.encrypted_prompt_uri;
    results.push({
      id: df.objectId,
      metadataUri,
      encryptedPromptUri,
      price: Number(pf.price) / 1e9,
      testPrice: Number(pf.test_price) / 1e9,
    });
  }
  console.log('fetchPrompts: results', results);
  return results;
}