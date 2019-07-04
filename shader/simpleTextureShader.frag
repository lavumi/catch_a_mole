uniform sampler2D texture;

varying mediump vec2 TexCoords;
void main() {
    mediump vec4 sampled = texture2D(texture, TexCoords);
    gl_FragColor = sampled;//vec4( TexCoords.x, TexCoords.y, 0,1);
}
