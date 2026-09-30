Shader "Escape1829/CloudSky"
{
 Properties { _Zenith("Zenith",Color)=(.27,.44,.53,1) _Horizon("Horizon",Color)=(.6,.68,.68,1) _Cloud("Cloud",Color)=(.32,.43,.48,1) _Rim("Rim",Color)=(1,.9,.73,1) _SunColor("Sun",Color)=(1,.94,.83,1) _NightSky("Night",Float)=0 }
 SubShader {
  Tags {"Queue"="Background" "RenderType"="Background" "PreviewType"="Skybox"} Cull Off ZWrite Off
  Pass { CGPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #pragma target 3.0
   #include "UnityCG.cginc"
   #include "Weather.cginc"
   float4 _Zenith,_Horizon,_Cloud,_Rim,_SunColor;float3 _SunDirection;float _NightSky;
   struct v2f {float4 position:SV_POSITION;float3 direction:TEXCOORD0;};
   v2f vert(appdata_base v){v2f o;o.position=UnityObjectToClipPos(v.vertex);o.direction=v.vertex.xyz;return o;}
   half4 frag(v2f i):SV_Target {
    float3 d=normalize(i.direction);float elevation=max(d.y,0);float3 color=lerp(_Horizon.rgb,_Zenith.rgb,smoothstep(0,.32,elevation));
    float sunFacing=max(dot(d,_SunDirection),0);color+=_SunColor.rgb*pow(sunFacing,18)*lerp(.38,.06,_NightSky);
    float2 p=d.xz/(elevation+.22)*7.5+float2(_WeatherTime*.012,_WeatherTime*.003);
    float bank=CloudNoise(d.xz*13+float2(_WeatherTime*.007,8));
    float density=CloudNoise(p+CloudNoise(p*.53)*.8)+bank*.13*exp(-pow((d.y-.045)*8,2));
    float cover=smoothstep(.32,.64,density)*smoothstep(-.015,.035,d.y),edge=smoothstep(.38,.51,density)*(1-smoothstep(.51,.65,density));
    float silver=edge*pow(sunFacing,8)*(1-smoothstep(.12,.5,elevation));
    color=lerp(color,lerp(_Cloud.rgb,_Rim.rgb,silver*.65),cover*.94);color=lerp(_Horizon.rgb,color,smoothstep(-.015,.045,d.y));
    color+=_SunColor.rgb*smoothstep(.99965,.99985,sunFacing)*_NightSky*1.5*(1-cover);return half4(color,1);
   }
   ENDCG }
 }
}
