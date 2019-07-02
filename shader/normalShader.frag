
varying mediump vec4 vNormal;
varying mediump float vclipPlane;
void main() {
   // mediump float temp = vNormal.w;
    if(vclipPlane < 0.0)
        discard;

    mediump vec4 resultColor = vec4(vNormal.x, vNormal.y, vNormal.z, 1.0);

    gl_FragColor = resultColor;//vec4(0, 0.2, 1, 1);
}
