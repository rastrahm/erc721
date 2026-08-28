// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";

import {NFTCollection} from "../src/NFTCollection.sol";

/**
 * @title NFTCollectionBootstrapTest
 * @notice Fase 0: smoke test de bootstrap del módulo.
 */
contract NFTCollectionBootstrapTest is Test {
    /**
     * @notice Verifica que el módulo está correctamente inicializado.
     */
    function test_moduleId() public {
        NFTCollection collection = new NFTCollection();
        assertEq(collection.MODULE_ID(), "04-erc721");
    }
}
