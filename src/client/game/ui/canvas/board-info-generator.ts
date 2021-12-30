import { ColorAtlas }                         from './color-atlas';
import { getGLTextureLocation, TextureIndex } from './texture-index';
import type { Board, Tile }                   from '../../scenario/board';
import type { Pattern }                       from '../../scenario/pattern';
import type { ModelProgram }                  from './model-programs/model-program';

/**
 * BoardInfoGenerator - Client Version
 *
 * Generates board information texture to be passed to GPU
 */
export class BoardInfoGenerator {

    // Constants
    private static readonly borderRatio = 0.03;
    private static readonly secondaryBorderRatio = 0.03;
    private static readonly tileTextureSize = 64;
    private static readonly borderColor = new Float32Array([...ColorAtlas.colorFromHex('#161a6b').map(v => v / 255), 1]);

    // Generated tile textures
    private static texturesGenerated = false;
    private static actualBorderRatio: number;
    private static tileTextureData: Uint8Array;
    private static tileBorderTextureArrayData: Uint8Array;

    // WebGL uniforms
    private readonly boardInfoUniform: WebGLTexture;
    private globalRenderFlagsUniform = 0;

    // Generated board texture
    private textureData: Uint8Array;
    private textureSize: number;

    // Tracking
    private board: Board;
    private _highlightedRegion: string | undefined;

    public constructor(private readonly gl: WebGL2RenderingContext,
                       private readonly modelProgram: ModelProgram<never, 'tileTexture' | 'borderRatio' | 'borderColor' | 'borderTextureArray' | 'boardInfo' | 'boardInfoSize' | 'boardSize' | 'globalRenderFlags'>,
                       board: Board) {

        if (!BoardInfoGenerator.texturesGenerated) {
            BoardInfoGenerator.generateTileTexture();
            BoardInfoGenerator.generateTileBorderTextureArray();
            BoardInfoGenerator.texturesGenerated = true;
        }

        // Create a new texture to hold information about the board
        this.boardInfoUniform = this.gl.createTexture()!;
        const glTextureLocation = getGLTextureLocation(this.gl, TextureIndex.BoardInfo);
        this.gl.activeTexture(glTextureLocation);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.boardInfoUniform);

        // Generate board information for the first time
        this.textureData = undefined as unknown as Uint8Array;
        this.textureSize = 0;
        this.board = board;
        this.changeBoard(board);
        this.pushTileTexture();
    }

    /**
     * Generates luminance texture for a tile for border shading
     *
     * Top and left sides have max luminance corresponding to tile border
     */
    private static generateTileTexture(): void {
        this.tileTextureData = new Uint8Array(this.tileTextureSize * this.tileTextureSize);
        const borderSize = Math.round(this.tileTextureSize * this.borderRatio);
        this.actualBorderRatio = borderSize / this.tileTextureSize;

        for (let y = 0; y < this.tileTextureSize; y++) {
            for (let x = 0; x < this.tileTextureSize; x++) {
                const dataStart = y * this.tileTextureSize + x;
                if (x < borderSize || y < borderSize) {
                    this.tileTextureData[dataStart] = 255;
                }
            }
        }
    }

    /**
     * Generates alpha luminance textures describing border drawing combinations
     *
     * Alpha channel codes brightness of tile
     * Luminance channel codes brightness of border color
     */
    private static generateTileBorderTextureArray(): void {

        // Divide tile width into 4 intervals
        const i1 = Math.round(this.tileTextureSize * this.borderRatio);
        const i2 = i1 + Math.round(this.tileTextureSize * this.secondaryBorderRatio);
        const i3 = this.tileTextureSize - 1 - i2 + i1;
        const i4 = this.tileTextureSize - 1;

        this.tileBorderTextureArrayData = new Uint8Array(2 * this.tileTextureSize * this.tileTextureSize * 256);

        // Generate texture for each combination of tile borders
        for (let z = 0; z < 256; z++) {

            // Alpha channel coding
            this.fillBorderTextureArrayDataRange(z, i1, i1, i4, i4, 1);
            // NXNY, NY, NX
            if ((z & 0b00001011) === 0) this.fillBorderTextureArrayDataRange(z, 0, 0, i1, i1, 1);
            if ((z & 0b00000010) === 0) this.fillBorderTextureArrayDataRange(z, i1, 0, i4, i1, 1);
            if ((z & 0b00001000) === 0) this.fillBorderTextureArrayDataRange(z, 0, i1, i1, i4, 1);

            // Luminance channel coding
            // NXNY, NY, PXNY, NX, PX, NXPY, PY, PXPY
            if ((z & 0b00000001) !== 0) this.fillBorderTextureArrayDataRange(z, 0, 0, i2, i2, 0);
            if ((z & 0b00000010) !== 0) this.fillBorderTextureArrayDataRange(z, 0, i1, i4, i2, 0);
            if ((z & 0b00000100) !== 0) this.fillBorderTextureArrayDataRange(z, i3, 0, i4, i2, 0);
            if ((z & 0b00001000) !== 0) this.fillBorderTextureArrayDataRange(z, i1, 0, i2, i4, 0);
            if ((z & 0b00010000) !== 0) this.fillBorderTextureArrayDataRange(z, i3, 0, i4, i4, 0);
            if ((z & 0b00100000) !== 0) this.fillBorderTextureArrayDataRange(z, 0, i3, i2, i4, 0);
            if ((z & 0b01000000) !== 0) this.fillBorderTextureArrayDataRange(z, 0, i3, i4, i4, 0);
            if ((z & 0b10000000) !== 0) this.fillBorderTextureArrayDataRange(z, i3, i3, i4, i4, 0);
        }
    }

    /**
     * Fills up a 2D portion of a slice of the border texture array
     *
     * @param  z          Index of 2D slice in array
     * @param  xStart     Starting X coordinate in slice
     * @param  yStart     Starting Y coordinate in slice
     * @param  xEnd       Finishing X coordinate in slice
     * @param  yEnd       Finishing Y coordinate in slice
     * @param  dataOffset Amount to offset data start to access channel of pixel
     */
    private static fillBorderTextureArrayDataRange(z: number, xStart: number, yStart: number, xEnd: number, yEnd: number, dataOffset: number): void {
        for (let y = yStart; y <= yEnd; y++) {
            for (let x = xStart; x <= xEnd; x++) {
                const dataStart = 2 * ((z * this.tileTextureSize + y) * this.tileTextureSize + x);
                this.tileBorderTextureArrayData[dataStart + dataOffset] = 255;
            }
        }
    }

    /**
     * Updates information for a given rectangular area of the board
     *
     * @param  xStart Starting X coordinate of area
     * @param  yStart Starting Y coordinate of area
     * @param  xEnd   Finishing X coordinate of area
     * @param  yEnd   Finishing Y coordinate of area
     */
    public updateArea(xStart: number, yStart: number, xEnd: number, yEnd: number): void {
        for (let y = yStart; y <= yEnd; y++) {
            const row = this.board.tiles[y];
            for (let x = xStart; x <= xEnd; x++) {
                const tile = row[x];
                this.updateTile(x, y, tile);
            }
        }
    }

    /**
     * Updates information for a given tile of the board
     *
     * @param  x    X coordinate of tile
     * @param  y    Y coordinate of tile
     * @param  tile Optionally prefetched tile
     */
    public updateTile(x: number, y: number, tile?: Tile): void {
        console.log(x, y);
        tile = tile ?? this.board.tiles[y][x];

        const dataStart = this.getDataStart(x, y);
        const ship = tile[2];

        if (ship !== undefined) {
            if (ship.selected) {
                this.textureData[dataStart] = ship.player.colorPaletteIndex! + 1;
                this.textureData[dataStart + 1] = ship.player.team!.colorPaletteIndex! + 1;
            } else {
                this.textureData[dataStart] = ship.player.colorPaletteIndex!;
                this.textureData[dataStart + 1] = ship.player.team!.colorPaletteIndex!;
            }

            this.textureData[dataStart + 2] = ship.pattern.getBorderFlags(x - ship.x!, y - ship.y!);

        } else {
            this.textureData[dataStart] = tile[0].colorPaletteIndex!;
            this.textureData[dataStart + 1] = 0;
        }
    }

    /**
     * Updates information for all tiles on the board
     */
    public updateAll(): void {
        this.updateArea(0, 0, this.board.size[0] - 1, this.board.size[1] - 1);
    }

    /**
     * Returns the location of the first byte pixel data corresponding to a tile
     *
     * @param    x X coordinate of tile
     * @param    y Y coordinate of tile
     * @returns    Location of first byte of pixel data
     */
    private getDataStart(x: number, y: number): number {
        return 4 * (y * this.textureSize + x);
    }

    /**
     * Sets a global render flag
     *
     * @param  flag  Flag to set
     * @param  value Boolean value to set flag to
     */
    private setGlobalRenderFlag(flag: GlobalRenderFlag, value: boolean): void {
        this.globalRenderFlagsUniform |= flag;
        if (!value)
            this.globalRenderFlagsUniform ^= flag;
    }

    /**
     * Sets a render flag for a given tile
     *
     * @param  dataStart Location of first byte of pixel data
     * @param  flag      Flag to set
     * @param  value     Boolean value to set flag to
     */
    private setRenderFlag(dataStart: number, flag: RenderFlag, value: boolean): void {
        this.textureData[dataStart + 3] |= flag;
        if (!value)
            this.textureData[dataStart + 3] ^= flag;
    }

    /**
     * Flags a region to be highlighted
     *
     * @param  id Id of region to highlight
     */
    public highlightRegion(id: string): void {
        this._highlightedRegion = id;
        for (let y = 0; y < this.board.size[1]; y++) {
            const row = this.board.tiles[y];
            for (let x = 0; x < this.board.size[0]; x++) {
                const regions = row[x][1];
                const highlighted = regions.map(r => r.id).includes(id);
                this.setRenderFlag(this.getDataStart(x, y), RenderFlag.Highlighted, highlighted);
            }
        }
        this.setGlobalRenderFlag(GlobalRenderFlag.HighlightMode, true);
    }

    /**
     * Highlights a region of tiles as defined by a pattern
     *
     * @param  x       X coordinate of pattern
     * @param  y       Y coordinate of pattern
     * @param  pattern Pattern describing area to highlight
     */
    public highlightPattern(x: number, y: number, pattern: Pattern): void {
        for (const [dx, dy] of pattern.patternEntries)
            this.setRenderFlag(this.getDataStart(x + dx, y + dy), RenderFlag.Highlighted, true);
        this.setGlobalRenderFlag(GlobalRenderFlag.HighlightMode, true);
    }

    /**
     * Removes all highlights from the board
     */
    public clearHighlight(): void {
        this._highlightedRegion = undefined;
        for (let y = 0; y < this.board.size[1]; y++) {
            for (let x = 0; x < this.board.size[0]; x++) {
                this.setRenderFlag(this.getDataStart(x, y), RenderFlag.Highlighted, false);
            }
        }
        this.setGlobalRenderFlag(GlobalRenderFlag.HighlightMode, false);
    }

    /**
     * Changes board for which this generator creates information for
     *
     * @param  board New board to generate information for
     */
    public changeBoard(board: Board): void {
        this.board.informationGenerator = undefined;
        this.board = board;
        this.board.informationGenerator = this;

        // Determine smallest 2^n size texture that accommodates board
        const boardLargeDimension = Math.max(...this.board.size);
        this.textureSize = Math.pow(2, Math.ceil(Math.log2(boardLargeDimension)));
        this.textureData = new Uint8Array(4 * this.textureSize * this.textureSize);

        // Generate tile information for the first time
        this.updateAll();

        // Pass board information to GPU
        this.gl.useProgram(this.modelProgram.program);
        this.gl.uniform1i(this.modelProgram.uniformLocations.boardInfo, TextureIndex.BoardInfo);
        this.gl.uniform1f(this.modelProgram.uniformLocations.boardInfoSize, this.textureSize);
        this.gl.uniform2fv(this.modelProgram.uniformLocations.boardSize, new Float32Array(this.board.size));
    }

    /**
     * Pushes board information texture to the GPU
     */
    public push(): void {
        this.gl.useProgram(this.modelProgram.program);
        const glTextureLocation = getGLTextureLocation(this.gl, TextureIndex.BoardInfo);
        this.gl.activeTexture(glTextureLocation);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.boardInfoUniform);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.textureSize, this.textureSize, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textureData);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.uniform1i(this.modelProgram.uniformLocations.globalRenderFlags, this.globalRenderFlagsUniform);
    }

    /**
     * Pushes tile texture information to the GPU
     */
    private pushTileTexture(): void {
        this.gl.useProgram(this.modelProgram.program);

        // Main tile texture
        const tileTexture = this.gl.createTexture();
        const glTileTextureLocation = getGLTextureLocation(this.gl, TextureIndex.Tile);
        this.gl.activeTexture(glTileTextureLocation);
        this.gl.bindTexture(this.gl.TEXTURE_2D, tileTexture);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, BoardInfoGenerator.tileTextureSize, BoardInfoGenerator.tileTextureSize,
            0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, BoardInfoGenerator.tileTextureData);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.uniform1i(this.modelProgram.uniformLocations.tileTexture, TextureIndex.Tile);

        this.gl.uniform1f(this.modelProgram.uniformLocations.borderRatio, BoardInfoGenerator.actualBorderRatio);
        this.gl.uniform4fv(this.modelProgram.uniformLocations.borderColor, BoardInfoGenerator.borderColor);

        // Tile border texture array
        const tileBorderTextureArray = this.gl.createTexture();
        const glTileBorderTextureLocation = getGLTextureLocation(this.gl, TextureIndex.TileBorder);
        this.gl.activeTexture(glTileBorderTextureLocation);
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, tileBorderTextureArray);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texImage3D(this.gl.TEXTURE_2D_ARRAY, 0, this.gl.LUMINANCE_ALPHA, BoardInfoGenerator.tileTextureSize, BoardInfoGenerator.tileTextureSize, 256,
            0, this.gl.LUMINANCE_ALPHA, this.gl.UNSIGNED_BYTE, BoardInfoGenerator.tileBorderTextureArrayData);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST_MIPMAP_NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D_ARRAY);
        this.gl.uniform1i(this.modelProgram.uniformLocations.borderTextureArray, TextureIndex.TileBorder);
    }

    /**
     * Getters and setters
     */

    public get highlightedRegion(): string | undefined {
        return this._highlightedRegion;
    }
}

/**
 * Render flags applying to entire board
 */
enum GlobalRenderFlag {
    HighlightMode = 1
}

/**
 * Render flags corresponding to individual tiles of the board
 */
enum RenderFlag {
    Highlighted = 1
}
