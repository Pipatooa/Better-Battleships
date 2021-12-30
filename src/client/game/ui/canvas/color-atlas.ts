import { game }                               from '../../game';
import { allPlayers }                         from '../../player';
import { getGLTextureLocation, TextureIndex } from './texture-index';
import type { TileType }                      from '../../scenario/tiletype';
import type { ModelProgram }                  from './model-programs/model-program';

export class ColorAtlas<C extends string> {

    private readonly colorData: [number, number, number][] | undefined = [
        [0, 0, 0],
        [255, 255, 255]
    ];
    
    public readonly specialColorIndices: Record<C, number>;

    public constructor(specialColors: Record<C, string>) {
        this.specialColorIndices = {} as Record<C, number>;
        this.registerSpecialColors(specialColors);
    }

    /**
     * Generates a texture containing all registered colors and pushes it to the GPU
     *
     * @param  gl            WebGL rendering context for canvas
     * @param  modelPrograms Programs to update attributes for
     */
    public push(gl: WebGL2RenderingContext, 
                modelPrograms: ModelProgram<never, 'colorAtlas' | 'colorAtlasSize'>[]): void {

        // Get minimum atlas size rounded to next power of 2
        let atlasSize = Math.sqrt(this.colorData!.length);
        atlasSize = Math.pow(2, Math.ceil(Math.log2(atlasSize)));

        const colorLength = 3;
        const textureData = new Uint8Array(colorLength * atlasSize * atlasSize);
        for (let i = 0; i < this.colorData!.length; i++) {
            const [ r, g, b ] = this.colorData![i];
            textureData[i * 3] = r;
            textureData[i * 3 + 1] = g;
            textureData[i * 3 + 2] = b;
        }

        const texture = gl.createTexture()!;
        const glTextureLocation = getGLTextureLocation(gl, TextureIndex.ColorAtlas);
        gl.activeTexture(glTextureLocation);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, atlasSize, atlasSize, 0, gl.RGB, gl.UNSIGNED_BYTE, textureData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        // Pass atlas texture to GPU
        for (const modelProgram of modelPrograms) {
            gl.useProgram(modelProgram.program);
            gl.uniform1i(modelProgram.uniformLocations.colorAtlas, TextureIndex.ColorAtlas);
            gl.uniform1f(modelProgram.uniformLocations.colorAtlasSize, atlasSize);
        }
    }

    /**
     * Converts a hex color string into RGB values
     *
     * @param    hexColor String hex color to convert
     * @returns           RGB values
     */
    public static colorFromHex(hexColor: string): [number, number, number] {
        const colorNumber = parseInt(hexColor.substr(1), 16);
        const r = colorNumber & 0xFF0000;
        const g = colorNumber & 0x00FF00;
        const b = colorNumber & 0x0000FF;
        return [r >> 16, g >> 8, b];
    }

    /**
     * Adds a new color to the palette
     *
     * @param    color RGB values to add to palette
     * @returns        Index of color in palette
     */
    public registerRGB(color: [number, number, number]): number {
        this.colorData!.push(color);
        return this.colorData!.length - 1;
    }

    /**
     * Adds a new color to the palette
     *
     * @param    color Hex color to add to palette
     * @returns        Index of color in palette
     */
    public registerHex(color: string): number {
        const rgb = ColorAtlas.colorFromHex(color);
        return this.registerRGB(rgb);
    }

    /**
     * Registers all colors used for specific purposes
     *
     * @param  specialColors Record of color names to hex color strings
     */
    public registerSpecialColors(specialColors: Record<C, string>): void {
        for (const [name, hexColor] of Object.entries(specialColors)) {
            this.specialColorIndices[name as C] = this.registerHex(hexColor as string);
        }
    }

    /**
     * Registers all colors for teams
     */
    public registerTeamColors(): void {
        for (const team of Object.values(game.teams)) {
            team.colorPaletteIndex = this.registerHex(team.color);
            this.registerHex(team.highlightColor);
        }
    }

    /**
     * Registers all colors for players
     */
    public registerPlayerColors(): void {
        for (const player of Object.values(allPlayers)) {
            player.colorPaletteIndex = this.registerHex(player.color!);
            this.registerHex(player.highlightColor!);
        }
    }

    /**
     * Registers all colors for tile types
     *
     * @param  tileTypes Array of tile types to register colors for
     */
    public registerTileColors(tileTypes: TileType[]): void {
        for (const tileType of tileTypes) {
            if (tileType.colorPaletteIndex === undefined) {
                const rgb = ColorAtlas.colorFromHex(tileType.color);
                tileType.colorPaletteIndex = this.registerRGB(rgb);
            }
        }
    }
}
