// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";
import {INFTCollection} from "../../src/interfaces/INFTCollection.sol";

/**
 * @title NFTCollectionRoyaltyAdminTest
 * @notice Fase 3: ERC-2981 admin, interface IDs y Ownable2Step.
 */
contract NFTCollectionRoyaltyAdminTest is Test {
    bytes4 internal constant ERC165_ID = 0x01ffc9a7;
    bytes4 internal constant ERC721_ID = 0x80ac58cd;
    bytes4 internal constant ERC721_METADATA_ID = 0x5b5e139f;
    bytes4 internal constant ERC2981_ID = 0x2a55205a;

    uint256 internal constant SALE_PRICE = 1 ether;

    NFTCollection internal collection;

    address internal owner = makeAddr("owner");
    address internal newOwner = makeAddr("newOwner");
    address internal alice = makeAddr("alice");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");
    address internal tokenRoyaltyReceiver = makeAddr("tokenRoyaltyReceiver");

    function setUp() public {
        collection = new NFTCollection(
            "Royalty NFT", "RNFT", 100, "https://example.com/", royaltyReceiver, 500, owner
        );
        vm.prank(owner);
        collection.mint(alice);
    }

    function test_supportsInterface_knownIds() public view {
        assertTrue(collection.supportsInterface(ERC165_ID));
        assertTrue(collection.supportsInterface(ERC721_ID));
        assertTrue(collection.supportsInterface(ERC721_METADATA_ID));
        assertTrue(collection.supportsInterface(ERC2981_ID));
        assertEq(collection.supportsInterface(ERC165_ID), collection.supportsInterface(type(IERC165).interfaceId));
        assertEq(collection.supportsInterface(ERC2981_ID), collection.supportsInterface(type(IERC2981).interfaceId));
    }

    function test_setDefaultRoyalty_updatesRoyaltyInfo() public {
        address newReceiver = makeAddr("newReceiver");
        uint96 newFee = 1000;

        vm.expectEmit(true, false, false, true);
        emit INFTCollection.RoyaltyUpdated(newReceiver, newFee);

        vm.prank(owner);
        collection.setDefaultRoyalty(newReceiver, newFee);

        (address receiver, uint256 amount) = collection.royaltyInfo(0, SALE_PRICE);
        assertEq(receiver, newReceiver);
        assertEq(amount, (SALE_PRICE * newFee) / 10_000);
    }

    function test_setDefaultRoyalty_revertsInvalidParams() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSignature("ERC2981InvalidDefaultRoyaltyReceiver(address)", address(0)));
        collection.setDefaultRoyalty(address(0), 100);

        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC2981InvalidDefaultRoyalty(uint256,uint256)")), uint256(10_001), uint256(10_000)
            )
        );
        collection.setDefaultRoyalty(royaltyReceiver, 10_001);
        vm.stopPrank();
    }

    function test_setDefaultRoyalty_revertsWhenNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        collection.setDefaultRoyalty(royaltyReceiver, 250);
    }

    function test_setTokenRoyalty_overridesDefault() public {
        uint96 tokenFee = 2500;

        vm.expectEmit(true, true, false, true);
        emit INFTCollection.TokenRoyaltyUpdated(0, tokenRoyaltyReceiver, tokenFee);

        vm.prank(owner);
        collection.setTokenRoyalty(0, tokenRoyaltyReceiver, tokenFee);

        (address receiver, uint256 amount) = collection.royaltyInfo(0, SALE_PRICE);
        assertEq(receiver, tokenRoyaltyReceiver);
        assertEq(amount, (SALE_PRICE * tokenFee) / 10_000);

        vm.prank(owner);
        collection.mint(alice);

        (address defaultReceiver, uint256 defaultAmount) = collection.royaltyInfo(1, SALE_PRICE);
        assertEq(defaultReceiver, royaltyReceiver);
        assertEq(defaultAmount, (SALE_PRICE * 500) / 10_000);
    }

    function test_setTokenRoyalty_revertsForNonexistentToken() public {
        vm.prank(owner);
        vm.expectRevert();
        collection.setTokenRoyalty(99, tokenRoyaltyReceiver, 100);
    }

    function test_deleteDefaultRoyalty_clearsDefault() public {
        vm.prank(owner);
        collection.deleteDefaultRoyalty();

        (address receiver, uint256 amount) = collection.royaltyInfo(0, SALE_PRICE);
        assertEq(receiver, address(0));
        assertEq(amount, 0);
    }

    function test_resetTokenRoyalty_revertsToDefault() public {
        vm.startPrank(owner);
        collection.setTokenRoyalty(0, tokenRoyaltyReceiver, 2500);
        collection.resetTokenRoyalty(0);
        vm.stopPrank();

        (address receiver, uint256 amount) = collection.royaltyInfo(0, SALE_PRICE);
        assertEq(receiver, royaltyReceiver);
        assertEq(amount, (SALE_PRICE * 500) / 10_000);
    }

    function test_ownable2Step_transferRequiresAcceptance() public {
        vm.prank(owner);
        collection.transferOwnership(newOwner);

        assertEq(collection.owner(), owner);
        assertEq(collection.pendingOwner(), newOwner);

        vm.prank(newOwner);
        collection.acceptOwnership();

        assertEq(collection.owner(), newOwner);
        assertEq(collection.pendingOwner(), address(0));
    }

    function test_ownable2Step_oldOwnerCannotAdminAfterTransfer() public {
        vm.prank(owner);
        collection.transferOwnership(newOwner);

        vm.prank(newOwner);
        collection.acceptOwnership();

        vm.prank(owner);
        vm.expectRevert();
        collection.setBaseURI("https://old-owner/");

        vm.prank(newOwner);
        collection.setBaseURI("https://new-owner/");
        assertEq(collection.baseURI(), "https://new-owner/");
    }

    function test_ownable2Step_pendingOwnerCannotAdminBeforeAccept() public {
        vm.prank(owner);
        collection.transferOwnership(newOwner);

        vm.prank(newOwner);
        vm.expectRevert();
        collection.setDefaultRoyalty(newOwner, 100);
    }

    function test_ownable2Step_newOwnerCanMintAfterAccept() public {
        vm.prank(owner);
        collection.transferOwnership(newOwner);

        vm.prank(newOwner);
        collection.acceptOwnership();

        vm.prank(newOwner);
        uint256 tokenId = collection.mint(alice);
        assertEq(tokenId, 1);
    }
}
