#!/usr/bin/env tsx
/**
 * SEAL Encryption Test Script
 * 
 * This script tests the SEAL encryption/decryption workflow:
 * 1. Creates a bottle
 * 2. Encrypts data
 * 3. Stores encrypted data in bottle
 * 4. Sets recipients
 * 5. Decrypts data with authorized recipients
 * 
 * Run with: npm run test:seal
 */

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SealClient, SessionKey } from "@mysten/seal";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { createBottle, putMessageInBottle, setRecipient } from "../src/utils/seal/createWhitelist";
import { encryptData } from "../src/utils/seal/encrypt";
import { decryptData } from "../src/utils/seal/decrypt";

// bottled_message package ID
const packageId =
  "0x71ac54b16bcfcb9ee4eadc343206885c816a79f0fe4621cf78dd028c65325818";

// key server list for seal client (official testnet key servers provided by Mysten Labs)
export const KEY_SERVER_LIST_TESTNET = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

// Test keypairs
// 0xb44524199c08bff7b0895c9bcc865b6359432740783319e5465aa3f9de4a3d66
const KEY_PAIR_ADDRESS_1 = Ed25519Keypair.deriveKeypair(
  "chronic loan situate honey wreck point job mansion hub sunset educate page"
);

// 0x30fcb67eb81d33304923ee525b8ef8eb6b3ca54212fc60a81cb34c94d297e054
const KEY_PAIR_ADDRESS_2 = Ed25519Keypair.deriveKeypair(
  "easy aerobic alcohol layer abstract smart describe muffin waste security monitor suggest"
);

// 0x09344d7fc282acaabd7643aa1062084ef1ac7ffc16b8ec15fad788109b63ea82
const KEY_PAIR_ADDRESS_3 = Ed25519Keypair.deriveKeypair(
  "spring sing vital nation snake nation dilemma fade long habit scheme suggest"
);

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

const sealClient = new SealClient({
  suiClient: suiClient as any,
  serverConfigs: KEY_SERVER_LIST_TESTNET.map((id: string) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: true,
});

async function testSealEncryption() {
  try {
    console.log("🚀 Starting SEAL encryption test...\n");

    // Step 1: Create a bottle
    console.log("📦 Step 1: Creating bottle...");
    const bottleId = await createBottle(
      packageId,
      suiClient,
      KEY_PAIR_ADDRESS_1
    );
    console.log(`✅ Bottle created: ${bottleId}\n`);

    // Step 2: Encrypt data
    console.log("🔐 Step 2: Encrypting data...");
    const plainText = "Hello, world! This is a secret message.";
    const plainTextBytes = new TextEncoder().encode(plainText);
    const encryptedData = await encryptData(
      packageId,
      sealClient,
      bottleId,
      plainTextBytes
    );
    console.log(`✅ Data encrypted (${encryptedData.length} bytes)\n`);

    // Step 3: Put message in bottle
    console.log("📮 Step 3: Putting message in bottle...");
    await putMessageInBottle(
      packageId,
      suiClient,
      KEY_PAIR_ADDRESS_1,
      bottleId,
      encryptedData
    );
    console.log("✅ Message stored in bottle\n");

    // Step 4: Set recipient (KEY_PAIR_ADDRESS_2)
    console.log("👤 Step 4: Setting recipient (Address 2)...");
    await setRecipient(
      packageId,
      suiClient,
      KEY_PAIR_ADDRESS_1,
      bottleId,
      KEY_PAIR_ADDRESS_2.toSuiAddress()
    );
    console.log(`✅ Recipient set: ${KEY_PAIR_ADDRESS_2.toSuiAddress()}\n`);

    // Step 5: Create session key for recipient
    console.log("🔑 Step 5: Creating session key for Address 2...");
    const sessionKey = await SessionKey.create({
      address: KEY_PAIR_ADDRESS_2.toSuiAddress(),
      packageId: packageId,
      ttlMin: 10,
      signer: KEY_PAIR_ADDRESS_2,
      suiClient,
    });
    console.log("✅ Session key created\n");

    // Step 6: Decrypt data with Address 2
    console.log("🔓 Step 6: Decrypting data with Address 2...");
    const decryptedData = await decryptData(
      sessionKey,
      packageId,
      suiClient,
      sealClient,
      bottleId,
      encryptedData
    );

    if (decryptedData) {
      const decryptedText = new TextDecoder().decode(decryptedData);
      console.log(`✅ Decrypted successfully: "${decryptedText}"\n`);
    } else {
      console.log("❌ Decryption failed for Address 2\n");
    }

    // Step 7: Add another recipient (KEY_PAIR_ADDRESS_3)
    console.log("👤 Step 7: Adding another recipient (Address 3)...");
    await setRecipient(
      packageId,
      suiClient,
      KEY_PAIR_ADDRESS_1,
      bottleId,
      KEY_PAIR_ADDRESS_3.toSuiAddress()
    );
    console.log(`✅ Recipient added: ${KEY_PAIR_ADDRESS_3.toSuiAddress()}\n`);

    // Step 8: Create session key for Address 3
    console.log("🔑 Step 8: Creating session key for Address 3...");
    const sessionKey3 = await SessionKey.create({
      address: KEY_PAIR_ADDRESS_3.toSuiAddress(),
      packageId: packageId,
      ttlMin: 10,
      signer: KEY_PAIR_ADDRESS_3,
      suiClient,
    });
    console.log("✅ Session key created\n");

    // Step 9: Decrypt data with Address 3
    console.log("🔓 Step 9: Decrypting data with Address 3...");
    const decryptedData3 = await decryptData(
      sessionKey3,
      packageId,
      suiClient,
      sealClient,
      bottleId,
      encryptedData
    );

    if (decryptedData3) {
      const decryptedText3 = new TextDecoder().decode(decryptedData3);
      console.log(`✅ Decrypted successfully: "${decryptedText3}"\n`);
    } else {
      console.log("❌ Decryption failed for Address 3\n");
    }

    console.log("🎉 Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  }
}

// Run the test
testSealEncryption();
