// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

import {NFTCollection} from "../src/NFTCollection.sol";
import {INFTCollection} from "../src/interfaces/INFTCollection.sol";

/**
 * @title NFTCollectionDesignTest
 * @notice Fase 1: constructor, views, interfaces y paths `NotImplemented`.
 */
contract NFTCollectionDesignTest is Test {
    uint256 internal constant MAX_SUPPLY = 10_000;
    uint96 internal constant ROYALTY_FEE = 500; // 5%
    uint256 internal constant SALE_PRICE = 1 ether;

    string internal constant NAME = "Test Collection";
    string internal constant SYMBOL = "TST";
    string internal constant BASE_URI = "https://example.com/meta/";

    NFTCollection internal collection;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");

    function setUp() public {
        collection = new NFTCollection(
            NAME, SYMBOL, MAX_SUPPLY, BASE_URI, royaltyReceiver, ROYALTY_FEE, owner
        );
    }

    function test_moduleId() public view {
        assertEq(collection.MODULE_ID(), "04-erc721");
    }

    function test_constructor_setsMetadataSupplyAndOwner() public view {
        assertEq(collection.name(), NAME);
        assertEq(collection.symbol(), SYMBOL);
        assertEq(collection.maxSupply(), MAX_SUPPLY);
        assertEq(collection.totalSupply(), 0);
        assertEq(collection.baseURI(), BASE_URI);
        assertEq(collection.owner(), owner);
    }

    function test_constructor_revertsZeroOwnerOrRoyaltyReceiver() public {
        vm.expectRevert(abi.encodeWithSignature("OwnableInvalidOwner(address)", address(0)));
        new NFTCollection(NAME, SYMBOL, MAX_SUPPLY, BASE_URI, royaltyReceiver, ROYALTY_FEE, address(0));

        vm.expectRevert(INFTCollection.ZeroAddress.selector);
        new NFTCollection(NAME, SYMBOL, MAX_SUPPLY, BASE_URI, address(0), ROYALTY_FEE, owner);
    }

    function test_constructor_revertsZeroMaxSupply() public {
        vm.expectRevert(INFTCollection.MintZeroQuantity.selector);
        new NFTCollection(NAME, SYMBOL, 0, BASE_URI, royaltyReceiver, ROYALTY_FEE, owner);
    }

    function test_constructor_revertsInvalidRoyaltyFee() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("ERC2981InvalidDefaultRoyalty(uint256,uint256)")), uint256(10_001), uint256(10_000)
            )
        );
        new NFTCollection(NAME, SYMBOL, MAX_SUPPLY, BASE_URI, royaltyReceiver, 10_001, owner);
    }

    function test_supportsInterface_erc165_erc721_metadata_erc2981() public view {
        assertTrue(collection.supportsInterface(type(IERC165).interfaceId));
        assertTrue(collection.supportsInterface(type(IERC721).interfaceId));
        assertTrue(collection.supportsInterface(type(IERC721Metadata).interfaceId));
        assertTrue(collection.supportsInterface(type(IERC2981).interfaceId));
        assertFalse(collection.supportsInterface(0xdeadbeef));
    }

    function test_royaltyInfo_usesConstructorDefault() public view {
        (address receiver, uint256 amount) = collection.royaltyInfo(0, SALE_PRICE);
        assertEq(receiver, royaltyReceiver);
        assertEq(amount, (SALE_PRICE * ROYALTY_FEE) / 10_000);
    }

    function test_tokenURI_revertsForNonexistentToken() public {
        vm.expectRevert();
        collection.tokenURI(0);
    }

    function test_mint_revertsNotImplemented() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.NotImplemented.selector);
        collection.mint(alice);
    }

    function test_safeMint_revertsNotImplemented() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.NotImplemented.selector);
        collection.safeMint(alice);
    }

    function test_mintBatch_revertsNotImplemented() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.NotImplemented.selector);
        collection.mintBatch(alice, 3);
    }

    function test_setBaseURI_revertsNotImplemented() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.NotImplemented.selector);
        collection.setBaseURI("https://new.example/");
    }

    function test_setDefaultRoyalty_revertsNotImplemented() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.NotImplemented.selector);
        collection.setDefaultRoyalty(royaltyReceiver, 250);
    }

    function test_mint_revertsWhenNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        collection.mint(alice);
    }
}
