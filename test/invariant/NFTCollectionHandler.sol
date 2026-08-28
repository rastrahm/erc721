// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../../src/NFTCollection.sol";

/**
 * @title NFTCollectionHandler
 * @notice Handler para invariantes: mint / batch / transfer entre actores.
 */
contract NFTCollectionHandler is Test {
    NFTCollection public immutable collection;
    address public immutable owner;

    address[] internal actorsList;

    constructor(NFTCollection collection_, address owner_) {
        collection = collection_;
        owner = owner_;

        actorsList.push(makeAddr("actor0"));
        actorsList.push(makeAddr("actor1"));
        actorsList.push(makeAddr("actor2"));
    }

    function actors() external view returns (address[] memory) {
        return actorsList;
    }

    function mintOne(uint256 actorSeed) external {
        address to = actorsList[actorSeed % actorsList.length];
        vm.prank(owner);
        collection.mint(to);
    }

    function mintBatch(uint256 actorSeed, uint256 quantity) external {
        uint256 remaining = collection.maxSupply() - collection.totalSupply();
        if (remaining == 0) return;

        quantity = bound(quantity, 1, remaining);
        address to = actorsList[actorSeed % actorsList.length];

        vm.prank(owner);
        collection.mintBatch(to, quantity);
    }

    function safeMint(uint256 actorSeed) external {
        if (collection.totalSupply() >= collection.maxSupply()) return;
        address to = actorsList[actorSeed % actorsList.length];
        vm.prank(owner);
        collection.safeMint(to);
    }

    function transfer(uint256 toSeed, uint256 tokenIdSeed) external {
        uint256 supply = collection.totalSupply();
        if (supply == 0) return;

        uint256 tokenId = tokenIdSeed % supply;
        address from = collection.ownerOf(tokenId);
        address to = actorsList[toSeed % actorsList.length];
        if (from == to) return;

        vm.prank(from);
        collection.transferFrom(from, to, tokenId);
    }

    function sumBalances() external view returns (uint256 total) {
        for (uint256 i = 0; i < actorsList.length; i++) {
            total += collection.balanceOf(actorsList[i]);
        }
    }
}
