vec4 getAtlasColor(float index)
{
    float x = index * 255.0 / colorAtlasSize;
    float y = x / colorAtlasSize;
    return texture(colorAtlas, vec2(x, y));
}
