# **Prompt Sui - Product Overview Document**

## **1. Product Overview**

**Prompt Sui** is a decentralized marketplace built on the Sui blockchain that enables prompt engineers to monetize their AI prompts while providing buyers with verification tools to test prompts before purchase. The platform supports both text and image prompts with cryptographic security and decentralized storage.

---

## **2. Core Features**

### **Feature Matrix**

| Feature | Description | Technical Implementation |
|---------|-------------|-------------------------|
| **Prompt Listing & Selling** | Create and list text/image prompts for sale with custom pricing | Sui smart contracts + Walrus storage |
| **Test Before Buying** | Execute prompts with custom inputs (rate-limited) | LLM Inference with custom user query|
| **ZK Login Integration** | Google login via zero-knowledge proofs | Mysten Labs ZK Login |
| **Decentralized Storage** | Store large prompts and images on Walrus | Walrus Protocol (blob storage) |
| **Secure Transactions** | Purchase prompts with automatic royalty distribution | Sui Pay + Escrow smart contracts |
| **Prompt Encryption** | Protect prompt content until purchase | SEAL Protocol encryption |
| **Global Marketplace** | Browse and filter prompts by category, AI model, rating | Indexer + Search API |

---

## **3. Technology Stack**

### **Blockchain & Protocol Layer**
- **Sui Blockchain**: High-performance Move-based chain for transactions and ownership
- **Walrus Protocol**: Decentralized blob storage for image prompts and large text prompts
- **Seal Protocol**: Cryptographic sealing/unsealing of prompt content
- **Atoma Network**: Decentralized AI inference for prompt testing and verification

### **Authentication & Identity**
- **Sui ZK Login**: Zero-knowledge proof authentication (Google OAuth)
- **Mysten Labs Wallet Kit**: Wallet connection and transaction signing

### **Frontend**
- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Responsive UI styling
- **Vercel**: Deployment and edge functions

### **Storage & Indexing**
- **Walrus Aggregators**: Primary storage for prompt data
- **PostgreSQL**: Off-chain metadata indexing for search/discovery
- **Redis**: Rate limiting for prompt testing

---

## **4. Sequence Diagrams**

### **Diagram 1: User Registration with ZK Login**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Google
    participant ZKProver as Mysten ZK Prover
    participant LocalStorage
    
    User->>Frontend: Click "Google ZK Login"
    Frontend->>Frontend: Generate randomness for salt
    Frontend->>Google: Redirect to OAuth (clientId + redirectURI)
    Google->>User: Request consent
    User->>Google: Authorize
    Google-->>Frontend: Return JWT token (encodedJwt)
    
    Frontend->>LocalStorage: Check for existing userSalt
    alt Salt exists
        LocalStorage-->>Frontend: Return stored salt
    else No salt
        Frontend->>Frontend: Generate new salt from randomness
        Frontend->>LocalStorage: Store userSalt
    end
    
    Frontend->>ZKProver: Send JWT + salt (prover-dev.mystenlabs.com)
    ZKProver->>ZKProver: Generate ZK proof
    ZKProver-->>Frontend: Return proof & Sui address
    
    Frontend->>Frontend: Store address in state
    Frontend-->>User: Login successful, redirect to /dashboard
```

### **Diagram 2: Prompt Creation & Listing**

```mermaid
sequenceDiagram
    participant Creator
    participant Frontend
    participant CoinGecko
    
    Creator->>Frontend: Navigate to /sell-prompt
    Frontend->>CoinGecko: GET SUI price (for USD to SUI conversion)
    CoinGecko-->>Frontend: Return current SUI price
    
    Creator->>Frontend: Fill prompt form (title, description, systemPrompt, userPrompt, price)
    Creator->>Frontend: Select category (prompt/premium-content/dataset)
    Creator->>Frontend: Select AI model (dall-e-3, dall-e-2, Llama, Mistral, Qwen)
    Creator->>Frontend: Set test price (max 10% of main price)
    Creator->>Frontend: Add sample inputs/outputs/images
    
    alt Image Prompt
        Creator->>Frontend: Enter preview image URL
        Frontend->>Frontend: Validate image size via HEAD request
    end
    
    Creator->>Frontend: Click "Submit"
    Frontend->>Frontend: Validate required fields
    Frontend->>Frontend: Check sample inputs/outputs exist
    Frontend->>Frontend: Show success toast
    Frontend->>Frontend: Navigate to /dashboard/my-prompts (after 2s delay)
```

### **Diagram 3: Prompt Testing Flow**

```mermaid
sequenceDiagram
    participant Buyer
    participant Frontend
    
    Buyer->>Frontend: Navigate to /prompt/:id
    Frontend->>Frontend: Load hardcoded mock prompt data (setTimeout 800ms)
    Frontend->>Frontend: Initialize remainingCredits = 5
    Frontend-->>Buyer: Display prompt details + test interface
    
    Buyer->>Frontend: Enter test input
    Buyer->>Frontend: Click "Test Prompt"
    
    Frontend->>Frontend: Validate input is not empty
    Frontend->>Frontend: Check remainingCredits > 0
    
    alt Credits available
        Frontend->>Frontend: Set testLoading = true
        Frontend->>Frontend: Wait 2 seconds (setTimeout)
        Frontend->>Frontend: Generate mock output: "/imagine prompt: {userInput}..."
        Frontend->>Frontend: Set hardcoded image URL
        Frontend->>Frontend: Decrement remainingCredits
        Frontend->>Frontend: Set testLoading = false
        Frontend->>Frontend: Show success toast
        Frontend-->>Buyer: Display mock output + remaining credits
    else No credits
        Frontend->>Frontend: Show error toast
        Frontend-->>Buyer: "Purchase more credits or buy this prompt"
    end
```

### **Diagram 4: Purchase & Instant Delivery**

```mermaid
sequenceDiagram
    participant Buyer
    participant Frontend
    
    Buyer->>Frontend: Click "Buy Prompt"
    Frontend->>Frontend: Check isWalletConnected state
    
    alt Wallet not connected
        Frontend->>Frontend: Show error toast
        Frontend-->>Buyer: "Please connect your SUI wallet first"
    else Wallet connected
        Frontend->>Frontend: Set purchaseLoading = true
        Frontend->>Frontend: Wait 1.5 seconds (setTimeout)
        Frontend->>Frontend: Set purchased = true
        Frontend->>Frontend: Set systemPrompt from mock data
        Frontend->>Frontend: Set purchaseLoading = false
        Frontend->>Frontend: Show success toast
        Frontend-->>Buyer: "You now have full access to this prompt"
        Frontend->>Frontend: Reveal system prompt in UI
    end
```

### **Diagram 5: Image Generation Flow**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant LLMService
    participant OpenAI
    
    User->>Frontend: Select image generation prompt
    User->>Frontend: Enter additional details/query
    User->>Frontend: Click "Generate Image"
    
    Frontend->>Backend: POST /api/v1/content/test_image_gen
    Note over Backend: {query, content_id, user_id,<br/>llm_model (dall-e-3/dall-e-2), llm_settings}
    
    Backend->>Database: Check if user purchased content
    Database-->>Backend: Return purchase status
    
    alt User has purchased
        Backend->>Database: Get content details
        Database-->>Backend: Return {prompt, description, llm_model, llm_settings}
        
        Backend->>LLMService: generate_image(query, model, settings, prompt, description)
        Note over LLMService: Combine: prompt + description + query
        
        LLMService->>OpenAI: generate_image(combined_prompt, dall-e model, settings)
        Note over OpenAI: DALL-E API generates image
        OpenAI-->>LLMService: Return image URL
        
        LLMService-->>Backend: Return image URL
        Backend-->>Frontend: {response: "image_url"}
        
        Frontend-->>User: Display generated image
    else User has not purchased
        Backend-->>Frontend: 403 Error - Not purchased
        Frontend-->>User: Show "Purchase required" message
    end
```

### **Diagram 6: Marketplace Browse & Search**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    
    User->>Frontend: Navigate to /marketplace
    Frontend->>Frontend: Initialize filters & search state
    Frontend->>Frontend: Load hardcoded samplePrompts array (12 prompts)
    Frontend->>Frontend: Wait 800ms (setTimeout)
    Frontend-->>User: Display prompt cards with infinite scroll
    
    alt User searches
        User->>Frontend: Enter search query
        User->>Frontend: Click "Search"
        Frontend->>Frontend: Filter samplePrompts by title/description
        Frontend->>Frontend: Wait 800ms (setTimeout)
        Frontend-->>User: Display filtered results
    end
    
    alt User applies filters
        User->>Frontend: Adjust filters (price, rating, models, categories, sortBy)
        Frontend->>Frontend: Reset page to 1
        Frontend->>Frontend: Filter samplePrompts client-side
        Frontend->>Frontend: Apply sorting (popular/newest/price/rating)
        Frontend->>Frontend: Wait 800ms (setTimeout)
        Frontend-->>User: Update displayed prompts
    end
    
    alt User scrolls to bottom
        Frontend->>Frontend: Intersection Observer triggers
        Frontend->>Frontend: Increment page number
        Frontend->>Frontend: Generate more prompts (duplicate with modified IDs)
        Frontend->>Frontend: Wait 800ms (setTimeout)
        Frontend-->>User: Append more prompts (max 5 pages)
    end
    
    User->>Frontend: Click on prompt card
    Frontend->>Frontend: Navigate to /prompt/:id
```

### **Diagram 7: Deposit-Based Test Purchase (Blockchain)**

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Wallet
    participant Sui
    participant Marketplace
    participant Seller
    
    Note over User,Seller: Step 1: Add Deposit
    User->>Frontend: Click "Add Deposit"
    Frontend->>Wallet: Request deposit transaction
    Wallet->>User: Show payment confirmation
    User->>Wallet: Approve deposit amount
    
    Wallet->>Sui: add_deposit(marketplace, payment, amount)
    Sui->>Marketplace: Check if user has existing deposit
    alt Existing deposit
        Marketplace->>Marketplace: Join balance to existing UserDeposit
    else New deposit
        Marketplace->>Marketplace: Create new UserDeposit object
        Marketplace->>Marketplace: Add to deposits table
    end
    Marketplace-->>Wallet: Emit DepositAdded event
    Wallet-->>Frontend: Transaction success
    Frontend-->>User: Show updated deposit balance
    
    Note over User,Seller: Step 2: Test Purchase
    User->>Frontend: Click "Test Prompt"
    Frontend->>Wallet: Request test_prompt transaction
    
    Wallet->>Sui: test_prompt(marketplace, prompt_id)
    Sui->>Marketplace: Validate prompt exists & is active
    Sui->>Marketplace: Check user deposit balance >= test_price
    Sui->>Marketplace: Check allowlist (if applicable)
    
    Marketplace->>Marketplace: Calculate platform fee (2%)
    Marketplace->>Marketplace: Split from deposit: fee + seller_amount
    Marketplace->>Marketplace: Add fee to vault
    Marketplace->>Seller: Transfer seller_amount
    Marketplace->>Marketplace: Grant access via allowlist
    Marketplace->>Marketplace: Increment purchases counter
    
    Marketplace-->>Wallet: Emit PromptBought event (access_type: 2)
    Wallet-->>Frontend: Transaction success
    Frontend-->>User: Grant test access to prompt
    
    Note over User,Seller: Step 3: Refund (Optional)
    User->>Frontend: Click "Refund Deposit"
    Frontend->>Wallet: Request refund transaction
    Wallet->>Sui: refund_deposit(marketplace, amount)
    Sui->>Marketplace: Check deposit balance >= amount
    Marketplace->>Marketplace: Split balance from UserDeposit
    Marketplace->>User: Transfer refund amount
    Marketplace-->>Wallet: Emit DepositRefunded event
    Wallet-->>Frontend: Transaction success
    Frontend-->>User: Show updated balance
```

---

## **6. API Endpoints**

### **Content Management**

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/content/add_text_completion` | Add new text completion prompt |
| **POST** | `/api/v1/content/add_image_generation` | Add new image generation prompt |
| **POST** | `/api/v1/content/search` | Search prompts with filters |
| **GET** | `/api/v1/content/get_content/{content_id}` | Get single prompt details |
| **GET** | `/api/v1/content/get_content_by_owner/{owner_id}` | Get all prompts by creator |
| **POST** | `/api/v1/content/purchase` | Purchase a prompt |
| **GET** | `/api/v1/content/list_model_names` | List available AI models |
| **POST** | `/api/v1/content/test_chat_completion` | Test text prompt (rate-limited) |
| **POST** | `/api/v1/content/test_image_gen` | Test image prompt (rate-limited) |
| **GET** | `/api/v1/content/total_sold/{content_id}` | Get total sales for a prompt |
| **GET** | `/api/v1/content/total_purchased/{user_id}` | Get user's total purchases |
| **GET** | `/api/v1/content/total_sold_by_user/{user_id}` | Get creator's total sales |
| **GET** | `/api/v1/content/n_items/{n}` | Get N recent items |

### **User Management**

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/v1/users/` | Create new user profile |
| **GET** | `/api/v1/users/{user_id}` | Get user profile details |
| **GET** | `/api/v1/users/{user_id}/purchases` | Get user's purchase history |

---



---

## **10. Contact & Resources**

- **Demo**: https://promptsui.vercel.app/
- **GitHub**: https://github.com/Abishkardhenga/p2p