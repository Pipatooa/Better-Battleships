import { Pattern }                            from '../../scenario/pattern';
import { getGLTextureLocation, TextureIndex } from './texture-index';
import type { RotatablePattern }              from '../../scenario/rotatable-pattern';
import type { Ship }                          from '../../scenario/ship';
import type { BoardProgram }                  from './model-programs/board-program';
import type { Rotation }                      from 'shared/scenario/rotation';

/**
 * SelectionInfoGenerator - Client Version
 *
 * Generates selection information texture to be passed to GPU
 */
export class SelectionInfoGenerator {

    private static readonly defaultSelectionPattern: Pattern = new Pattern([[0, 0, 1]], [0, 0], [0, 0]);
    private static readonly defaultSelectionOpacity = new Float32Array([0.2, 0.2]);
    private static readonly shipSelectionOpacity = new Float32Array([0.7, 1.0]);

    private readonly selectionInfoUniform: WebGLTexture;
    private selectionInfoSizeUniform: number;
    private selectionOffsetUniform: Float32Array;
    private selectionOpacityUniform: Float32Array = SelectionInfoGenerator.defaultSelectionOpacity;

    private selectionOffsetRaw: [number, number];
    private selectionOffsetDelta: [number, number] = [0, 0];

    private textureData: Uint8Array;

    public constructor(private readonly gl: WebGL2RenderingContext,
                       private readonly modelProgram: BoardProgram) {

        // Create a new texture to hold information about the selected area
        this.selectionInfoUniform = this.gl.createTexture()!;
        const glTextureLocation = getGLTextureLocation(this.gl, TextureIndex.SelectionInfo);
        this.gl.activeTexture(glTextureLocation);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.selectionInfoUniform);

        this.selectionInfoSizeUniform = 1;
        this.selectionOffsetUniform = new Float32Array([0, 0]);
        this.selectionOffsetRaw = [0, 0];

        this.gl.useProgram(this.modelProgram.program);
        this.gl.uniform1i(this.modelProgram.uniformLocations.selectionInfo, TextureIndex.SelectionInfo);

        this.textureData = new Uint8Array(1);
        this.setSelectionPattern();
        this.push();
    }

    /**
     * Replaces selection pattern with provided pattern
     *
     * @param  selectionPattern Selection pattern to use
     */
    public setSelectionPattern(selectionPattern: Pattern = SelectionInfoGenerator.defaultSelectionPattern): void {

        // Determine minimum texture size and create texture data array
        const patternLargeDimension = Math.max(...selectionPattern.bounds) + 1;
        this.selectionInfoSizeUniform = Math.pow(2, Math.ceil(Math.log2(patternLargeDimension)));
        this.textureData = new Uint8Array(3 * this.selectionInfoSizeUniform * this.selectionInfoSizeUniform);

        // Populate texture data array using pattern values
        for (let y = 0; y < this.selectionInfoSizeUniform; y++) {
            for (let x = 0; x < this.selectionInfoSizeUniform; x++) {
                const dataStart = 3 * (y * this.selectionInfoSizeUniform + x);
                const patternValue = selectionPattern.query(x, y);

                // Primary color, secondary color, border flags
                this.textureData[dataStart] = patternValue;
                this.textureData[dataStart + 1] = patternValue;
                this.textureData[dataStart + 2] = selectionPattern.getBorderFlags(x, y);
            }
        }

        this.selectionOpacityUniform = SelectionInfoGenerator.defaultSelectionOpacity;
        this.setOffsetDelta(-selectionPattern.center[0] - 0.5, -selectionPattern.center[1] - 0.5);
    }

    /**
     * Replaces selection pattern with a ship
     *
     * @param  ship     Ship to use as selection
     * @param  rotation Optional rotation to apply to ship pattern
     */
    public setSelectionShip(ship: Ship | undefined, rotation?: Rotation): void {

        // Set default selection pattern if no ship provided
        if (ship === undefined) {
            this.setSelectionPattern();
            return;
        }

        // Apply rotation if present
        let pattern: RotatablePattern = ship.pattern;
        if (rotation !== undefined)
            pattern = pattern.rotated(rotation);

        // Determine minimum texture size and create texture data array
        const shipLargeDimension = Math.max(...pattern.bounds) + 1;
        this.selectionInfoSizeUniform = Math.pow(2, Math.ceil(Math.log2(shipLargeDimension)));
        this.textureData = new Uint8Array(3 * this.selectionInfoSizeUniform * this.selectionInfoSizeUniform);

        // Populate texture data array using pattern values
        const shipColorPaletteIndex = ship.player.colorPaletteIndex!;
        const borderColorPaletteIndex = ship.player.team!.colorPaletteIndex!;
        for (let y = 0; y < this.selectionInfoSizeUniform; y++) {
            for (let x = 0; x < this.selectionInfoSizeUniform; x++) {
                const dataStart = 3 * (y * this.selectionInfoSizeUniform + x);
                const isShipTile = pattern.query(x, y);
                if (!isShipTile)
                    continue;

                // Primary color, secondary color, border flags
                this.textureData[dataStart] = shipColorPaletteIndex;
                this.textureData[dataStart + 1] = borderColorPaletteIndex;
                this.textureData[dataStart + 2] = pattern.getBorderFlags(x, y);
            }
        }

        this.selectionOpacityUniform = SelectionInfoGenerator.shipSelectionOpacity;
        this.setOffsetDelta(-pattern.center[0] - 0.5, -pattern.center[1] - 0.5);
    }

    /**
     * Sets the additional offset which is added to the offset when set
     *
     * @param  x Horizontal offset for set offset value
     * @param  y Vertical offset for set offset value
     */
    private setOffsetDelta(x: number, y: number): void {
        this.selectionOffsetDelta = [x, y];
        this.setOffset(...this.selectionOffsetRaw);
    }

    /**
     * Set tile offset for selection
     *
     * @param    x Horizontal offset
     * @param    y Vertical offset
     * @returns    Whether the rounded tile offset was changed
     */
    public setOffset(x: number, y: number): boolean {
        const oldX = this.selectionOffsetUniform[0];
        const oldY = this.selectionOffsetUniform[1];
        this.selectionOffsetRaw = [x, y];
        const newX = Math.round(x + this.selectionOffsetDelta[0]);
        const newY = Math.round(y + this.selectionOffsetDelta[1]);
        this.selectionOffsetUniform[0] = newX;
        this.selectionOffsetUniform[1] = newY;
        return newX !== oldX || newY !== oldY;
    }

    /**
     * Sets the opacity to render the selection at
     *
     * @param  opacity       Opacity to set for inner selection
     * @param  borderOpacity Opacity to set for border of selection
     */
    public setSelectionOpacity(opacity: number, borderOpacity: number): void {
        this.selectionOpacityUniform = new Float32Array([opacity, borderOpacity]);
    }

    /**
     * Pushes selection information to the GPU
     */
    public push(): void {
        this.gl.useProgram(this.modelProgram.program);
        const glTextureLocation = getGLTextureLocation(this.gl, TextureIndex.SelectionInfo);
        this.gl.activeTexture(glTextureLocation);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.selectionInfoUniform);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.selectionInfoSizeUniform, this.selectionInfoSizeUniform, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureData);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.uniform1f(this.modelProgram.uniformLocations.selectionInfoSize, this.selectionInfoSizeUniform);
        this.gl.uniform2fv(this.modelProgram.uniformLocations.selectionOffset, this.selectionOffsetUniform);
        this.gl.uniform2fv(this.modelProgram.uniformLocations.selectionOpacity, this.selectionOpacityUniform);
    }
}
