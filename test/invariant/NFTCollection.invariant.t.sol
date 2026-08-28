// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";
import {NFTCollectionHandler} from "./NFTCollectionHandler.sol";

/**
 * @title NFTCollectionInvariantTest
 * @notice Invariantes de supply y balances (Fase 4 / SWC-123, SWC-128).
 */
contract NFTCollectionInvariantTest is StdInvariant, Test {
    NFTCollection internal collection;
    NFTCollectionHandler internal handler;

    address internal owner = makeAddr("owner");
    address internal royaltyReceiver = makeAddr("royaltyReceiver");

    function setUp() public {
        collection = new NFTCollection(
            "Invariant NFT", "INFT", 500, "https://inv.example/", royaltyReceiver, 250, owner
        );
        handler = new NFTCollectionHandler(collection, owner);

        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = NFTCollectionHandler.mintOne.selector;
        selectors[1] = NFTCollectionHandler.mintBatch.selector;
        selectors[2] = NFTCollectionHandler.safeMint.selector;
        selectors[3] = NFTCollectionHandler.transfer.selector;
        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
    }

    /// @notice `totalSupply` nunca supera `maxSupply`.
    function invariant_supplyWithinCap() public view {
        assertLe(collection.totalSupply(), collection.maxSupply());
    }

    /// @notice Suma de balances de actores == `totalSupply`.
    function invariant_balancesMatchSupply() public view {
        assertEq(handler.sumBalances(), collection.totalSupply());
    }

    /// @notice Cada `tokenId` minteado tiene owner no cero.
    function invariant_allMintedTokensHaveOwner() public view {
        uint256 supply = collection.totalSupply();
        for (uint256 tokenId = 0; tokenId < supply; tokenId++) {
            assertTrue(collection.ownerOf(tokenId) != address(0));
        }
    }
}
