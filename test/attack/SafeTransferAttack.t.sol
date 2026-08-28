// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";
import {INFTCollection} from "../../src/interfaces/INFTCollection.sol";
import {MockERC721NonReceiver} from "../../src/mocks/MockERC721NonReceiver.sol";
import {MockERC721ReceiverReentrant} from "../../src/mocks/MockERC721ReceiverReentrant.sol";

/**
 * @title SafeTransferAttackTest
 * @notice Campañas defensivas: non-receiver, reentrancy en callback, supply, auth (SWC-107, SWC-123).
 */
contract SafeTransferAttackTest is Test {
    NFTCollection internal collection;
    MockERC721NonReceiver internal badReceiver;
    MockERC721ReceiverReentrant internal reentrantReceiver;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal attacker = makeAddr("attacker");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");

    function setUp() public {
        collection = new NFTCollection(
            "Attack NFT", "ATK", 100, "https://atk.example/", royaltyReceiver, 500, owner
        );
        badReceiver = new MockERC721NonReceiver();
        reentrantReceiver = new MockERC721ReceiverReentrant();
    }

    // --- Campaña A: non-receiver (SWC-123) ---

    function test_AttackA1_safeMint_nonReceiver_reverts() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("ERC721InvalidReceiver(address)", address(badReceiver)));
        collection.safeMint(address(badReceiver));
        assertEq(collection.totalSupply(), 0);
    }

    function test_AttackA2_safeMintBatch_nonReceiver_reverts_noPartialMint() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("ERC721InvalidReceiver(address)", address(badReceiver)));
        collection.safeMintBatch(address(badReceiver), 3);
        assertEq(collection.totalSupply(), 0);
    }

    function test_AttackA3_safeTransfer_nonReceiver_reverts() public {
        vm.prank(owner);
        collection.mint(alice);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("ERC721InvalidReceiver(address)", address(badReceiver)));
        collection.safeTransferFrom(alice, address(badReceiver), 0);

        assertEq(collection.ownerOf(0), alice);
    }

    // --- Campaña B: reentrancy en callback (SWC-107) ---

    function test_AttackB1_safeMint_reentrantMint_reverts_noExtraSupply() public {
        reentrantReceiver.setReenter(
            address(collection), abi.encodeWithSelector(collection.mint.selector, attacker)
        );

        vm.prank(owner);
        vm.expectRevert();
        collection.safeMint(address(reentrantReceiver));

        assertEq(collection.totalSupply(), 0);
    }

    function test_AttackB2_safeTransfer_reentrantDoubleTransfer_reverts() public {
        vm.startPrank(owner);
        collection.mint(alice);
        collection.mint(bob);
        vm.stopPrank();

        reentrantReceiver.setReenter(
            address(collection),
            abi.encodeWithSelector(collection.transferFrom.selector, alice, attacker, uint256(0))
        );

        vm.prank(alice);
        vm.expectRevert();
        collection.safeTransferFrom(alice, address(reentrantReceiver), 0);

        assertEq(collection.ownerOf(0), alice);
        assertEq(collection.balanceOf(alice), 1);
    }

    function test_AttackB3_safeMintBatch_reentrantMint_reverts_allOrNothing() public {
        reentrantReceiver.setReenter(
            address(collection), abi.encodeWithSelector(collection.mint.selector, attacker)
        );

        vm.prank(owner);
        vm.expectRevert();
        collection.safeMintBatch(address(reentrantReceiver), 5);

        assertEq(collection.totalSupply(), 0);
    }

    // --- Campaña C: supply / auth (SWC-101, SWC-123) ---

    function test_AttackC1_unauthorizedMint_reverts() public {
        vm.prank(attacker);
        vm.expectRevert();
        collection.mint(attacker);
        assertEq(collection.totalSupply(), 0);
    }

    function test_AttackC2_batchBeyondMaxSupply_reverts() public {
        vm.prank(owner);
        collection.mintBatch(alice, 100);

        vm.prank(owner);
        vm.expectRevert(INFTCollection.MaxSupplyExceeded.selector);
        collection.mint(owner);
    }

    function test_AttackC3_mintToZero_reverts() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.ZeroAddress.selector);
        collection.mint(address(0));
    }

    // --- Campaña D: checklist superficie (SWC-105, 112, 132) ---

    function test_AttackD0_noPayableMintSurface() public view {
        assertEq(collection.MODULE_ID(), "04-erc721");
        // Sin ETH: el contrato no expone receive/fallback payable en NFTCollection.
    }

    function test_AttackD1_receiverReturnsWrongSelector_reverts() public {
        WrongSelectorReceiver wrong = new WrongSelectorReceiver();

        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("ERC721InvalidReceiver(address)", address(wrong)));
        collection.safeMint(address(wrong));
    }
}

/**
 * @notice Devuelve selector incorrecto en `onERC721Received`.
 */
contract WrongSelectorReceiver is IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return bytes4(0xdeadbeef);
    }
}
