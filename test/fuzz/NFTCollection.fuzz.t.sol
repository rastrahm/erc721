// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";
import {INFTCollection} from "../../src/interfaces/INFTCollection.sol";

/**
 * @title NFTCollectionFuzzTest
 * @notice Fuzz de quantity, destinos y royalty (Fase 4 / SWC-101, SWC-123).
 */
contract NFTCollectionFuzzTest is Test {
    NFTCollection internal collection;

    address internal owner = makeAddr("owner");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");

    function setUp() public {
        collection = new NFTCollection(
            "Fuzz NFT", "FNFT", 10_000, "https://fuzz.example/", royaltyReceiver, 500, owner
        );
    }

    function testFuzz_mintBatch_respectsMaxSupply(address to, uint256 quantity) public {
        vm.assume(to != address(0));
        quantity = bound(quantity, 1, 10_000);

        vm.prank(owner);
        uint256 firstId = collection.mintBatch(to, quantity);

        assertEq(firstId, 0);
        assertEq(collection.totalSupply(), quantity);
        assertEq(collection.balanceOf(to), quantity);
        assertLe(collection.totalSupply(), collection.maxSupply());
    }

    function testFuzz_mintBatch_revertsWhenExceedsMaxSupply(uint256 quantity) public {
        quantity = bound(quantity, 10_001, type(uint128).max);

        vm.prank(owner);
        vm.expectRevert(INFTCollection.MaxSupplyExceeded.selector);
        collection.mintBatch(owner, quantity);
    }

    function testFuzz_royaltyInfo_bounded(uint256 salePrice, uint96 fee) public {
        salePrice = bound(salePrice, 0, 1_000_000 ether);
        fee = uint96(bound(fee, 0, 10_000));

        vm.prank(owner);
        collection.mint(owner);

        vm.prank(owner);
        collection.setDefaultRoyalty(royaltyReceiver, fee);

        (address receiver, uint256 amount) = collection.royaltyInfo(0, salePrice);
        assertEq(receiver, royaltyReceiver);
        assertEq(amount, (salePrice * fee) / 10_000);
        assertLe(amount, salePrice);
    }

    function testFuzz_sequentialMint_idsMatchTotalSupply(uint8 rounds) public {
        rounds = uint8(bound(rounds, 1, 50));
        address recipient = makeAddr("recipient");

        vm.startPrank(owner);
        for (uint256 i = 0; i < rounds; i++) {
            uint256 id = collection.mint(recipient);
            assertEq(id, i);
            assertEq(collection.totalSupply(), i + 1);
        }
        vm.stopPrank();

        assertEq(collection.balanceOf(recipient), rounds);
    }

    function testFuzz_safeMintBatch_quantity(address to, uint256 quantity) public {
        vm.assume(to != address(0));
        vm.assume(to.code.length == 0); // safeMint exige receiver solo en contratos
        quantity = bound(quantity, 1, 100);

        vm.prank(owner);
        uint256 firstId = collection.safeMintBatch(to, quantity);

        assertEq(firstId, 0);
        assertEq(collection.totalSupply(), quantity);
        for (uint256 i = 0; i < quantity; i++) {
            assertEq(collection.ownerOf(firstId + i), to);
        }
    }
}
