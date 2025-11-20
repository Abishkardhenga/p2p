/**
 * Wallet-based Signer for SEAL
 * 
 * This creates a signer that uses the wallet's signing capabilities
 * instead of requiring the user to export their private key.
 */

import { Signer } from "@mysten/sui/cryptography";
import { SignatureScheme } from "@mysten/sui/cryptography";
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";

export interface WalletSignerOptions {
  address: string;
  publicKey: string; // Base64 encoded public key
  signMessage: (message: { message: Uint8Array }) => Promise<{ signature: string }>;
}

/**
 * A Signer implementation that uses wallet signing capabilities
 */
export class WalletSigner extends Signer {
  private address: string;
  private publicKey: Ed25519PublicKey;
  private signMessage: (message: { message: Uint8Array }) => Promise<{ signature: string }>;

  constructor(options: WalletSignerOptions) {
    super();
    this.address = options.address;
    
    // Decode and validate public key
    const publicKeyBytes = fromBase64(options.publicKey);
    if (publicKeyBytes.length !== 32) {
      throw new Error(`Invalid public key input. Expected 32 bytes, got ${publicKeyBytes.length}`);
    }
    
    this.publicKey = new Ed25519PublicKey(publicKeyBytes);
    this.signMessage = options.signMessage;
  }

  /**
   * Sign bytes using the wallet's signing capability
   */
  async sign(bytes: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
    const result = await this.signMessage({ message: bytes });
    // The signature is returned as base64, convert to Uint8Array
    const signature = fromBase64(result.signature);
    // Ensure it's an ArrayBuffer-backed Uint8Array
    return new Uint8Array(signature.buffer.slice(signature.byteOffset, signature.byteOffset + signature.byteLength));
  }

  /**
   * Get the Sui address for this signer
   */
  toSuiAddress(): string {
    return this.address;
  }

  /**
   * Get the key scheme (ED25519)
   */
  getKeyScheme(): SignatureScheme {
    return "ED25519";
  }

  /**
   * Get the public key
   */
  getPublicKey(): Ed25519PublicKey {
    return this.publicKey;
  }
}
