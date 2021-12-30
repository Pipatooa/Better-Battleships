#version 300 es

precision highp float;
precision highp sampler2D;
precision highp sampler2DArray;

in vec2 textureCoord;

uniform vec4 backgroundColor;

uniform sampler2D colorAtlas;
uniform float colorAtlasSize;

uniform sampler2D tileTexture;
uniform float borderRatio;
uniform vec4 borderColor;

uniform sampler2DArray borderTextureArray;
uniform float secondaryBorderRatio;

uniform sampler2D boardInfo;
uniform float boardInfoSize;
uniform vec2 boardSize;

uniform sampler2D selectionInfo;
uniform float selectionInfoSize;
uniform vec2 selectionSize;
uniform vec2 selectionOffset;

uniform int globalRenderFlags;

out vec4 fragColor;

@import ./includes/get-atlas-color;
@import ./includes/draw-bordered-tile;
@import ./includes/draw-board;
@import ./includes/draw-selection;

void main()
{
    float x = textureCoord.x * (boardSize.x + borderRatio);
    float y = textureCoord.y * (boardSize.y + borderRatio);

    float selectionInfoX = (x - selectionOffset.x) / selectionInfoSize;
    float selectionInfoY = (y - selectionOffset.y) / selectionInfoSize;

    fragColor = backgroundColor;

    // Main board rendering
    if (textureCoord.x >= 0.0 && textureCoord.x <= 1.0 && textureCoord.y >= 0.0 && textureCoord.y <= 1.0)
        drawBoard(x, y);
    else if (globalRenderFlags == 1)
        fragColor.xyz *= 0.25;

    // Selection rendering
    if (selectionInfoX >= 0.0 && selectionInfoX <= 1.0 && selectionInfoY >= 0.0 && selectionInfoY <= 1.0)
        drawSelection(x, y, selectionInfoX, selectionInfoY);
}
