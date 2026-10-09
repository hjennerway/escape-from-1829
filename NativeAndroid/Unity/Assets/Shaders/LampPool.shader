Shader "Escape1829/LampPool"
{
    Properties { _MainTex("Soft pool",2D)="white"{} _Color("Colour",Color)=(1,.68,.33,.26) }
    SubShader
    {
        Tags { "Queue"="Transparent+1" "RenderType"="Transparent" "IgnoreProjector"="True" }
        // Keep the road's depth occlusion, with a slope-aware bias to avoid
        // coplanar flicker at aerial distances and on mobile depth buffers.
        // The exported road layers use offsets 1..8; glow owns layer 9.
        Cull Off ZWrite Off ZTest LEqual Offset -9,-18 Blend SrcAlpha One
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_fog
            #include "UnityCG.cginc"
            sampler2D _MainTex;float4 _Color;
            struct appdata { float4 vertex:POSITION;float2 uv:TEXCOORD0; };
            struct output { float4 position:SV_POSITION;float2 uv:TEXCOORD0;UNITY_FOG_COORDS(1) };
            output vert(appdata v){output o;o.position=UnityObjectToClipPos(v.vertex);o.uv=v.uv;UNITY_TRANSFER_FOG(o,o.position);return o;}
            fixed4 frag(output i):SV_Target{fixed4 c=tex2D(_MainTex,i.uv)*_Color;UNITY_APPLY_FOG_COLOR(i.fogCoord,c,fixed4(0,0,0,0));return c;}
            ENDCG
        }
    }
}
