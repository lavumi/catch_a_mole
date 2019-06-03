attribute vec4 aVertexPosition;
attribute vec4 aVertexNormal;

uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uDirectionalLight;

varying lowp vec4 vNormal;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix *  aVertexPosition;
    vec4 light = vec4( uDirectionalLight.x, uDirectionalLight.y, uDirectionalLight.z, 1);

    vec4 worldNormal = uWorldMatrix * aVertexNormal;

    vNormal = aVertexNormal ;
}