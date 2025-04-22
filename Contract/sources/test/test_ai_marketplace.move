// SPDX-License-Identifier: Apache-2.0

#[test_only]
module walrus::prompt_marketplace_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID};
    use sui::transfer;
    use sui::table;
    use sui::table::Table;
    use std::vector;
    use std::option::{Self, Option, some, none};
    use std::string::{Self, String, utf8};
    
    use walrus::ai_marketplace as prompt_marketplace;
    use walrus::ai_marketplace::Marketplace;
    
    // Test addresses
    const ADMIN: address = @0xAD;
    const SELLER: address = @0xB0B;
    const BUYER: address = @0xA11CE;
    
    // Test constants
    const PROMPT_PRICE: u64 = 1_000_000_000; // 1 SUI
    const TEST_PRICE: u64 = 100_000_000;    // 0.1 SUI
    const DEPOSIT_AMOUNT: u64 = 5_000_000_000; // 5 SUI

    #[test]
    fun test_marketplace_e2e() {
        let mut scenario = ts::begin(ADMIN);
        
        // Setup: Create marketplace
        setup_marketplace(&mut scenario);
        
        // Test: List a prompt
        list_prompt(&mut scenario);
        
        // Test: Direct purchase
        buy_prompt(&mut scenario);
        
        // Test: Deposit funds
        add_deposit(&mut scenario);
        
        // Test: Test purchase using deposit
        test_prompt(&mut scenario);
        
        // Test: Withdraw fees
        withdraw_fees(&mut scenario);
        
        // Test: Refund deposit
        refund_deposit(&mut scenario);
        
        ts::end(scenario);
    }

    fun setup_marketplace(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        // Create and share the marketplace into test inventory
        prompt_marketplace::create_and_share_marketplace(ts::ctx(scenario));
    }

    fun list_prompt(scenario: &mut Scenario) {
        ts::next_tx(scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Create metadata and encrypted URIs
            let metadata_uri = b"ipfs://walrus/metadata/123";
            let encrypted_uri = b"ipfs://walrus/encrypted/456";
            
            // List prompt with price options
            prompt_marketplace::list_prompt(
                &mut marketplace,
                metadata_uri,
                encrypted_uri,
                PROMPT_PRICE,
                TEST_PRICE,
                none(), // No allowlist for this test
                ts::ctx(scenario)
            );
            
            ts::return_shared(marketplace);
        };
    }

    fun buy_prompt(scenario: &mut Scenario) {
        ts::next_tx(scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Grab the first prompt ID from the table
            let ids = prompt_marketplace::get_prompt_ids(&marketplace);
            let prompt_id = *vector::borrow(&ids, 0);
            
            // Create payment
            let mut payment = coin::mint_for_testing<SUI>(PROMPT_PRICE + 1_000_000, ts::ctx(scenario));
            
            // Buy prompt
            prompt_marketplace::buy_prompt(
                &mut marketplace,
                prompt_id,
                &mut payment,
                ts::ctx(scenario)
            );
            
            // Check buyer now has access
            assert!(prompt_marketplace::has_access(&marketplace, prompt_id, BUYER), 0);
            
            // Cleanup
            transfer::public_transfer(payment, BUYER);
            ts::return_shared(marketplace);
        };
    }

    fun add_deposit(scenario: &mut Scenario) {
        ts::next_tx(scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Create deposit
            let mut payment = coin::mint_for_testing<SUI>(DEPOSIT_AMOUNT, ts::ctx(scenario));
            
            // Add deposit
            prompt_marketplace::add_deposit(
                &mut marketplace,
                &mut payment,
                DEPOSIT_AMOUNT,
                ts::ctx(scenario)
            );
            
            // Check deposit was recorded
            assert!(prompt_marketplace::get_deposit_amount(&marketplace, BUYER) == DEPOSIT_AMOUNT, 0);
            
            // Cleanup
            transfer::public_transfer(payment, BUYER);
            ts::return_shared(marketplace);
        };
    }

    fun test_prompt(scenario: &mut Scenario) {
        let prompt_id: ID;
        // List another prompt for testing
        ts::next_tx(scenario, SELLER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Create metadata and encrypted URIs
            let metadata_uri = b"ipfs://walrus/metadata/789";
            let encrypted_uri = b"ipfs://walrus/encrypted/abc";
            
            // List prompt with price options
            prompt_marketplace::list_prompt(
                &mut marketplace,
                metadata_uri,
                encrypted_uri,
                PROMPT_PRICE,
                TEST_PRICE,
                none(), // No allowlist
                ts::ctx(scenario)
            );
            
            // Grab the second prompt ID from the table
            let ids = prompt_marketplace::get_prompt_ids(&marketplace);
            prompt_id = *vector::borrow(&ids, 1);
            
            ts::return_shared(marketplace);
        };
        
        // Now test the prompt using deposit
        ts::next_tx(scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Test purchase using deposit
            prompt_marketplace::test_prompt(&mut marketplace, prompt_id, ts::ctx(scenario));
            
            // Check buyer now has test access
            assert!(prompt_marketplace::has_access(&marketplace, prompt_id, BUYER), 0);
            
            // Check deposit was reduced
            assert!(prompt_marketplace::get_deposit_amount(&marketplace, BUYER) == 
                   DEPOSIT_AMOUNT - TEST_PRICE, 0);
            
            ts::return_shared(marketplace);
        };
    }

    fun withdraw_fees(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Calculate expected fees (2% of purchases)
            let expected_fees = (PROMPT_PRICE * 200 / 10000) + (TEST_PRICE * 200 / 10000);
            
            // Withdraw fees
            prompt_marketplace::withdraw_fees(
                &mut marketplace,
                expected_fees,
                ts::ctx(scenario)
            );
            
            ts::return_shared(marketplace);
        };
    }

    fun refund_deposit(scenario: &mut Scenario) {
        ts::next_tx(scenario, BUYER);
        {
            let mut marketplace = ts::take_shared<Marketplace>(scenario);
            
            // Get remaining deposit amount
            let remaining = prompt_marketplace::get_deposit_amount(&marketplace, BUYER);
            
            // Refund half the deposit
            let refund_amount = remaining / 2;
            prompt_marketplace::refund_deposit(
                &mut marketplace,
                refund_amount,
                ts::ctx(scenario)
            );
            
            // Check deposit was reduced
            assert!(prompt_marketplace::get_deposit_amount(&marketplace, BUYER) == 
                   remaining - refund_amount, 0);
            
            ts::return_shared(marketplace);
        };
    }
}
