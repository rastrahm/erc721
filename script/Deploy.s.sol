// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";

import {NFTCollection} from "../src/NFTCollection.sol";

/**
 * @title Deploy
 * @notice Placeholder Fase 0 — script de deploy se completará en Fase 5.
 * @dev Por ahora solo despliega el contrato placeholder para verificar el toolchain.
 */
contract Deploy is Script {
    /**
     * @notice Despliega `NFTCollection` placeholder.
     * @return collection Dirección del contrato desplegado.
     */
    function run() external returns (NFTCollection collection) {
        vm.startBroadcast();
        collection = new NFTCollection();
        vm.stopBroadcast();

        console2.log("NFTCollection (placeholder):", address(collection));
        console2.log("MODULE_ID:", collection.MODULE_ID());
    }
}
