// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";

import {NFTCollection} from "../src/NFTCollection.sol";

/**
 * @title Deploy
 * @notice Deploy reproducible de `NFTCollection` en Anvil / testnet.
 * @dev No incluye mint inicial automático (colección curada; owner mintea después).
 *
 * Env (todas opcionales):
 * - `INITIAL_OWNER` — default: broadcaster (`msg.sender`)
 * - `COLLECTION_NAME` — default: "Demo NFT Collection"
 * - `COLLECTION_SYMBOL` — default: "DNFT"
 * - `MAX_SUPPLY` — default: 10000
 * - `BASE_URI` — default: "https://example.com/metadata/"
 * - `ROYALTY_RECEIVER` — default: `INITIAL_OWNER`
 * - `ROYALTY_FEE_NUMERATOR` — basis points (default: 500 = 5%)
 */
contract Deploy is Script {
    /**
     * @notice Despliega la colección con parámetros de entorno.
     * @return collection Contrato desplegado.
     */
    function run() external returns (NFTCollection collection) {
        address initialOwner = vm.envOr("INITIAL_OWNER", msg.sender);
        string memory name = vm.envOr("COLLECTION_NAME", string("Demo NFT Collection"));
        string memory symbol = vm.envOr("COLLECTION_SYMBOL", string("DNFT"));
        uint256 maxSupply = vm.envOr("MAX_SUPPLY", uint256(10_000));
        string memory baseURI = vm.envOr("BASE_URI", string("https://example.com/metadata/"));
        address royaltyReceiver = vm.envOr("ROYALTY_RECEIVER", initialOwner);
        uint96 royaltyFeeNumerator = uint96(vm.envOr("ROYALTY_FEE_NUMERATOR", uint256(500)));

        vm.startBroadcast();
        collection = new NFTCollection(
            name, symbol, maxSupply, baseURI, royaltyReceiver, royaltyFeeNumerator, initialOwner
        );
        vm.stopBroadcast();

        console2.log("NFTCollection:", address(collection));
        console2.log("Owner:", initialOwner);
        console2.log("Royalty receiver:", royaltyReceiver);
        console2.log("Name:", name);
        console2.log("Symbol:", symbol);
        console2.log("maxSupply:", maxSupply);
        console2.log("baseURI:", baseURI);
        console2.log("royaltyFeeNumerator (bps):", royaltyFeeNumerator);
        console2.log("MODULE_ID:", collection.MODULE_ID());
    }
}
