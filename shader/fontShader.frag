uniform sampler2D texture;
varying mediump vec2 TexCoords;

void main() {
    mediump vec4 sampled = texture2D(texture, TexCoords);
    mediump float color = sampled.b;

    gl_FragColor = vec4(0, 0, 0, sampled.a);//vec4( TexCoords.x, TexCoords.y, 0,1);
}
