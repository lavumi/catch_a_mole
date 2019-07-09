attribute vec2 aPos; // vec2 pos, vec2 uv
attribute vec2 aUV;

uniform vec3 uiWorld; // posx, posy, scale
uniform mat4 projection;
varying mediump vec2 TexCoords;

void main()
{

    vec2 uiPos = vec2(
     aPos.x * uiWorld.z + uiWorld.x,
     aPos.y * uiWorld.z + uiWorld.y
    );

    vec4 position = projection * vec4(uiPos, 0.0, 1.0);
    position.zw = vec2(0.0,1.0);
    gl_Position = position;//vec4(posUV.xy, 0.0, 1.0);
    TexCoords = aUV;
} 