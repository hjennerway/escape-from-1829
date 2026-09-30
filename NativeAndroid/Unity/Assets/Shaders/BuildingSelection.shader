Shader "Escape1829/BuildingSelection"
{
    Properties { _Opacity ("Selection opacity", Range(0,1)) = 0.048 }
    SubShader
    {
        Tags { "Queue"="Transparent+10" "RenderType"="Transparent" }
        // Exact ward surfaces follow the building down to its base. Depth
        // testing keeps nearby walls and the terrain in front of the tint.
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        ZTest LEqual
        Cull Back
        Offset -1, -1
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            float _Opacity;
            float4 vert(float4 position:POSITION):SV_POSITION { return UnityObjectToClipPos(position); }
            fixed4 frag():SV_Target { return fixed4(1,1,1,_Opacity); }
            ENDCG
        }
    }
}
