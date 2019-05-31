
attribute vec4 aVertexColor;
attribute vec4 aVertexPosition;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix *  aVertexPosition;
    vColor = aVertexColor;
}