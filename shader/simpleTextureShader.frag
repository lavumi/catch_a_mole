uniform sampler2D texture;

varying mediump vec2 TexCoords;
void main() {
    mediump vec4 sampled = texture2D(texture, TexCoords);
    gl_FragColor = vec4( 0.2745, 0.7176, 0.2863, 1.0);sampled;//vec4( TexCoords.x, TexCoords.y, 0,1);
}
