void drawBoard(float x, float y)
{
    // Lookup tile information stored within board info texture
    float infoX = (x) / boardInfoSize;
    float infoY = (y) / boardInfoSize;
    vec4 tileInfo = texture(boardInfo, vec2(infoX, infoY));

    vec4 primaryColor = getAtlasColor(tileInfo.x);
    vec4 secondaryColor = getAtlasColor(tileInfo.y);

    vec4 tileSample = texture(tileTexture, vec2(x, y));
    fragColor = mix(primaryColor, borderColor, tileSample.x);

    if (globalRenderFlags == 1) {
        if (tileInfo.w != 1.0 / 255.0) {
            fragColor.xyz *= 0.25;
            primaryColor.xyz *= 0.25;
            secondaryColor.xyz *= 0.25;
        }
        else if (fract(x) < borderRatio || fract(y) < borderRatio) {
            fragColor.xyz *= 0.25;
        }
    }

    if (tileInfo.y != 0.0)
        drawBorderedTile(x, y, primaryColor, secondaryColor, fragColor, tileInfo.z);
}
