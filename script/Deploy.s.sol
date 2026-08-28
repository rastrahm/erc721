// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";

import {NFTCollection} from "../src/NFTCollection.sol";

/**
 * @title Deploy
 * @notice Fase 1: deploy de esqueleto con parámetros de demo. Script completo en Fase 5.
 * @dev Usa valores por defecto; override vía env en Fase 5.
 */
contract Deploy is Script {
    /**
     * @notice Despliega `NFTCollection` con configuración demo.
     * @return collection Dirección del contrato desplegado.
     */
    function run() external returns (NFTCollection collection) {
        address deployer = msg.sender;

        vm.startBroadcast();
        collection = new NFTCollection(
            "Demo NFT Collection",
            "DNFT",
            10_000,
            "https://example.com/metadata/",
            deployer,
            500,
            deployer
        );
        vm.stopBroadcast();

        console2.log("NFTCollection:", address(collection));
        console2.log("MODULE_ID:", collection.MODULE_ID());
        console2.log("maxSupply:", collection.maxSupply());
    }
}
