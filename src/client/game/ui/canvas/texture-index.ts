/**
 * Enum of indexes for different textures
 */
export const enum TextureIndex {
    ColorAtlas,
    Tile,
    TileBorder,
    BoardInfo,
    SelectionInfo
}

/**
 * Finds WebGL texture location for a given texture index
 *
 * @param    gl           WebGL rendering context to find enum value
 * @param    textureIndex Texture index to find enum value for
 * @returns               WebGL enum value for texture location
 */
export function getGLTextureLocation(gl: WebGL2RenderingContext, textureIndex: TextureIndex): number {
    const key = `TEXTURE${textureIndex}` as keyof WebGL2RenderingContext;
    return gl[key] as number;
}
