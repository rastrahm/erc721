// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";
import {INFTCollection} from "../../src/interfaces/INFTCollection.sol";
import {MockERC721Receiver} from "../../src/mocks/MockERC721Receiver.sol";
import {MockERC721NonReceiver} from "../../src/mocks/MockERC721NonReceiver.sol";

/**
 * @title NFTCollectionLifecycleTest
 * @notice Lifecycle mint → URI → transfer → royalty (Fase 2/3). Tests **rojos** en Fase 1.
 */
contract NFTCollectionLifecycleTest is Test {
    uint256 internal constant MAX_SUPPLY = 100;
    uint96 internal constant ROYALTY_FEE = 750; // 7.5%
    uint256 internal constant SALE_PRICE = 2 ether;

    string internal constant BASE_URI = "https://cdn.example/nft/";

    NFTCollection internal collection;
    MockERC721Receiver internal goodReceiver;
    MockERC721NonReceiver internal badReceiver;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");

    function setUp() public {
        collection = new NFTCollection(
            "Lifecycle NFT", "LNFT", MAX_SUPPLY, BASE_URI, royaltyReceiver, ROYALTY_FEE, owner
        );
        goodReceiver = new MockERC721Receiver(true);
        badReceiver = new MockERC721NonReceiver();
    }

    function test_lifecycle_mint_transfer_tokenURI() public {
        vm.prank(owner);
        uint256 tokenId = collection.safeMint(alice);

        assertEq(tokenId, 0, "first tokenId is 0");
        assertEq(collection.ownerOf(tokenId), alice);
        assertEq(collection.balanceOf(alice), 1);
        assertEq(collection.totalSupply(), 1);
        assertEq(collection.tokenURI(tokenId), string.concat(BASE_URI, "0"));

        vm.prank(alice);
        collection.safeTransferFrom(alice, bob, tokenId);

        assertEq(collection.ownerOf(tokenId), bob);
        assertEq(collection.balanceOf(alice), 0);
        assertEq(collection.balanceOf(bob), 1);
    }

    function test_lifecycle_batchMint_and_royalty() public {
        uint256 quantity = 5;

        vm.prank(owner);
        uint256 firstId = collection.safeMintBatch(alice, quantity);

        assertEq(firstId, 0);
        assertEq(collection.balanceOf(alice), quantity);
        assertEq(collection.totalSupply(), quantity);

        for (uint256 i = 0; i < quantity; i++) {
            uint256 id = firstId + i;
            assertEq(collection.ownerOf(id), alice);
            assertEq(collection.tokenURI(id), string.concat(BASE_URI, vm.toString(id)));

            (address receiver, uint256 amount) = collection.royaltyInfo(id, SALE_PRICE);
            assertEq(receiver, royaltyReceiver);
            assertEq(amount, (SALE_PRICE * ROYALTY_FEE) / 10_000);
        }
    }

    function test_safeMint_revertsOnNonReceiverContract() public {
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("ERC721InvalidReceiver(address)", address(badReceiver)));
        collection.safeMint(address(badReceiver));
    }

    function test_safeMint_succeedsOnGoodReceiver() public {
        vm.prank(owner);
        uint256 tokenId = collection.safeMint(address(goodReceiver));

        assertEq(collection.ownerOf(tokenId), address(goodReceiver));
        assertEq(collection.balanceOf(address(goodReceiver)), 1);
    }

    function test_setBaseURI_updatesTokenURI() public {
        string memory newUri = "https://reveal.example/items/";

        vm.prank(owner);
        collection.safeMint(alice);

        vm.prank(owner);
        collection.setBaseURI(newUri);

        assertEq(collection.baseURI(), newUri);
        assertEq(collection.tokenURI(0), string.concat(newUri, "0"));
    }

    function test_mintBatch_revertsZeroQuantity() public {
        vm.prank(owner);
        vm.expectRevert(INFTCollection.MintZeroQuantity.selector);
        collection.mintBatch(alice, 0);
    }

    function test_mintBatch_revertsMaxSupplyExceeded() public {
        vm.startPrank(owner);
        collection.mintBatch(alice, MAX_SUPPLY);

        vm.expectRevert(INFTCollection.MaxSupplyExceeded.selector);
        collection.mint(alice);
        vm.stopPrank();
    }
}
