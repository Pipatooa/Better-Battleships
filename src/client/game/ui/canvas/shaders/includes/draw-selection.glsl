void drawSelection(float x, float y, float selectionInfoX, float selectionInfoY)
{
    vec4 selectionSample = texture(selectionInfo, vec2(selectionInfoX, selectionInfoY));

    // If selection is blank, do not draw
    if (selectionSample.x == 0.0)
        return;

    vec4 primaryColor = getAtlasColor(selectionSample.x);
    vec4 secondaryColor = getAtlasColor(selectionSample.y);

    primaryColor.xyz = mix(fragColor.xyz, primaryColor.xyz, selectionOpacity.x);
    secondaryColor.xyz = mix(fragColor.xyz, secondaryColor.xyz, selectionOpacity.y);

    drawBorderedTile(x, y, primaryColor, secondaryColor, fragColor, selectionSample.z);
}
