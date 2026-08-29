// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

import {INFTCollection} from "./interfaces/INFTCollection.sol";

/**
 * @title NFTCollection
 * @notice Colección ERC-721 gas-optimizada con batch mint, base URI dinámica y ERC-2981.
 * @dev Módulo cerrado (Fases 0–7). Ver `doc/HANDOFF.md` y `doc/00-plan-implementacion.md`.
 *
 * Layout: interfaz → herencia OZ → estado → constructor → views → mutators → overrides.
 */
contract NFTCollection is INFTCollection, ERC721, ERC2981, Ownable2Step {
    /// @notice Identificador de módulo (smoke test bootstrap).
    string public constant MODULE_ID = "04-erc721";

    /// @notice Techo de supply de la colección.
    uint256 private immutable MAX_SUPPLY;

    /// @notice Tokens minteados hasta el momento.
    uint256 private _totalMinted;

    /// @notice Siguiente `tokenId` a asignar (inicia en 0).
    uint256 private _nextTokenId;

    /// @notice Raíz de metadata on-chain.
    string private _baseTokenURI;

    /**
     * @notice Despliega la colección con metadata, supply cap y royalty por defecto.
     * @param name_ Nombre ERC-721.
     * @param symbol_ Símbolo ERC-721.
     * @param maxSupply_ Máximo de tokens minteables (`> 0`).
     * @param baseURI_ Raíz de metadata (convención: terminar en `/`).
     * @param royaltyReceiver_ Beneficiario ERC-2981.
     * @param royaltyFeeNumerator_ Fee en basis points (denominador 10000).
     * @param owner_ Owner inicial (`Ownable2Step`).
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        string memory baseURI_,
        address royaltyReceiver_,
        uint96 royaltyFeeNumerator_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        if (maxSupply_ == 0) revert MintZeroQuantity();
        if (owner_ == address(0)) revert ZeroAddress();
        if (royaltyReceiver_ == address(0)) revert ZeroAddress();

        MAX_SUPPLY = maxSupply_;
        _baseTokenURI = baseURI_;
        _setDefaultRoyalty(royaltyReceiver_, royaltyFeeNumerator_);

        emit RoyaltyUpdated(royaltyReceiver_, royaltyFeeNumerator_);
    }

    // -------------------------------------------------------------------------
    // Views — supply y metadata
    // -------------------------------------------------------------------------

    /// @inheritdoc INFTCollection
    function maxSupply() external view returns (uint256) {
        return MAX_SUPPLY;
    }

    /// @inheritdoc INFTCollection
    function totalSupply() external view returns (uint256) {
        return _totalMinted;
    }

    /// @inheritdoc INFTCollection
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /// @inheritdoc INFTCollection
    function tokenURI(uint256 tokenId) public view override(ERC721, INFTCollection) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // -------------------------------------------------------------------------
    // Mutators — mint (onlyOwner)
    // -------------------------------------------------------------------------

    /// @inheritdoc INFTCollection
    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = _reserveMint(to, 1);
        _mint(to, tokenId);
    }

    /// @inheritdoc INFTCollection
    function safeMint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = _reserveMint(to, 1);
        _safeMint(to, tokenId);
    }

    /// @inheritdoc INFTCollection
    function mintBatch(address to, uint256 quantity) external onlyOwner returns (uint256 firstTokenId) {
        firstTokenId = _reserveMint(to, quantity);

        uint256 end = firstTokenId + quantity;
        unchecked {
            for (uint256 tokenId = firstTokenId; tokenId < end; ++tokenId) {
                _mint(to, tokenId);
            }
        }

        emit BatchMinted(to, firstTokenId, quantity);
    }

    /// @inheritdoc INFTCollection
    function safeMintBatch(address to, uint256 quantity) external onlyOwner returns (uint256 firstTokenId) {
        firstTokenId = _reserveMint(to, quantity);

        uint256 end = firstTokenId + quantity;
        unchecked {
            for (uint256 tokenId = firstTokenId; tokenId < end; ++tokenId) {
                _safeMint(to, tokenId);
            }
        }

        emit BatchMinted(to, firstTokenId, quantity);
    }

    // -------------------------------------------------------------------------
    // Admin — URI y royalties (onlyOwner)
    // -------------------------------------------------------------------------

    /// @inheritdoc INFTCollection
    function setBaseURI(string calldata uri) external onlyOwner {
        _baseTokenURI = uri;
        emit BaseURIUpdated(uri);
    }

    /// @inheritdoc INFTCollection
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    /// @inheritdoc INFTCollection
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _requireOwned(tokenId);
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
        emit TokenRoyaltyUpdated(tokenId, receiver, feeNumerator);
    }

    /// @inheritdoc INFTCollection
    function deleteDefaultRoyalty() external onlyOwner {
        _deleteDefaultRoyalty();
        emit RoyaltyUpdated(address(0), 0);
    }

    /// @inheritdoc INFTCollection
    function resetTokenRoyalty(uint256 tokenId) external onlyOwner {
        _requireOwned(tokenId);
        _resetTokenRoyalty(tokenId);
        emit TokenRoyaltyUpdated(tokenId, address(0), 0);
    }

    // -------------------------------------------------------------------------
    // Internos
    // -------------------------------------------------------------------------

    /**
     * @dev Valida destino y supply; reserva `quantity` ids y actualiza contadores.
     * @param to Destinatario de los tokens.
     * @param quantity Cantidad a mintear (`> 0`).
     * @return firstTokenId Primer `tokenId` reservado.
     */
    function _reserveMint(address to, uint256 quantity) internal returns (uint256 firstTokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (quantity == 0) revert MintZeroQuantity();
        if (_totalMinted + quantity > MAX_SUPPLY) revert MaxSupplyExceeded();

        firstTokenId = _nextTokenId;
        unchecked {
            _nextTokenId += quantity;
            _totalMinted += quantity;
        }
    }

    /// @dev Concatena `_baseTokenURI` + `tokenId` vía `ERC721.tokenURI`.
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @dev ERC-165 + ERC-721 + ERC-2981 vía herencia OZ.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
