# Frontend Test Scripts

## SEAL Encryption Test

Test script for SEAL encryption/decryption functionality.

### Prerequisites

Install required dependencies:

```bash
npm install @mysten/seal tsx
# or
yarn add @mysten/seal tsx
# or
bun add @mysten/seal tsx
```

### Running the Test

```bash
npm run test:seal
```

### What the Test Does

The test script performs a complete SEAL encryption workflow:

1. **Creates a bottle** - A container for encrypted messages
2. **Encrypts data** - Encrypts a test message using SEAL
3. **Stores encrypted data** - Puts the encrypted message in the bottle
4. **Sets recipients** - Authorizes specific addresses to decrypt
5. **Creates session keys** - Generates temporary keys for decryption
6. **Decrypts data** - Verifies authorized recipients can decrypt

### Test Addresses

The script uses three test keypairs:
- **Address 1** (Sender): `0xb44524199c08bff7b0895c9bcc865b6359432740783319e5465aa3f9de4a3d66`
- **Address 2** (Recipient 1): `0x30fcb67eb81d33304923ee525b8ef8eb6b3ca54212fc60a81cb34c94d297e054`
- **Address 3** (Recipient 2): `0x09344d7fc282acaabd7643aa1062084ef1ac7ffc16b8ec15fad788109b63ea82`

### Expected Output

```
🚀 Starting SEAL encryption test...

📦 Step 1: Creating bottle...
✅ Bottle created: 0x...

🔐 Step 2: Encrypting data...
✅ Data encrypted (XXX bytes)

📮 Step 3: Putting message in bottle...
✅ Message stored in bottle

👤 Step 4: Setting recipient (Address 2)...
✅ Recipient set: 0x30fcb67...

🔑 Step 5: Creating session key for Address 2...
✅ Session key created

🔓 Step 6: Decrypting data with Address 2...
✅ Decrypted successfully: "Hello, world! This is a secret message."

👤 Step 7: Adding another recipient (Address 3)...
✅ Recipient added: 0x09344d7...

🔑 Step 8: Creating session key for Address 3...
✅ Session key created

🔓 Step 9: Decrypting data with Address 3...
✅ Decrypted successfully: "Hello, world! This is a secret message."

🎉 Test completed successfully!
```

### Troubleshooting

If the test fails:
1. Ensure you have sufficient SUI tokens on testnet for gas fees
2. Check that the package ID is correct and deployed on testnet
3. Verify the key server list is up to date
4. Make sure all dependencies are installed correctly
