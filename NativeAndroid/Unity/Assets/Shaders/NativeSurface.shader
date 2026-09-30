Shader "Escape1829/NativeSurface"
{
    Properties
    {
        _Color ("Colour", Color) = (1,1,1,1)
        _MainTex ("Surface", 2D) = "white" {}
        _Metallic ("Metallic", Range(0,1)) = 0
        _Glossiness ("Smoothness", Range(0,1)) = 0.2
        _EmissionColor ("Emission", Color) = (0,0,0,0)
        _EmissionMap ("Emission map", 2D) = "white" {}
        _Cutoff ("Alpha cutoff", Range(0,1)) = 0
        _Unlit ("Unlit", Float) = 0
        _Window ("Night window", Float) = 0
        _BumpMap ("Bump", 2D) = "gray" {}
        _BumpScale ("Bump scale", Float) = 0
        _SrcBlend ("Source blend", Float) = 1
        _DstBlend ("Destination blend", Float) = 0
        _ZWrite ("Depth write", Float) = 1
        [Enum(UnityEngine.Rendering.CullMode)] _Cull ("Cull", Float) = 2
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 200
        Cull [_Cull]
        Blend [_SrcBlend] [_DstBlend]
        ZWrite [_ZWrite]
        CGPROGRAM
        #pragma surface surf Standard fullforwardshadows addshadow keepalpha
        #pragma shader_feature_local _BUMP
        #pragma target 3.0
        sampler2D _MainTex, _EmissionMap, _BumpMap;
        float4 _BumpMap_TexelSize;
        fixed4 _Color, _EmissionColor;
        half _Metallic, _Glossiness, _Cutoff, _Unlit, _BumpScale, _Window, _Night;
        struct Input { float2 uv_MainTex; float2 uv_EmissionMap; float2 uv_BumpMap; float3 worldPos; };
        void surf(Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
            clip(c.a - _Cutoff);
            o.Albedo = c.rgb * (1-_Unlit); o.Alpha = c.a;
            o.Metallic = _Metallic; o.Smoothness = _Glossiness;
            o.Emission = tex2D(_EmissionMap, IN.uv_EmissionMap).rgb * _EmissionColor.rgb + c.rgb*_Unlit;
            if(_Window>.5 && _Night>0){
                float3 cell=floor(IN.worldPos/float3(2.7,4.2,2.7));
                float selected=step(.90,frac(sin(dot(cell,float3(12.9898,78.233,37.719)))*43758.5453));
                o.Emission+=tex2D(_EmissionMap,IN.uv_EmissionMap).rgb*half3(1,.55,.22)*selected*_Night;
            }
#ifdef _BUMP
            half h = tex2D(_BumpMap, IN.uv_BumpMap).r;
            half dx = tex2D(_BumpMap, IN.uv_BumpMap+float2(_BumpMap_TexelSize.x,0)).r-h;
            half dy = tex2D(_BumpMap, IN.uv_BumpMap+float2(0,_BumpMap_TexelSize.y)).r-h;
            o.Normal = normalize(half3(-dx*_BumpScale*20,-dy*_BumpScale*20,1));
#endif
        }
        ENDCG
    }
    Fallback "Diffuse"
}
