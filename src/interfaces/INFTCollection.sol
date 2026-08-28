// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title INFTCollection
 * @notice Colección NFT ERC-721 con mint por lotes, base URI dinámica y royalties ERC-2981.
 * @dev Superficie pública estable para tests, scripts y UI.
 *
 * ## Numeración de `tokenId` (v1)
 *
 * - Secuencial desde **0**: el primer mint asigna `tokenId = 0`, luego `1`, `2`, …
 * - `_nextTokenId` interno inicia en `0` y se incrementa tras cada mint (loop batch con `unchecked`).
 *
 * ## Política de `tokenURI` (v1)
 *
 * ```
 * tokenURI(id) = string.concat(baseURI, Strings.toString(id))
 * ```
 *
 * - `baseURI` debe incluir el separador final (p. ej. `https://example.com/meta/`).
 * - Si el token no existe → `TokenDoesNotExist()`.
 *
 * ## Royalties (ERC-2981)
 *
 * - Denominador por defecto OZ: **10000** (basis points).
 * - `setDefaultRoyalty(receiver, feeNumerator)` en deploy y actualizable por owner.
 * - `royaltyAmount = salePrice * feeNumerator / 10000`.
 *
 * ## Decisiones v1 (Fase 1)
 *
 * - Mint **onlyOwner** (colección curada).
 * - Sin `Pausable`, sin Enumerable, sin URIStorage separado.
 * - `mint` / `safeMint` / `mintBatch` / `safeMintBatch` disponibles.
 * - Eventos estándar ERC-721 (`Transfer`, `Approval`, `ApprovalForAll`) heredados de OZ.
 */
interface INFTCollection {
    // -------------------------------------------------------------------------
    // Events (extensión de la colección)
    // -------------------------------------------------------------------------

    /// @notice Emitido tras un mint por lotes exitoso.
    /// @param to Destinatario de los tokens.
    /// @param fromTokenId Primer `tokenId` del lote (inclusive).
    /// @param quantity Cantidad minteada en el lote.
    event BatchMinted(address indexed to, uint256 indexed fromTokenId, uint256 quantity);

    /// @notice Emitido cuando el owner actualiza la raíz de metadata.
    /// @param newBaseURI Nueva base URI (debe incluir `/` final si aplica).
    event BaseURIUpdated(string newBaseURI);

    /// @notice Emitido cuando se configura la royalty por defecto.
    /// @param receiver Cuenta que recibe royalties.
    /// @param feeNumerator Numerador en basis points (denominador 10000).
    event RoyaltyUpdated(address indexed receiver, uint96 feeNumerator);

    /// @notice Emitido cuando se configura royalty por token.
    /// @param tokenId NFT afectado.
    /// @param receiver Beneficiario de royalties.
    /// @param feeNumerator Fee en basis points.
    event TokenRoyaltyUpdated(uint256 indexed tokenId, address indexed receiver, uint96 feeNumerator);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    /// @notice El `tokenId` consultado no existe.
    error TokenDoesNotExist();

    /// @notice La operación excedería `maxSupply`.
    error MaxSupplyExceeded();

    /// @notice Cantidad cero en mint por lotes.
    error MintZeroQuantity();

    /// @notice Caller sin permiso (no owner / no aprobado).
    error Unauthorized();

    /// @notice Dirección cero donde se exige cuenta válida.
    error ZeroAddress();

    /// @notice Parámetros de royalty inválidos (receiver cero o fee >= denominador).
    error InvalidRoyalty();

    /// @notice Función aún no implementada (esqueleto Fase 1).
    error NotImplemented();

    // -------------------------------------------------------------------------
    // Views — supply y metadata
    // -------------------------------------------------------------------------

    /// @notice Techo de tokens minteables.
    /// @return Máximo de tokens que puede existir en la colección.
    function maxSupply() external view returns (uint256);

    /// @notice Cantidad de tokens ya minteados.
    /// @return Total minteado hasta el momento (`<= maxSupply`).
    function totalSupply() external view returns (uint256);

    /// @notice Raíz de metadata on-chain.
    /// @return Base URI actual (sin `tokenId` concatenado).
    function baseURI() external view returns (string memory);

    /// @notice URI de metadata de un token.
    /// @param tokenId Identificador del NFT.
    /// @return URI completa (`baseURI` + `tokenId`).
    function tokenURI(uint256 tokenId) external view returns (string memory);

    // -------------------------------------------------------------------------
    // Mutators — mint (onlyOwner en implementación)
    // -------------------------------------------------------------------------

    /// @notice Mintea un token a `to` (sin chequeo safe receiver).
    /// @param to Destinatario del NFT.
    /// @return tokenId Identificador asignado.
    function mint(address to) external returns (uint256 tokenId);

    /// @notice Mintea un token con chequeo `onERC721Received` si `to` es contrato.
    /// @param to Destinatario del NFT.
    /// @return tokenId Identificador asignado.
    function safeMint(address to) external returns (uint256 tokenId);

    /// @notice Mintea `quantity` tokens consecutivos a `to`.
    /// @param to Destinatario de los NFTs.
    /// @param quantity Cantidad a mintear (`> 0`).
    /// @return firstTokenId Primer `tokenId` del lote.
    function mintBatch(address to, uint256 quantity) external returns (uint256 firstTokenId);

    /// @notice Mint por lotes con chequeo safe receiver por token si `to` es contrato.
    /// @param to Destinatario de los NFTs.
    /// @param quantity Cantidad a mintear (`> 0`).
    /// @return firstTokenId Primer `tokenId` del lote.
    function safeMintBatch(address to, uint256 quantity) external returns (uint256 firstTokenId);

    // -------------------------------------------------------------------------
    // Admin — URI y royalties (onlyOwner)
    // -------------------------------------------------------------------------

    /// @notice Actualiza la base URI de metadata.
    /// @param uri Nueva raíz (convención: terminar en `/`).
    function setBaseURI(string calldata uri) external;

    /// @notice Configura royalty por defecto (ERC-2981).
    /// @param receiver Beneficiario de royalties.
    /// @param feeNumerator Fee en basis points (máx. 10000 con denominador 10000).
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external;

    /// @notice Configura royalty para un `tokenId` específico (sobreescribe el default).
    /// @param tokenId NFT existente.
    /// @param receiver Beneficiario de royalties del token.
    /// @param feeNumerator Fee en basis points.
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external;

    /// @notice Elimina la royalty por defecto (tokens sin override quedan sin royalty).
    function deleteDefaultRoyalty() external;

    /// @notice Restablece royalty de un token al default global.
    /// @param tokenId NFT existente.
    function resetTokenRoyalty(uint256 tokenId) external;
}
