void drawBorderedTile(float x, float y, vec4 primaryColor, vec4 secondaryColor, vec4 backgroundColor, float borderFlags)
{
    vec4 borderSample = texture(borderTextureArray, vec3(x, y, borderFlags * 255.0));
    vec4 tileColor = mix(primaryColor, secondaryColor, borderSample.x);
    fragColor = mix(backgroundColor, tileColor, borderSample.w);
}
