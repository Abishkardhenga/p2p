# SEAL Encryption Utilities

This folder contains utility functions for SEAL (Sui Encrypted Access Layer) encryption and decryption.

## Installation

Before using these utilities, install the required dependency:

```bash
npm install @mysten/seal
# or
yarn add @mysten/seal
# or
bun add @mysten/seal
```

## Available Functions

### encrypt.ts
- `encryptData()` - Encrypts data using SEAL encryption with threshold cryptography

### decrypt.ts
- `decryptData()` - Decrypts SEAL-encrypted data with access control verification

### createWhitelist.ts
- `createBottle()` - Creates a new bottle for storing encrypted messages
- `putMessageInBottle()` - Stores encrypted data in a bottle
- `setRecipient()` - Sets the authorized recipient for a bottle

## Usage Example

```typescript
import { 
  encryptData, 
  decryptData, 
  createBottle, 
  putMessageInBottle, 
  setRecipient 
} from '@/utils/seal';
import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';

// Initialize clients
const suiClient = new SuiClient({ url: 'YOUR_RPC_URL' });
const sealClient = new SealClient({ /* config */ });

// Create a bottle
const bottleId = await createBottle(packageId, suiClient, keypair);

// Encrypt data
const data = new TextEncoder().encode('Secret message');
const encryptedObject = await encryptData(packageId, sealClient, bottleId, data);

// Store in bottle
await putMessageInBottle(packageId, suiClient, keypair, bottleId, encryptedObject);

// Set recipient
await setRecipient(packageId, suiClient, keypair, bottleId, recipientAddress);

// Decrypt (by authorized recipient)
const decryptedData = await decryptData(
  sessionKey,
  packageId,
  suiClient,
  sealClient,
  bottleId,
  encryptedObject
);
```

## Notes

- All functions are properly typed with TypeScript
- Error handling is built into the decrypt function
- The encryption uses threshold cryptography (threshold: 2)
- Access control is enforced through the SEAL protocol
