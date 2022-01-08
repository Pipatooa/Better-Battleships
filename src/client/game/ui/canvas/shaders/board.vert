#version 300 es

precision highp float;

in vec2 vertPosition;

uniform vec2 offset;
uniform vec2 scale;

uniform vec3 boardSize;

out vec2 textureCoord;

void main()
{
    textureCoord = vertPosition / scale - offset;
    textureCoord.y = (1.0 - textureCoord.y) * boardSize.z / boardSize.y;
    textureCoord.x *= boardSize.z / boardSize.x;

    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
