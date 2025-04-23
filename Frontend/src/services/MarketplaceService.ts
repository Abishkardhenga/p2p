// Copyright (c), Mystue Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Transaction } from '@mysten/sui/transactions';
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
  testPrice: number
): Promise<any> {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::ai_marketplace::list_prompt`,
    arguments: [
      tx.object(marketplaceId),
      tx.pure.string(metadataUri),
      tx.pure.string(encryptedPromptUri),
      tx.pure.u64(price),
      tx.pure.u64(testPrice),
      tx.pure.u8(0), // no allowlist
    ],
  });
  tx.setGasBudget(1000000);
  // sign and execute transaction block via provider (wallet will sign)
  return suiClient.signAndExecuteTransactionBlock({
    transactionBlock: await tx.build(),
    options: { showBalanceChanges: true },
  });
}
