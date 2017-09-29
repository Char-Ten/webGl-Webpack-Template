precision mediump float;
uniform sampler2D u_Sampler_0;
uniform sampler2D u_Sampler_1;
uniform vec2 u_step;
uniform vec2 u_resolution;
uniform vec3 u_light;

varying vec2 v_TexCoord;

void main(){
    vec4 LightColor=vec4(0.8, 0.8, 0.5, 1.0);

    vec4 AmbientColor=vec4(1.0, 1.0, 1.0, 0.06);

    vec3 Falloff=vec3(0.3,0.5,15.0);

    vec4 DiffColor=texture2D(u_Sampler_0, v_TexCoord);

    vec3 NormalMap=texture2D(u_Sampler_1, v_TexCoord).rgb;

    vec3 LightDir=vec3(u_light.xy-(gl_FragCoord.xy/u_resolution.xy),u_light.z);

    LightDir.x*=u_resolution.x/u_resolution.y;

    float D=length(LightDir);

    vec3 N=normalize(NormalMap * 2.0 - 1.0);

    vec3 L=normalize(LightDir);

    vec3 Diffuse = (LightColor.rgb * LightColor.a) * max(dot(N, L), 0.0);

    vec3 Ambient = AmbientColor.rgb * AmbientColor.a;

    float Attenuation = 1.0 / ( Falloff.x + (Falloff.y*D) + (Falloff.z*D*D) );

    vec3 Intensity = Ambient + Diffuse * Attenuation;
    vec3 FinalColor = DiffColor.rgb * Intensity;
    gl_FragColor =  vec4(FinalColor,1.0);

}