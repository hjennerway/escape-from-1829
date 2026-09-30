Shader "Escape1829/ColourGrade"
{
 Properties { _MainTex("Scene",2D)="white"{} _Exposure("Exposure",Float)=1.15 }
 SubShader { Cull Off ZWrite Off ZTest Always
 Pass { CGPROGRAM
 #pragma vertex vert_img
 #pragma fragment frag
 #include "UnityCG.cginc"
 sampler2D _MainTex;float _Exposure;
 fixed4 frag(v2f_img i):SV_Target {
  // Same ACES fit and viewing-exposure convention as Three.js (MIT license).
  float3 c=tex2D(_MainTex,i.uv).rgb*_Exposure/.6;
  c=mul(float3x3(.59719,.35458,.04823,.076,.90834,.01566,.0284,.13383,.83777),c);
  c=(c*(c+.0245786)-.000090537)/(c*(.983729*c+.432951)+.238081);
  c=mul(float3x3(1.60475,-.53108,-.07367,-.10208,1.10813,-.00605,-.00327,-.07276,1.07602),c);
  return float4(saturate(c),1);
 }
 ENDCG }
 }
}
