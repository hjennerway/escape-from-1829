sampler2D _WeatherNoise;
float _WeatherTime, _WeatherEnabled, _GroundMist, _CountrysideHaze, _CloudShadow;
float4 _WeatherHorizon;
float WeatherNoise(float2 p) { float2 c=floor(p),f=frac(p);f=f*f*(3-2*f);return tex2D(_WeatherNoise,(c+f+.5)/128).r; }
float CloudNoise(float2 p) { return WeatherNoise(p)*.49+WeatherNoise(p*2.03+17.1)*.26+WeatherNoise(p*4.11+31.7)*.13+WeatherNoise(p*8.23)*.07; }
float EstateDistance(float3 world) { return length(max(abs(world.xz-float2(315,-55))-float2(575,395),0)); }
