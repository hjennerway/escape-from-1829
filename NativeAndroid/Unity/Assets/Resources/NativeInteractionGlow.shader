Shader "Escape1829/InteractionGlow"
{
    Properties { _Color ("Glow colour",Color)=(1,.63,.19,1) }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        Cull Off ZWrite Off Blend SrcAlpha One
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            fixed4 _Color;
            struct Varying { float4 position:SV_POSITION;float2 uv:TEXCOORD0; };
            Varying vert(appdata_base v){Varying o;o.position=UnityObjectToClipPos(v.vertex);o.uv=v.texcoord.xy;return o;}
            fixed4 frag(Varying i):SV_Target{
                float radius=length((i.uv-.5)*2);
                float soft=1-smoothstep(.15,1,radius);
                float ring=smoothstep(.45,.55,radius)*(1-smoothstep(.60,.78,radius));
                return fixed4(_Color.rgb,_Color.a*(.7*soft+.35*ring));
            }
            ENDCG
        }
    }
}
