// SPDX-License-Identifier: Apache-2.0

module walrus::ai_marketplace { 

    use std::string::{String, utf8};
    use std::option::{Option, some, none};
    use sui::object::{Self, ID, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::sui::SUI;
    use std::vector;
    use walrus::utils::is_prefix;
    use sui::dynamic_field as df;

    const EPromptNotFound: u64 = 0;
    const EAlreadyPurchased: u64 = 1;
    const EInsufficientDeposit: u64 = 2;
    const ENotAllowed: u64 = 3;
    const EInvalidFee: u64 = 4;
    const EPromptNotActive: u64 = 5;
    const EAllowlistRestricted: u64 = 6;
    const EInvalidCap: u64 = 7;
    const ENoAccess: u64 = 8;
    const EDuplicate: u64 = 9;
    const MARKER: u64 = 10;

    /// Prompt structure
    public struct Prompt has key, store {
        id: UID,
        owner: address,
        metadata_uri: String,       // URI pointing to Walrus stored user prompt & images
        encrypted_prompt_uri: String, // URI pointing to Seal encrypted system prompt
        price: u64,         // One-time purchase price
        test_price: u64,    // Test access price
        allowlist_id: Option<ID>,   // Optional allowlist for restricting access
        is_active: bool,
        created_at: u64,
        purchases: u64,             // Number of purchases (stats)
    }

    /// User deposits
    public struct UserDeposit has key, store {
        id: UID,
        owner: address,
        amount: Balance<SUI>,
    }

    /// Marketplace object
    public struct Marketplace has key {
        id: UID,
        owner: address,
        platform_fee_bps: u64,      // In basis points (e.g. 200 = 2%)
        vault: Balance<SUI>,
        prompts: Table<ID, Prompt>,
        deposits: Table<address, UserDeposit>,
        allowlists: Table<ID, Allowlist>,
        /// Store prompt IDs for enumeration
        prompt_ids: vector<ID>,
    }

    /// Events for logging
    public struct PromptListed has copy, drop {
        prompt_id: ID,
        owner: address,
        price: u64,
        test_price: u64,
    }

    public struct PromptBought has copy, drop {
        prompt_id: ID,
        buyer: address,
        access_type: u8,
        price_paid: u64,
    }

    public struct DepositAdded has copy, drop {
        user: address,
        amount: u64,
    }

    public struct DepositRefunded has copy, drop {
        user: address,
        amount: u64,
    }

    /// Allowlist structure
    public struct Allowlist has key, store {
        id: UID,
        name: String,
        list: vector<address>,
    }

    /// Cap structure
    public struct Cap has key {
        id: UID,
        allowlist_id: ID,
    }

    fun init(ctx: &mut TxContext){
        let id = object::new(ctx);
        let owner = tx_context::sender(ctx);
        
        let market_place = Marketplace { 
            id,
            owner,
            platform_fee_bps: 200,
            vault: balance::zero<SUI>(),
            prompts: table::new(ctx),
            deposits: table::new(ctx),
            allowlists: table::new(ctx),
            prompt_ids: vector::empty(),
        };

        transfer::share_object(market_place);

    }

    ///////////////////////// Initialization ////////////////////////////

    /// Initialize a new marketplace with the given owner and default platform fee_amount

    ///////////////////////// Prompt Listing ////////////////////////////

    public entry fun list_prompt(
        marketplace: &mut Marketplace,
        metadata_uri: vector<u8>,
        encrypted_prompt_uri: vector<u8>,
        price: u64,
        test_price: u64,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let prompt_id = object::new(ctx);
        let prompt_id_inner = object::uid_to_inner(&prompt_id);
        
        let prompt = Prompt {
            id: prompt_id,
            owner,
            metadata_uri: utf8(metadata_uri),
            encrypted_prompt_uri: utf8(encrypted_prompt_uri),
            price,
            test_price,
            allowlist_id: option::none(),
            is_active: true,
            created_at: tx_context::epoch(ctx),
            purchases: 0,
        };
        
        table::add(&mut marketplace.prompts, prompt_id_inner, prompt);
        
        event::emit(PromptListed {
            prompt_id: prompt_id_inner,
            owner,
            price,
            test_price,
        });
        
        // Record prompt ID for enumeration
        vector::push_back(&mut marketplace.prompt_ids, prompt_id_inner);
    }

    ///////////////////////// One-time Purchase ////////////////////////////

    public entry fun buy_prompt(
        marketplace: &mut Marketplace,
        prompt_id: ID,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        
        // Get prompt details
        assert!(table::contains(&marketplace.prompts, prompt_id), EPromptNotFound);
        let prompt = table::borrow_mut(&mut marketplace.prompts, prompt_id);
        assert!(prompt.is_active, EPromptNotActive);
        
        // Check price
        let price = prompt.price;
        
        // Check payment amount
        assert!(coin::value(payment) >= price, EInsufficientDeposit);
        
        // Check allowlist
        if (option::is_some(&prompt.allowlist_id)) {
            let allowlist_id = *option::borrow(&prompt.allowlist_id);
            let allowlist = table::borrow(&marketplace.allowlists, allowlist_id);
            assert!(approve_internal(buyer, prompt.id.to_bytes(), allowlist), EAllowlistRestricted);
        };
        
        // Calculate platform fee (2%)
        let fee_amount = price * marketplace.platform_fee_bps / 10000;
        let seller_amount = price - fee_amount;
        
        // Process payments
        let fee_coin = coin::split(payment, fee_amount, ctx);
        let seller_coin = coin::split(payment, seller_amount, ctx);
        
        // Add fee to platform vault
        coin::put(&mut marketplace.vault, fee_coin);
        
        // Send payment to seller
        transfer::public_transfer(seller_coin, prompt.owner);
        
        // Grant access via allowlist
        if (option::is_some(&prompt.allowlist_id)) {
            let lid = *option::borrow(&prompt.allowlist_id);
            let al = table::borrow_mut(&mut marketplace.allowlists, lid);
            if (!al.list.contains(&buyer)) { al.list.push_back(buyer); }
        };
        
        // Update statistics
        prompt.purchases = prompt.purchases + 1;
        
        // Emit event
        event::emit(PromptBought {
            prompt_id,
            buyer,
            access_type: 1,
            price_paid: price,
        });
    }

    ///////////////////////// Deposit Handling ////////////////////////////

    public entry fun add_deposit(
        marketplace: &mut Marketplace,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check payment amount
        assert!(coin::value(payment) >= amount, EInsufficientDeposit);
        
        // Extract payment
        let deposit_coin = coin::split(payment, amount, ctx);
        let deposit_balance = coin::into_balance(deposit_coin);
        
        // Add to user's deposit
        if (table::contains(&marketplace.deposits, sender)) {
            let user_deposit = table::borrow_mut(&mut marketplace.deposits, sender);
            balance::join(&mut user_deposit.amount, deposit_balance);
        } else {
            let deposit_id = object::new(ctx);
            let user_deposit = UserDeposit {
                id: deposit_id,
                owner: sender,
                amount: deposit_balance,
            };
            table::add(&mut marketplace.deposits, sender, user_deposit);
        };
        
        // Emit event
        event::emit(DepositAdded {
            user: sender,
            amount,
        });
    }

    ///////////////////////// Test Purchase (Deposit Based) ////////////////////////////

    public entry fun test_prompt(
        marketplace: &mut Marketplace,
        prompt_id: ID,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        
        // Get prompt details
        assert!(table::contains(&marketplace.prompts, prompt_id), EPromptNotFound);
        let prompt = table::borrow_mut(&mut marketplace.prompts, prompt_id);
        assert!(prompt.is_active, EPromptNotActive);
        
        // Check test price
        let test_price = prompt.test_price;
        
        // Check user deposit
        assert!(table::contains(&marketplace.deposits, buyer), EInsufficientDeposit);
        let user_deposit = table::borrow_mut(&mut marketplace.deposits, buyer);
        assert!(balance::value(&user_deposit.amount) >= test_price, EInsufficientDeposit);
        
        // Check allowlist
        if (option::is_some(&prompt.allowlist_id)) {
            let allowlist_id = *option::borrow(&prompt.allowlist_id);
            let allowlist = table::borrow(&marketplace.allowlists, allowlist_id);
            assert!(approve_internal(buyer, prompt.id.to_bytes(), allowlist), EAllowlistRestricted);
        };
        
        // Calculate platform fee (2%)
        let fee_amount = test_price * marketplace.platform_fee_bps / 10000;
        let seller_amount = test_price - fee_amount;
        
        // Process payment from deposit
        let fee_coin = balance::split(&mut user_deposit.amount, fee_amount);
        let seller_coin = balance::split(&mut user_deposit.amount, seller_amount);
        
        // Add fee to platform vault
        balance::join(&mut marketplace.vault, fee_coin);
        
        // Send payment to seller
        transfer::public_transfer(coin::from_balance(seller_coin, ctx), prompt.owner);
        
        // Grant access via allowlist
        if (option::is_some(&prompt.allowlist_id)) {
            let lid = *option::borrow(&prompt.allowlist_id);
            let al = table::borrow_mut(&mut marketplace.allowlists, lid);
            if (!al.list.contains(&buyer)) { al.list.push_back(buyer); }
        };
        
        // Update statistics
        prompt.purchases = prompt.purchases + 1;
        
        // Emit event
        event::emit(PromptBought {
            prompt_id,
            buyer,
            access_type: 2,
            price_paid: test_price,
        });
    }

    ///////////////////////// Admin Withdraw ////////////////////////////

    public entry fun withdraw_fees(
        marketplace: &mut Marketplace,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only owner can withdraw fees
        assert!(sender == marketplace.owner, ENotAllowed);
        
        // Check available balance
        assert!(balance::value(&marketplace.vault) >= amount, EInsufficientDeposit);
        
        // Process withdrawal
        let fee_coin = balance::split(&mut marketplace.vault, amount);
        transfer::public_transfer(coin::from_balance(fee_coin, ctx), sender);
    }

    ///////////////////////// Toggle Prompt Status ////////////////////////////

    public entry fun set_prompt_active(
        marketplace: &mut Marketplace,
        prompt_id: ID,
        is_active: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Get prompt details
        assert!(table::contains(&marketplace.prompts, prompt_id), EPromptNotFound);
        let prompt = table::borrow_mut(&mut marketplace.prompts, prompt_id);
        
        // Only owner can update status
        assert!(prompt.owner == sender, ENotAllowed);
        
        // Update status
        prompt.is_active = is_active;
    }

    ///////////////////////// Update Prompt Details ////////////////////////////

    public entry fun update_prompt(
        marketplace: &mut Marketplace,
        prompt_id: ID,
        mut metadata_uri: Option<vector<u8>>,
        mut encrypted_prompt_uri: Option<vector<u8>>,
        mut price: Option<u64>,
        mut test_price: Option<u64>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Get prompt details
        assert!(table::contains(&marketplace.prompts, prompt_id), EPromptNotFound);
        let prompt = table::borrow_mut(&mut marketplace.prompts, prompt_id);
        
        // Only owner can update prompt
        assert!(prompt.owner == sender, ENotAllowed);
        
        // Update fields if provided
        if (option::is_some(&metadata_uri)) {
            prompt.metadata_uri = utf8(option::extract(&mut metadata_uri));
        };
        
        if (option::is_some(&encrypted_prompt_uri)) {
            prompt.encrypted_prompt_uri = utf8(option::extract(&mut encrypted_prompt_uri));
        };
        
        if (option::is_some(&price)) {
            prompt.price = option::extract(&mut price);
        };
        
        if (option::is_some(&test_price)) {
            prompt.test_price = option::extract(&mut test_price);
        };
    }

    ///////////////////////// Refund Deposit ////////////////////////////

    public entry fun refund_deposit(
        marketplace: &mut Marketplace,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check user deposit
        assert!(table::contains(&marketplace.deposits, sender), EInsufficientDeposit);
        let user_deposit = table::borrow_mut(&mut marketplace.deposits, sender);
        assert!(balance::value(&user_deposit.amount) >= amount, EInsufficientDeposit);
        
        // Process refund
        let refund_balance = balance::split(&mut user_deposit.amount, amount);
        transfer::public_transfer(coin::from_balance(refund_balance, ctx), sender);
        
        // Emit event
        event::emit(DepositRefunded {
            user: sender,
            amount,
        });
    }

    ///////////////////////// Allowlist Management ////////////////////////////

    public entry fun create_allowlist(
        marketplace: &mut Marketplace,
        name: String,
        ctx: &mut TxContext
    ): ID {
        // Create new Allowlist object
        let allowlist_uid = object::new(ctx);
        let lid: ID = object::uid_to_inner(&allowlist_uid);
        let allowlist = Allowlist { id: allowlist_uid, name, list: vector::empty() };
        table::add(&mut marketplace.allowlists, lid, allowlist);
        lid
    }

    public entry fun add(
        marketplace: &mut Marketplace,
        cap: &Cap,
        account: address
    ){
        let allowlist = table::borrow_mut(&mut marketplace.allowlists, cap.allowlist_id);
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        assert!(!allowlist.list.contains(&account), EDuplicate);
        allowlist.list.push_back(account);
    }

    public entry fun remove(
        marketplace: &mut Marketplace,
        cap: &Cap,
        account: address
    ) {
        let allowlist = table::borrow_mut(&mut marketplace.allowlists, cap.allowlist_id);
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        allowlist.list = allowlist.list.filter!(|x| x != account);
    }

    public fun namespace(allowlist: &Allowlist): vector<u8> {
        object::id(allowlist).to_bytes()
    }

    fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist): bool {
        if (!is_prefix(namespace(allowlist), id)) {
            false
        } else {
            allowlist.list.contains(&caller)
        }
    }

    public entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, ctx: &mut TxContext) {
        assert!(approve_internal(tx_context::sender(ctx), id, allowlist), ENoAccess);
    }

    public fun publish(marketplace: &mut Marketplace, lid: ID, cap: ID, blob_id: String, recipient: address) {
        let allowlist =table::borrow_mut(&mut marketplace.allowlists, lid);
        assert!(cap == object::id(allowlist), EInvalidCap);
        allowlist.list.push_back(recipient);
    }

    ///////////////////////// View Helpers (for off-chain) ////////////////////////////

    public fun has_access(
        marketplace: &Marketplace,
        prompt_id: ID,
        user: address
    ): bool {
        // Access via allowlist membership
        let prompt = table::borrow(&marketplace.prompts, prompt_id);
        if (option::is_some(&prompt.allowlist_id)) {
            let lid = *option::borrow(&prompt.allowlist_id);
            let al = table::borrow(&marketplace.allowlists, lid);
            al.list.contains(&user)
        } else {
            // Direct or test purchase grants access if any purchases > 0
            prompt.purchases > 0
        }
    }

    public fun get_deposit_amount(
        marketplace: &Marketplace,
        user: address
    ): u64 {
        if (table::contains(&marketplace.deposits, user)) {
            let deposit = table::borrow(&marketplace.deposits, user);
            balance::value(&deposit.amount)
        } else {
            0
        }
    }

    /// Testing helper: retrieve all prompt IDs
    #[test_only]
    public fun get_prompt_ids(marketplace: &Marketplace): vector<ID> {
        marketplace.prompt_ids
    }

    public fun get_prompt_details(
        marketplace: &Marketplace,
        prompt_id: ID
    ): (address, String, String, u64, u64, bool, u64) {
        let prompt = table::borrow(&marketplace.prompts, prompt_id);
        (
            prompt.owner,
            prompt.metadata_uri,
            prompt.encrypted_prompt_uri,
            prompt.price,
            prompt.test_price,
            prompt.is_active,
            prompt.purchases
        )
    }

    public fun get_platform_fee_bps(marketplace: &Marketplace): u64 {
        marketplace.platform_fee_bps
    }

    #[test_only]
    public fun new_allowlist_for_testing(ctx: &mut TxContext): Allowlist {
        Allowlist {
            id: object::new(ctx),
            name: utf8(b"test"),
            list: vector::empty(),
        }
    }

    #[test_only]
    public fun new_cap_for_testing(ctx: &mut TxContext, allowlist: &Allowlist): Cap {
        Cap {
            id: object::new(ctx),
            allowlist_id: object::id(allowlist),
        }
    }

    #[test_only]
    public fun destroy_for_testing(allowlist: Allowlist, cap: Cap) {
        // Destructure to move UID without implicit copy
        let Allowlist { id: allowlist_id, .. } = allowlist;
        object::delete(allowlist_id);
        let Cap { id: cap_id, .. } = cap;
        object::delete(cap_id);
    }
}
