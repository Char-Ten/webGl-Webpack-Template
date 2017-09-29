precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
float nor(float n){
    return (n+1.0)/2.0;
}
void main(){
    gl_FragColor=texture2D(u_Sampler,v_TexCoord);
}