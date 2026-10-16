Shader "Escape1829/NativeSilhouette" {
    Properties { _Opacity ("Opacity", Range(0,1)) = 1 }
    SubShader { Tags { "Queue"="Transparent" "RenderType"="Transparent" } Blend SrcAlpha OneMinusSrcAlpha ZWrite Off Cull Back
        Pass { CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            float _Opacity;
            float4 vert(float4 vertex:POSITION):SV_POSITION { return UnityObjectToClipPos(vertex); }
            fixed4 frag():SV_Target { return fixed4(.0006,.0009,.0009,_Opacity); }
        ENDCG }
    }
}
