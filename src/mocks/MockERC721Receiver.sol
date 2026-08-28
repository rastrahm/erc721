// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title MockERC721Receiver
 * @notice Mock configurable para tests de `safeMint` / `safeTransferFrom`.
 * @dev Si `shouldAccept` es `true`, devuelve el selector correcto; si no, revierte.
 */
contract MockERC721Receiver is IERC721Receiver {
    /// @notice Si el mock acepta tokens entrantes.
    bool public immutable shouldAccept;

    /**
     * @param accept_ Configura si el receiver acepta NFTs.
     */
    constructor(bool accept_) {
        shouldAccept = accept_;
    }

    /// @inheritdoc IERC721Receiver
    function onERC721Received(address, address, uint256, bytes calldata)
        external
        view
        override
        returns (bytes4)
    {
        if (!shouldAccept) {
            revert();
        }
        return IERC721Receiver.onERC721Received.selector;
    }
}
