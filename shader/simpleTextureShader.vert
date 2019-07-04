attribute vec4 aVertexPosition;
attribute vec2 uv;


uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying mediump vec2 TexCoords;
void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix *  aVertexPosition;
    TexCoords = uv;
}