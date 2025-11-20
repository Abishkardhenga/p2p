import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useZKLogin } from "react-sui-zk-login-kit";
import { useCurrentAccount, ConnectButton, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/use-toast";
import { SealClient, SessionKey } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { getFullnodeUrl } from "@mysten/sui.js/client";
import { decryptData } from "@/utils/seal/decrypt";
import { Lock, Unlock, Loader2, AlertCircle } from "lucide-react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { WalletSigner } from "@/utils/seal/walletSigner";
import { toBase64, fromBase64 } from "@mysten/sui/utils";

// Helper function to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// SEAL Configuration
const PACKAGE_ID = "0x71ac54b16bcfcb9ee4eadc343206885c816a79f0fe4621cf78dd028c65325818";
const KEY_SERVER_LIST_TESTNET = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

const SealEncryption = () => {
  const { address } = useZKLogin();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { toast } = useToast();
  
  // Determine which wallet is connected
  const isZKLoginConnected = !!address;
  const isWalletConnected = !!currentAccount?.address;

  const [message, setMessage] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [bottleId, setBottleId] = useState("");
  const [encryptedData, setEncryptedData] = useState<Uint8Array | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [useWalletSigning, setUseWalletSigning] = useState(false); // Default to Private Key (more reliable)
  const [privateKey, setPrivateKey] = useState("");
  const [encryptedDataInput, setEncryptedDataInput] = useState(""); // For pasting encrypted data
  const [newRecipientAddress, setNewRecipientAddress] = useState("");
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [fetchedEncryptedData, setFetchedEncryptedData] = useState<Uint8Array | null>(null);
  const [showAdvancedDecrypt, setShowAdvancedDecrypt] = useState(false);

  // Debug wallet connection state
  useEffect(() => {
    console.log("Wallet connection state:", {
      isZKLoginConnected,
      isWalletConnected,
      zkLoginAddress: address,
      walletAddress: currentAccount?.address,
    });
  }, [isZKLoginConnected, isWalletConnected, address, currentAccount]);

  // Initialize clients - MUST use testnet for SEAL
  const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
  const sealClient = new SealClient({
    suiClient: suiClient as any,
    serverConfigs: KEY_SERVER_LIST_TESTNET.map((id: string) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: true,
  });

  // Check if wallet is on the correct network
  useEffect(() => {
    if (isWalletConnected) {
      // Note: The wallet might be on devnet while SEAL requires testnet
      // This could cause transaction failures
      console.log("⚠️ Make sure your wallet is connected to TESTNET");
    }
  }, [isWalletConnected]);

  const handleEncrypt = async () => {
    const walletAddress = address || currentAccount?.address;

    if (!message.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message to encrypt",
        variant: "destructive",
      });
      return;
    }

    // If no recipient specified, require wallet connection or recipient address
    if (!recipientAddress.trim() && !walletAddress) {
      toast({
        title: "Recipient Required",
        description: "Please connect your wallet or enter a recipient address",
        variant: "destructive",
      });
      return;
    }

    // If no recipient specified, use sender's address (encrypt for yourself)
    const finalRecipient = recipientAddress.trim() || walletAddress!;

    setIsEncrypting(true);
    const isEncryptingForSelf = walletAddress && finalRecipient === walletAddress;
    
    try {
      // Use backend default account for encryption (no wallet approval needed!)
      toast({
        title: "Starting Encryption",
        description: "Encrypting with backend account... No approval needed!",
      });

      // Import the backend service
      const { BackendSealService } = await import("@/services/seal.service");
      const backendService = new BackendSealService(getFullnodeUrl("testnet"));

      toast({
        title: "Encrypting Message",
        description: "Backend is handling 3 transactions automatically...",
      });

      // Use quick mode for single transaction
      const { bottleId: newBottleId, encryptedData: encrypted } = 
        await backendService.encryptPromptQuick(message, finalRecipient);

      setBottleId(newBottleId);
      setEncryptedData(encrypted);

      const successMessage = isEncryptingForSelf
        ? `Message encrypted for yourself! Bottle: ${newBottleId.slice(0, 8)}...`
        : `Message encrypted and sent to recipient! Bottle: ${newBottleId.slice(0, 8)}...`;

      toast({
        title: "Success! ✨",
        description: successMessage,
      });
    } catch (error: any) {
      console.error("Encryption error:", error);
      toast({
        title: "Encryption Failed",
        description: error.message || "Failed to encrypt message",
        variant: "destructive",
      });
    } finally {
      setIsEncrypting(false);
    }
  };


  const handleFetchEncryptedData = async () => {
    if (!bottleId.trim()) {
      toast({
        title: "No Bottle ID",
        description: "Please enter a bottle ID to fetch data",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingData(true);
    try {
      toast({
        title: "Fetching Data",
        description: "Retrieving encrypted data from blockchain...",
      });

      // Fetch the bottle object from blockchain
      const bottleObject = await suiClient.getObject({
        id: bottleId,
        options: {
          showContent: true,
        },
      });

      console.log("Bottle object:", bottleObject);

      if (!bottleObject.data) {
        throw new Error("Bottle not found on blockchain");
      }

      // Extract encrypted data from the bottle
      const content = bottleObject.data.content;
      console.log("Bottle content:", content);
      
      if (content && 'fields' in content) {
        const fields = content.fields as any;
        console.log("Bottle fields:", fields);
        console.log("Available field names:", Object.keys(fields));

        // The encrypted data should be in one of these fields
        let encryptedBytes: Uint8Array | null = null;
        let foundField: string | null = null;

        // Try different possible field names
        const possibleFields = ['message', 'data', 'encrypted_data', 'encrypted_message', 'content', 'bytes'];
        
        for (const fieldName of possibleFields) {
          if (fields[fieldName]) {
            console.log(`Found data in field: ${fieldName}`, fields[fieldName]);
            try {
              // Handle different data formats
              if (Array.isArray(fields[fieldName])) {
                encryptedBytes = new Uint8Array(fields[fieldName]);
              } else if (fields[fieldName].bytes) {
                encryptedBytes = new Uint8Array(fields[fieldName].bytes);
              } else if (typeof fields[fieldName] === 'string') {
                // Try to decode if it's a string
                encryptedBytes = fromBase64(fields[fieldName]);
              } else {
                encryptedBytes = new Uint8Array(fields[fieldName]);
              }
              foundField = fieldName;
              break;
            } catch (e) {
              console.log(`Failed to parse field ${fieldName}:`, e);
              continue;
            }
          }
        }

        if (encryptedBytes && encryptedBytes.length > 0) {
          setFetchedEncryptedData(encryptedBytes);
          setEncryptedData(encryptedBytes);
          toast({
            title: "Success!",
            description: `Fetched ${encryptedBytes.length} bytes from field '${foundField}'`,
          });
        } else {
          const availableFields = Object.keys(fields).join(", ");
          console.error("Could not find encrypted data. Available fields:", availableFields);
          console.error("Field values:", fields);
          throw new Error(`Could not find encrypted data in bottle. Available fields: ${availableFields}. Please check console for details.`);
        }
      } else {
        console.error("Bottle content:", content);
        throw new Error("Bottle has no content or unexpected format");
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Failed to Fetch Data",
        description: error.message || "Could not retrieve encrypted data from blockchain",
        variant: "destructive",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleAddRecipient = async () => {
    if (!bottleId.trim()) {
      toast({
        title: "No Bottle ID",
        description: "Please enter a bottle ID",
        variant: "destructive",
      });
      return;
    }

    if (!newRecipientAddress.trim()) {
      toast({
        title: "No Recipient Address",
        description: "Please enter a recipient address",
        variant: "destructive",
      });
      return;
    }

    setIsAddingRecipient(true);
    try {
      toast({
        title: "Adding Recipient",
        description: "Backend is adding recipient automatically...",
      });

      // Import the backend service
      const { BackendSealService } = await import("@/services/seal.service");
      const backendService = new BackendSealService(getFullnodeUrl("testnet"));

      // Add recipient using backend account
      await backendService.addRecipientToBottle(bottleId, newRecipientAddress);

      toast({
        title: "Success!",
        description: `Recipient ${newRecipientAddress.slice(0, 8)}... added to bottle`,
      });
      
      // Clear the input
      setNewRecipientAddress("");
    } catch (error: any) {
      console.error("Add recipient error:", error);
      
      // Check for specific error types
      let errorMessage = error.message || "Failed to add recipient";
      
      if (error.message?.includes("MoveAbort") || error.message?.includes("abort") || error.message?.includes("ENoAccess")) {
        errorMessage = "Only bottles created by the backend account can have recipients added. This bottle was created by a different account.";
      } else if (error.message?.includes("not found")) {
        errorMessage = "Bottle not found. Please check the Bottle ID.";
      } else if (error.message?.includes("insufficient")) {
        errorMessage = "Backend account has insufficient gas. Please fund the backend account.";
      } else if (error.message?.includes("EDuplicate")) {
        errorMessage = "This recipient has already been added to the bottle.";
      }
      
      toast({
        title: "Failed to Add Recipient",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleDecrypt = async () => {
    const walletAddress = address || currentAccount?.address;
    
    if (!walletAddress) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    if (!bottleId.trim()) {
      toast({
        title: "No Bottle ID",
        description: "Please enter a bottle ID to decrypt",
        variant: "destructive",
      });
      return;
    }

    // Try to get encrypted data from state, fetched data, or input
    let dataToDecrypt = encryptedData || fetchedEncryptedData;
    
    if (!dataToDecrypt && encryptedDataInput.trim()) {
      // Parse encrypted data from input
      try {
        // Try base64
        dataToDecrypt = fromBase64(encryptedDataInput.trim());
      } catch (e) {
        try {
          // Try hex
          const cleanHex = encryptedDataInput.trim().startsWith("0x") 
            ? encryptedDataInput.trim().slice(2) 
            : encryptedDataInput.trim();
          dataToDecrypt = hexToBytes(cleanHex);
        } catch (e2) {
          toast({
            title: "Invalid Encrypted Data",
            description: "Please provide valid encrypted data (base64 or hex)",
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    // If still no data, try to fetch from blockchain
    if (!dataToDecrypt) {
      toast({
        title: "Fetching Encrypted Data",
        description: "Retrieving data from blockchain...",
      });

      try {
        // Fetch the bottle object from blockchain
        const bottleObject = await suiClient.getObject({
          id: bottleId,
          options: {
            showContent: true,
          },
        });

        if (!bottleObject.data) {
          throw new Error("Bottle not found on blockchain");
        }

        // Extract encrypted data from the bottle
        const content = bottleObject.data.content;
        
        console.log("📦 Bottle content type:", content?.dataType);
        console.log("📦 Bottle content:", content);
        
        if (content && 'fields' in content) {
          const fields = content.fields as any;
          console.log("📦 Auto-fetch - Bottle fields:", fields);
          console.log("📦 Available field names:", Object.keys(fields));

          // Try different possible field names
          const possibleFields = ['message', 'data', 'encrypted_data', 'encrypted_message', 'content', 'bytes'];
          
          for (const fieldName of possibleFields) {
            if (fields[fieldName]) {
              console.log(`📦 Found field: ${fieldName}`, fields[fieldName]);
              try {
                // Handle different data formats
                if (Array.isArray(fields[fieldName])) {
                  console.log(`📦 Parsing ${fieldName} as array`);
                  dataToDecrypt = new Uint8Array(fields[fieldName]);
                } else if (fields[fieldName].bytes) {
                  console.log(`📦 Parsing ${fieldName}.bytes`);
                  dataToDecrypt = new Uint8Array(fields[fieldName].bytes);
                } else if (typeof fields[fieldName] === 'string') {
                  console.log(`📦 Parsing ${fieldName} as base64 string`);
                  dataToDecrypt = fromBase64(fields[fieldName]);
                } else {
                  console.log(`📦 Parsing ${fieldName} as Uint8Array`);
                  dataToDecrypt = new Uint8Array(fields[fieldName]);
                }
                console.log(`✅ Successfully parsed ${fieldName}, size: ${dataToDecrypt.length} bytes`);
                break;
              } catch (e) {
                console.warn(`⚠️ Failed to parse ${fieldName}:`, e);
                continue;
              }
            }
          }

          if (dataToDecrypt && dataToDecrypt.length > 0) {
            setFetchedEncryptedData(dataToDecrypt);
            toast({
              title: "Data Fetched",
              description: `Retrieved ${dataToDecrypt.length} bytes from blockchain`,
            });
          } else {
            throw new Error("Could not find encrypted data in bottle. Available fields: " + Object.keys(fields).join(", "));
          }
        } else {
          throw new Error("Bottle has no content");
        }
      } catch (error: any) {
        console.error("Auto-fetch error:", error);
        toast({
          title: "Failed to Fetch Data",
          description: error.message || "Could not retrieve encrypted data. Please use 'Fetch Data' button or paste data manually.",
          variant: "destructive",
        });
        setIsDecrypting(false);
        return;
      }
    }

    if (!useWalletSigning && !privateKey.trim()) {
      toast({
        title: "Private Key Required",
        description: "Please enter your private key or switch to wallet signing",
        variant: "destructive",
      });
      return;
    }

    setIsDecrypting(true);
    try {
      let signer: any;

      if (useWalletSigning) {
        // Use wallet signing
        if (!currentAccount) {
          toast({
            title: "Wallet Not Connected",
            description: "Please connect your Sui wallet to use wallet signing",
            variant: "destructive",
          });
          setIsDecrypting(false);
          return;
        }

        toast({
          title: "Wallet Signing",
          description: "You'll be asked to sign a message with your wallet...",
        });

        // Get public key from wallet
        console.log("Current account:", currentAccount);
        console.log("Account keys:", currentAccount.chains, currentAccount.features);
        
        // Try to get public key - it might be in different places depending on wallet
        let publicKeyBytes: Uint8Array | undefined;
        
        if (currentAccount.publicKey && currentAccount.publicKey.length > 0) {
          publicKeyBytes = new Uint8Array(currentAccount.publicKey);
        } else {
          // Fallback: try to get from chains
          const suiChain = currentAccount.chains.find((c: any) => c.includes('sui'));
          console.log("Sui chain:", suiChain);
          
          toast({
            title: "Public Key Not Available",
            description: "Your wallet doesn't expose the public key. Please use the Private Key method instead.",
            variant: "destructive",
          });
          setIsDecrypting(false);
          return;
        }
        
        console.log("Public key bytes length:", publicKeyBytes.length);
        
        if (publicKeyBytes.length !== 32) {
          toast({
            title: "Invalid Public Key",
            description: `Expected 32 bytes, got ${publicKeyBytes.length}. Please use the Private Key method.`,
            variant: "destructive",
          });
          setIsDecrypting(false);
          return;
        }

        const publicKeyBase64 = toBase64(publicKeyBytes);
        console.log("Public key base64:", publicKeyBase64);

        // Create wallet signer
        signer = new WalletSigner({
          address: walletAddress,
          publicKey: publicKeyBase64,
          signMessage: async (msg) => {
            const result = await signPersonalMessage({ message: msg.message });
            return { signature: result.signature };
          },
        });

        toast({
          title: "Creating Session Key",
          description: "Generating decryption key...",
        });
      } else {
        // Use private key
        toast({
          title: "Creating Session Key",
          description: "Generating decryption key from private key...",
        });

        // Create keypair from private key
        let keypair: Ed25519Keypair;
        try {
          // Try Bech32 format first (suiprivkey1...)
          if (privateKey.startsWith("suiprivkey")) {
            keypair = Ed25519Keypair.fromSecretKey(privateKey);
          } else if (privateKey.startsWith("0x") || /^[0-9a-fA-F]+$/.test(privateKey)) {
            // Try hex format
            const cleanKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
            const keyBytes = hexToBytes(cleanKey);
            keypair = Ed25519Keypair.fromSecretKey(keyBytes);
          } else {
            // Try base64 format
            const keyBytes = fromBase64(privateKey);
            keypair = Ed25519Keypair.fromSecretKey(keyBytes);
          }
        } catch (e: any) {
          throw new Error(`Invalid private key format: ${e.message}. Supported formats: Bech32 (suiprivkey1...), Hex (0x... or without), Base64`);
        }

        // Verify the address matches
        const derivedAddress = keypair.toSuiAddress();
        if (derivedAddress !== walletAddress) {
          toast({
            title: "Address Mismatch",
            description: `Private key address (${derivedAddress.slice(0, 8)}...) doesn't match wallet address (${walletAddress.slice(0, 8)}...)`,
            variant: "destructive",
          });
          setIsDecrypting(false);
          return;
        }

        signer = keypair;
      }

      // Create session key
      console.log("🔑 Creating session key for address:", walletAddress);
      const sessionKey = await SessionKey.create({
        address: walletAddress,
        packageId: PACKAGE_ID,
        ttlMin: 10,
        signer: signer,
        suiClient,
      });
      console.log("✅ Session key created successfully");

      toast({
        title: "Decrypting",
        description: "Decrypting your message...",
      });

      console.log("🔓 Starting decryption with bottle ID:", bottleId);
      console.log("🔓 Encrypted data size:", dataToDecrypt?.length, "bytes");

      // Decrypt data
      const decrypted = await decryptData(
        sessionKey,
        PACKAGE_ID,
        suiClient,
        sealClient,
        bottleId,
        dataToDecrypt
      );

      if (decrypted) {
        console.log("✅ Decryption successful, size:", decrypted.length, "bytes");
        const decryptedText = new TextDecoder().decode(decrypted);
        console.log("📝 Decrypted text:", decryptedText);
        setDecryptedMessage(decryptedText);
        toast({
          title: "Success! 🎉",
          description: "Message decrypted successfully",
        });
      } else {
        console.warn("⚠️ Decryption returned null/empty");
        toast({
          title: "Decryption Failed",
          description: "You may not have access to this message",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Decryption error:", error);
      console.error("Error stack:", error.stack);
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt message",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">SEAL Encryption</h1>
            <p className="text-muted-foreground">
              Encrypt and decrypt messages using Sui Encrypted Access Layer
            </p>
            {(address || currentAccount?.address) && (
              <p className="text-sm text-muted-foreground">
                Connected: {(address || currentAccount?.address)?.slice(0, 6)}...
                {(address || currentAccount?.address)?.slice(-4)}
              </p>
            )}
          </div>

          {/* Network Warning */}
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    ⚠️ Network Requirement: TESTNET
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    This SEAL package is deployed on <strong>Sui Testnet</strong>. 
                    Make sure your wallet is connected to <strong>Testnet</strong>, not Devnet or Mainnet.
                    If you get a "package not found" error, switch your wallet network to Testnet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Connection Card */}
          {!isWalletConnected && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Wallet Connection (Optional for Encryption)
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        You can encrypt messages without connecting a wallet! Encryption uses a backend account.
                        Connect your wallet only if you want to specify yourself as the recipient or decrypt messages.
                      </p>
                    </div>
                    <div className="flex justify-start">
                      <ConnectButton />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Notice */}
          {isWalletConnected && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Wallet Connected ✓
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      You can now decrypt messages and specify yourself as recipient when encrypting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Encryption Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Encrypt Message
              </CardTitle>
              <CardDescription>
                Create an encrypted message that only the recipient can decrypt
              </CardDescription>
              <div className="mt-2">
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-md">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    ✨ <strong>No wallet approval needed!</strong> Encryption is handled automatically using a backend account.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter your secret message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isEncrypting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient" className="flex items-center gap-2">
                  Recipient Address
                  <span className="text-xs text-muted-foreground font-normal">
                    (Optional - defaults to your address)
                  </span>
                </Label>
                <Input
                  id="recipient"
                  placeholder="0x... (leave empty to encrypt for yourself)"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={isEncrypting}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to encrypt a message for yourself, or enter another address to send to someone else.
                </p>
              </div>

              <Button
                onClick={handleEncrypt}
                disabled={isEncrypting}
                className="w-full"
              >
                {isEncrypting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Encrypting...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt Data (No Approval Needed!)
                  </>
                )}
              </Button>

              {bottleId && (
                <div className="p-4 bg-muted rounded-md space-y-3">
                  <div>
                    <p className="text-sm font-medium">Bottle ID:</p>
                    <p className="text-xs font-mono break-all">{bottleId}</p>
                  </div>
                  {encryptedData && (
                    <div>
                      <p className="text-sm font-medium">Encrypted Data (for sharing):</p>
                      <p className="text-xs font-mono break-all">{toBase64(encryptedData)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Share this with the recipient along with the Bottle ID
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decryption Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Unlock className="w-5 h-5" />
                Decrypt Message
              </CardTitle>
              <CardDescription>
                Decrypt a message if you are the authorized recipient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bottleId">Bottle ID</Label>
                <Input
                  id="bottleId"
                  placeholder="0x..."
                  value={bottleId}
                  onChange={(e) => setBottleId(e.target.value)}
                  disabled={isDecrypting || isFetchingData}
                />
                <p className="text-xs text-muted-foreground">
                  Enter Bottle ID - encrypted data will be fetched automatically when you decrypt
                </p>
              </div>

              {fetchedEncryptedData && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    ✅ Encrypted data fetched from blockchain ({fetchedEncryptedData.length} bytes)
                  </p>
                </div>
              )}

              {/* Advanced Options Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedDecrypt(!showAdvancedDecrypt)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {showAdvancedDecrypt ? "▼" : "▶"} Advanced Options
                </button>
              </div>

              {showAdvancedDecrypt && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                  <div className="space-y-2">
                    <Label className="text-sm">Manual Fetch (Optional)</Label>
                    <Button
                      type="button"
                      onClick={handleFetchEncryptedData}
                      disabled={!bottleId.trim() || isFetchingData || isDecrypting}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isFetchingData ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Fetch Data from Blockchain"
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Preview encrypted data before decrypting
                    </p>
                  </div>

                  {!encryptedData && !fetchedEncryptedData && (
                    <div className="space-y-2">
                      <Label htmlFor="encryptedDataInput" className="text-sm">
                        Or Paste Encrypted Data
                      </Label>
                      <Input
                        id="encryptedDataInput"
                        placeholder="Paste encrypted data (base64 or hex)"
                        value={encryptedDataInput}
                        onChange={(e) => setEncryptedDataInput(e.target.value)}
                        disabled={isDecrypting}
                      />
                      <p className="text-xs text-muted-foreground">
                        For offline decryption or if auto-fetch fails
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Signing Method Toggle */}
              <div className="space-y-3">
                <Label>Signing Method</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!useWalletSigning ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseWalletSigning(false)}
                    disabled={isDecrypting}
                    className="flex-1"
                  >
                    Private Key (Recommended)
                  </Button>
                  <Button
                    type="button"
                    variant={useWalletSigning ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseWalletSigning(true)}
                    disabled={isDecrypting}
                    className="flex-1"
                  >
                    Wallet Signing (Beta)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {useWalletSigning
                    ? "⚠️ Wallet signing may not work with all wallets. Most wallets don't expose the public key."
                    : "✅ Private Key method is reliable and works with all wallets. Your key is processed locally only."}
                </p>
              </div>

              {!useWalletSigning && (
                <div className="space-y-2">
                  <Label htmlFor="privateKey" className="flex items-center gap-2">
                    Private Key
                    <span className="text-xs text-muted-foreground font-normal">
                      (Never shared, used locally only)
                    </span>
                  </Label>
                  <Input
                    id="privateKey"
                    type="password"
                    placeholder="suiprivkey1... or 0x... or base64"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    disabled={isDecrypting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports: Bech32 (suiprivkey1...), Hex (0x...), or Base64. Processed locally only.
                  </p>
                </div>
              )}

              <Button
                onClick={handleDecrypt}
                disabled={isDecrypting || (!address && !currentAccount?.address) || !bottleId.trim()}
                className="w-full"
                variant="secondary"
              >
                {isDecrypting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Decrypt
                  </>
                )}
              </Button>

              {decryptedMessage && (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md space-y-2">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Decrypted Message:
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {decryptedMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Recipient Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Add Recipient to Existing Bottle
              </CardTitle>
              <CardDescription>
                Authorize an additional recipient to decrypt an existing message
              </CardDescription>
              <div className="mt-2">
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-md">
                  <p className="text-xs text-green-800 dark:text-green-200">
                    ✨ <strong>No wallet approval needed!</strong> Backend handles this automatically.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="existingBottleId">Bottle ID</Label>
                <Input
                  id="existingBottleId"
                  placeholder="0x..."
                  value={bottleId}
                  onChange={(e) => setBottleId(e.target.value)}
                  disabled={isAddingRecipient}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRecipient">New Recipient Address</Label>
                <Input
                  id="newRecipient"
                  placeholder="0x..."
                  value={newRecipientAddress}
                  onChange={(e) => setNewRecipientAddress(e.target.value)}
                  disabled={isAddingRecipient}
                />
              </div>

              <Button
                onClick={handleAddRecipient}
                disabled={isAddingRecipient}
                className="w-full"
                variant="outline"
              >
                {isAddingRecipient ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Recipient...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Add Recipient (No Approval Needed!)
                  </>
                )}
              </Button>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  ℹ️ <strong>Backend Account Only:</strong> You can only add recipients to bottles created by the backend account. 
                  Bottles created by user wallets cannot be modified here.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Encryption Process (Automated):</p>
              <p>
                1. <strong>Backend Encryption:</strong> A backend account automatically creates a bottle, encrypts your message, and sets the recipient
              </p>
              <p>
                2. <strong>No Approvals Needed:</strong> Everything happens in one transaction using the backend account
              </p>
              <p>
                3. <strong>Instant Delivery:</strong> The encrypted message is ready immediately for the recipient
              </p>
              <p className="pt-2 font-medium text-foreground">Decryption Process:</p>
              <p>
                4. <strong>Decrypt:</strong> The recipient exports their private key from wallet to create a session key
              </p>
              <p className="pt-2 text-xs">
                <strong>How to export your private key:</strong>
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li><strong>Sui Wallet:</strong> Settings → Export Private Key</li>
                <li><strong>Suiet:</strong> Settings → Export Private Key</li>
                <li>Copy the key and paste it in the Private Key field above</li>
              </ul>
              <p className="pt-2 text-xs">
                <strong>Security Notes:</strong>
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>Encryption uses threshold cryptography for enhanced security</li>
                <li>Private keys are processed locally and never sent to any server</li>
                <li>Session keys are temporary (10 minutes TTL)</li>
                <li>Only authorized recipients can decrypt messages</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SealEncryption;
