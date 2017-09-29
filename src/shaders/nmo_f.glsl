precision mediump float;
uniform sampler2D u_Sampler;
uniform vec2 u_step;
varying vec2 v_TexCoord;

vec2 agTexCoord[8];

float getGray(vec2 coord){
    vec3 texColor=texture2D(u_Sampler,coord).rgb;
    return (texColor.r+texColor.g+texColor.b)/3.0;
}
float clampTex(float num){
    if(num<-1.0)return -1.0;
    if(num>1.0)return 1.0;
    return num;
}
void setAgTexCoord(){
    agTexCoord[0]=vec2(-1.0,-1.0);
    agTexCoord[1]=vec2( 0.0,-1.0);
    agTexCoord[2]=vec2( 1.0,-1.0);
    agTexCoord[3]=vec2( 1.0, 0.0);
    agTexCoord[4]=vec2( 1.0, 1.0);
    agTexCoord[5]=vec2( 0.0, 1.0);
    agTexCoord[6]=vec2(-1.0, 1.0);
    agTexCoord[7]=vec2(-1.0, 0.0);
}
void main(){
    float f=getGray(v_TexCoord);

    float ag[8];
    setAgTexCoord();
    for(int i=0;i<8;i++){
        float x=v_TexCoord.x+agTexCoord[i].x*u_step.x;
        float y=v_TexCoord.y+agTexCoord[i].y*u_step.y;
        ag[i]=getGray(vec2(clampTex(x),clampTex(y)));
    }
    float r=-((ag[2] + 2.0 * ag[3] + ag[4]) - (ag[0] + 2.0 * ag[7] + ag[6]));
    float g=((ag[6] + 2.0 * ag[5] + ag[4]) - (ag[0] + 2.0 * ag[1] + ag[2]));
    gl_FragColor=vec4((r+1.0)/2.0,(g+1.0)/2.0,1.0,1.0);
}