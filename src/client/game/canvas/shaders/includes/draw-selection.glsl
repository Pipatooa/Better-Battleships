void drawSelection(float x, float y, float selectionInfoX, float selectionInfoY)
{
    vec4 selectionSample = texture(selectionInfo, vec2(selectionInfoX, selectionInfoY));

    // If selection is blank, do not draw
    if (selectionSample.x == 0.0)
        return;

    vec4 primaryColor;
    vec4 secondaryColor;

    // If no secondary color, draw transparent white
    if (selectionSample.y == 0.0)
    {
        primaryColor = mix(fragColor, vec4(1.0, 1.0, 1.0, 1.0), 0.2);
        secondaryColor = primaryColor;
    }
    else
    {
        primaryColor = getAtlasColor(selectionSample.x);
        secondaryColor = getAtlasColor(selectionSample.y);
    }

    drawBorderedTile(x, y, primaryColor, secondaryColor, fragColor, selectionSample.z);
}
