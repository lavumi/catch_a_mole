
varying lowp float vNormal;
void main() {
    gl_FragColor = vec4(vNormal, vNormal, vNormal, 1);
}
