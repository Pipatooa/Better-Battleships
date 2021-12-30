#version 300 es

precision highp float;

in vec2 vertPosition;

uniform vec2 offset;
uniform vec2 scale;

out vec2 textureCoord;

void main()
{
    textureCoord = vertPosition / scale - offset;
    textureCoord.y = 1.0 - textureCoord.y;
    gl_Position = vec4(vertPosition, 0.0, 1.0);
}
