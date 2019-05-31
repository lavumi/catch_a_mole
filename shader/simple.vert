attribute vec4 aVertexPosition;


uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;


void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix *  aVertexPosition;
}