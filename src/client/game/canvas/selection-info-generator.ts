import { Pattern }           from '../scenario/pattern';
import type { Ship }         from '../scenario/ship';
import type { ModelProgram } from './model-programs/model-program';

export class SelectionInfoGenerator {

    private readonly selectionInfoUniform: WebGLTexture;
    private selectionInfoSizeUniform: number;
    private selectionOffsetUniform: Float32Array;
    private selectionOffsetRaw: [number, number];

    private selectionOffsetDelta: [number, number] = [0, 0];

    private textureData: Uint8Array;

    private readonly defaultSelectionPattern: Pattern = new Pattern([[0, 0, 1]], [0, 0]);

    public constructor(private readonly gl: WebGL2RenderingContext,
                       private readonly modelProgram: ModelProgram<never, 'selectionInfo' | 'selectionInfoSize' | 'selectionSize' | 'selectionOffset'>) {

        // Create a new texture to hold information about the selected area
        this.selectionInfoUniform = this.gl.createTexture()!;
        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.selectionInfoUniform);

        this.selectionInfoSizeUniform = 1;
        this.selectionOffsetUniform = new Float32Array([0, 0]);
        this.selectionOffsetRaw = [0, 0];

        this.gl.useProgram(this.modelProgram.program);
        this.gl.uniform1i(this.modelProgram.uniformLocations.selectionInfo, 4);

        this.textureData = new Uint8Array(1);
        this.setSelectionPattern();
        this.push();
    }

    public setSelectionPattern(selectionPattern: Pattern = this.defaultSelectionPattern): void {
        const patternLargeDimension = Math.max(...selectionPattern.getBounds()) + 1;
        this.selectionInfoSizeUniform = Math.pow(2, Math.ceil(Math.log2(patternLargeDimension)));
        this.textureData = new Uint8Array(3 * this.selectionInfoSizeUniform * this.selectionInfoSizeUniform);

        for (let y = 0; y < this.selectionInfoSizeUniform; y++) {
            for (let x = 0; x < this.selectionInfoSizeUniform; x++) {
                const dataStart = 3 * (y * this.selectionInfoSizeUniform + x);
                this.textureData[dataStart] = selectionPattern.query(x, y);
                this.textureData[dataStart + 2] = selectionPattern.getBorderFlags(x, y);
            }
        }

        this.setOffsetDelta(-selectionPattern.center[0] - 0.5, -selectionPattern.center[1] - 0.5);
    }

    public setSelectionShip(ship: Ship | undefined): void {
        if (ship === undefined) {
            this.setSelectionPattern();
            return;
        }
        const shipLargeDimension = Math.max(...ship.pattern.getBounds()) + 1;
        this.selectionInfoSizeUniform = Math.pow(2, Math.ceil(Math.log2(shipLargeDimension)));
        this.textureData = new Uint8Array(3 * this.selectionInfoSizeUniform * this.selectionInfoSizeUniform);

        const shipColorPaletteIndex = ship.player.colorPaletteIndex!;
        const borderColorPaletteIndex = ship.player.team!.colorPaletteIndex!;
        for (let y = 0; y < this.selectionInfoSizeUniform; y++) {
            for (let x = 0; x < this.selectionInfoSizeUniform; x++) {
                const dataStart = 3 * (y * this.selectionInfoSizeUniform + x);
                const isShipTile = ship.pattern.query(x, y);
                if (!isShipTile)
                    continue;

                // Primary, secondary color and border flags
                this.textureData[dataStart] = shipColorPaletteIndex;
                this.textureData[dataStart + 1] = borderColorPaletteIndex;
                this.textureData[dataStart + 2] = ship.pattern.getBorderFlags(x, y);
            }
        }

        this.setOffsetDelta(-ship.pattern.center[0] - 0.5, -ship.pattern.center[1] - 0.5);
    }

    private setOffsetDelta(x: number, y: number): void {
        this.selectionOffsetDelta = [x, y];
        this.setOffset(...this.selectionOffsetRaw);
    }

    public setOffset(x: number, y: number): void {
        this.selectionOffsetRaw = [x, y];
        this.selectionOffsetUniform[0] = Math.round(x + this.selectionOffsetDelta[0]);
        this.selectionOffsetUniform[1] = Math.round(y + this.selectionOffsetDelta[1]);
    }

    /**
     * Pushes selection information to the GPU
     */
    public push(): void {
        this.gl.useProgram(this.modelProgram.program);
        this.gl.activeTexture(this.gl.TEXTURE4);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.selectionInfoUniform);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.selectionInfoSizeUniform, this.selectionInfoSizeUniform, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.textureData);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.uniform1f(this.modelProgram.uniformLocations.selectionInfoSize, this.selectionInfoSizeUniform);
        this.gl.uniform2fv(this.modelProgram.uniformLocations.selectionOffset, this.selectionOffsetUniform);
    }
}
