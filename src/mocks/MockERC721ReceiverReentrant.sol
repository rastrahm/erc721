// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title MockERC721ReceiverReentrant
 * @notice Receiver que reintenta una llamada externa en `onERC721Received` (tests SWC-107).
 */
contract MockERC721ReceiverReentrant is IERC721Receiver {
    address public target;
    bytes public data;
    uint256 public reenterCount;
    uint256 public maxReenters = 1;

    /**
     * @notice Configura el destino y calldata del reintento.
     * @param target_ Contrato a llamar en el callback.
     * @param data_ Calldata de la llamada maliciosa.
     */
    function setReenter(address target_, bytes calldata data_) external {
        target = target_;
        data = data_;
        reenterCount = 0;
    }

    /// @inheritdoc IERC721Receiver
    function onERC721Received(address, address, uint256, bytes calldata)
        external
        returns (bytes4)
    {
        if (target != address(0) && reenterCount < maxReenters) {
            reenterCount++;
            (bool ok,) = target.call(data);
            if (!ok) revert();
        }
        return IERC721Receiver.onERC721Received.selector;
    }
}
