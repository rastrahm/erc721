// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";
import {INFTCollection} from "../../src/interfaces/INFTCollection.sol";

/**
 * @title NFTCollectionCoreTest
 * @notice Fase 2: mint, batch, URI, transfer y approvals.
 */
contract NFTCollectionCoreTest is Test {
    string internal constant BASE_URI = "https://example.com/nft/";

    NFTCollection internal collection;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal operator = makeAddr("operator");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");

    function setUp() public {
        collection = new NFTCollection("Core NFT", "CNFT", 5, BASE_URI, royaltyReceiver, 500, owner);
    }

    function test_mint_assignsSequentialIds() public {
        vm.startPrank(owner);
        assertEq(collection.mint(alice), 0);
        assertEq(collection.mint(bob), 1);
        vm.stopPrank();

        assertEq(collection.totalSupply(), 2);
        assertEq(collection.ownerOf(0), alice);
        assertEq(collection.ownerOf(1), bob);
    }

    function test_mint_revertsZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.ZeroAddress.selector);
        collection.mint(address(0));
    }

    function test_mintBatch_emitsBatchMinted() public {
        vm.expectEmit(true, true, false, true);
        emit INFTCollection.BatchMinted(alice, 0, 3);

        vm.prank(owner);
        uint256 firstId = collection.mintBatch(alice, 3);

        assertEq(firstId, 0);
        assertEq(collection.balanceOf(alice), 3);
    }

    function test_setBaseURI_emitsEvent() public {
        string memory newUri = "https://new.example/";

        vm.expectEmit(false, false, false, true);
        emit INFTCollection.BaseURIUpdated(newUri);

        vm.prank(owner);
        collection.setBaseURI(newUri);
    }

    function test_approve_and_transferFrom() public {
        vm.prank(owner);
        collection.mint(alice);

        vm.prank(alice);
        collection.approve(operator, 0);

        assertEq(collection.getApproved(0), operator);

        vm.prank(operator);
        collection.transferFrom(alice, bob, 0);

        assertEq(collection.ownerOf(0), bob);
    }

    function test_setApprovalForAll_and_transferFrom() public {
        vm.prank(owner);
        collection.mint(alice);

        vm.prank(alice);
        collection.setApprovalForAll(operator, true);

        assertTrue(collection.isApprovedForAll(alice, operator));

        vm.prank(operator);
        collection.transferFrom(alice, bob, 0);

        assertEq(collection.ownerOf(0), bob);
    }

    function test_mint_revertsWhenNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        collection.mint(alice);
    }

    function test_setBaseURI_revertsWhenNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        collection.setBaseURI("https://hack/");
    }
}
