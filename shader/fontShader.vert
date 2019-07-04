attribute vec4 posUV; // vec2 pos, vec2 uv

uniform mat4 projection;
varying mediump vec2 TexCoords;

void main()
{
    gl_Position = projection * vec4(vertex.xy, 0.0, 1.0);
    TexCoords = vertex.zw;
} 