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
        _Grass ("Meadow", Float) = 0
        _OffsetFactor ("Depth slope offset", Float) = 0
        _OffsetUnits ("Depth constant offset", Float) = 0
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
        Offset [_OffsetFactor], [_OffsetUnits]
        CGPROGRAM
        #pragma surface surf Standard fullforwardshadows addshadow keepalpha vertex:vert finalcolor:weather
        #pragma shader_feature_local _BUMP
        #pragma shader_feature_local _LEAF_WIND
        #pragma target 3.0
        #include "Weather.cginc"
        sampler2D _MainTex, _EmissionMap, _BumpMap;
        float4 _BumpMap_TexelSize;
        fixed4 _Color, _EmissionColor;
        half _Metallic, _Glossiness, _Cutoff, _Unlit, _BumpScale, _Window, _Night, _Grass;
        float _LeafTime;
        struct Input { float2 uv_MainTex; float2 uv_EmissionMap; float2 uv_BumpMap; float3 worldPos; };
        void vert(inout appdata_full v){
#ifdef _LEAF_WIND
            float phase=v.texcoord1.x,t=_LeafTime*.5;
            float sway=.5*sin(t+phase)+.3*sin(2*t+1.3*phase)+.2*sin(5*t+1.5*phase);
            v.vertex.xyz+=float3(1,.12,-.65)*v.texcoord1.y*sway;
#endif
        }
        void weather(Input IN,SurfaceOutputStandard o,inout fixed4 color){
#ifndef UNITY_PASS_FORWARDADD
            if(_WeatherEnabled>.5){
                float haze=1-exp(-max(0,EstateDistance(IN.worldPos)-80)*_CountrysideHaze);
                color.rgb=lerp(color.rgb,_WeatherHorizon.rgb,haze);
                float start=max(_WorldSpaceCameraPos.y,0),end=max(IN.worldPos.y,0),delta=end-start;
                float heightDensity=abs(delta)<.01?exp(-start*.38):(exp(-start*.38)-exp(-end*.38))/(delta*.38);
                float wisps=WeatherNoise(IN.worldPos.xz*.035+float2(_WeatherTime*.015,0));
                float amount=1-exp(-distance(IN.worldPos,_WorldSpaceCameraPos)*_GroundMist*heightDensity*(.4+wisps*.9));
                color.rgb=lerp(color.rgb,unity_FogColor.rgb,min(.64,amount));
            }
#endif
        }
        void surf(Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
            if(_WeatherEnabled>.5){
                if(_Grass>.5){float mottling=CloudNoise(IN.worldPos.xz*.012);c.rgb*=lerp(float3(.77,.88,.86),float3(1.06,1.04,.91),mottling);}
                c.rgb*=1-_CloudShadow*smoothstep(.30,.72,CloudNoise(IN.worldPos.xz*.004+float2(_WeatherTime*.012,_WeatherTime*.003)));
            }
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
