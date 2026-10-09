using UnityEngine;
using UnityEngine.Rendering;
public sealed partial class NativePrototypeGame
{
    public Shader skyShader,gradeShader;
    Material skyMaterial;NativeColourGrade colourGrade;float weatherTime,landingTime;
    static Color Hex(uint n)=>new Color((n>>16&255)/255f,(n>>8&255)/255f,(n&255)/255f);
    void InitializeAtmosphere()
    {
        skyMaterial=new Material(skyShader);RenderSettings.skybox=skyMaterial;
        var noise=new Texture2D(128,128,TextureFormat.RGBA32,false,true);var bytes=new Color32[128*128];uint seed=1829;
        for(int i=0;i<bytes.Length;i++){seed=unchecked(seed*1664525+1013904223);byte n=(byte)(seed>>24);bytes[i]=new Color32(n,n,n,255);}noise.SetPixels32(bytes);noise.wrapMode=TextureWrapMode.Repeat;noise.filterMode=FilterMode.Bilinear;noise.Apply(false,true);Shader.SetGlobalTexture("_WeatherNoise",noise);
        colourGrade=view.gameObject.AddComponent<NativeColourGrade>();colourGrade.material=new Material(gradeShader);view.allowHDR=true;
    }
    void UpdateAtmosphere(float dt){weatherTime+=dt;Shader.SetGlobalFloat("_WeatherTime",weatherTime);Shader.SetGlobalFloat("_LeafTime",weatherTime);}
    void SetInteriorAmbient(Color colour)
    {
        RenderSettings.ambientLight=colour;
        // Set the shader probe along with the flat colour, so no sky
        // environment refresh is needed for an interior transition.
        var probe=new SphericalHarmonicsL2();probe.AddAmbientLight(colour.linear);RenderSettings.ambientProbe=probe;
    }
    void SetAtmosphere(bool indoors,float titleBlend=0,bool configure=true)
    {
        float twilight=mode==Mode.Title||lightingMode==LightingMode.Dusk?1:Mathf.Clamp01(titleBlend);
        Color Blend(uint dusk,uint moon,uint day)=>Color.Lerp(Hex(night?moon:day),Hex(dusk),twilight);
        float BlendNumber(float dusk,float moon,float day)=>Mathf.Lerp(night?moon:day,dusk,twilight);
        var horizon=Blend(0xaca48a,0x26394b,0x99afae);
        skyMaterial.SetColor("_Zenith",Blend(0x173a40,0x080f1e,0x456f88));skyMaterial.SetColor("_Horizon",horizon);skyMaterial.SetColor("_Cloud",Blend(0x243f40,0x122735,0x526f7a));skyMaterial.SetColor("_Rim",Blend(0xffc779,0x708c9c,0xffe5bb));skyMaterial.SetColor("_SunColor",Blend(0xfff0d4,0xc6deef,0xfff0d4));skyMaterial.SetFloat("_NightSky",night?1-twilight:0);
        sun.color=Blend(0xffcc8d,0x8ba9e5,0xffe2b7);sun.intensity=BlendNumber(.85f,.24f,1.05f);
        sun.transform.rotation=Quaternion.Slerp(Quaternion.LookRotation(new Vector3(85,-120,60)),Quaternion.LookRotation(new Vector3(100,-85,-260)),twilight);skyMaterial.SetVector("_SunDirection",-sun.transform.forward);
        RenderSettings.ambientMode=indoors?AmbientMode.Flat:AmbientMode.Trilight;
        // Halfway between v0.12's dark fill and v0.11's effective sky fill.
        // Use the actual former sky colour, not the overwritten ambientLight.
        float ambientScale=BlendNumber(.7f,.8f,1);
        // ambientLight and ambientSkyColor share Unity's sky-colour property.
        // Setting outdoor sky colours after the flat fill overwrites it.
        if(indoors)SetInteriorAmbient(Color.Lerp(new Color(.075f,.052f,.032f),Blend(0x7d9da0,0x394357,0x9aafb4)*ambientScale,.5f));
        else {
            RenderSettings.ambientSkyColor=Blend(0x7d9da0,0x394357,0x9aafb4)*ambientScale;RenderSettings.ambientEquatorColor=Blend(0x687460,0x232d3a,0x748067)*ambientScale;RenderSettings.ambientGroundColor=Blend(0x303727,0x1b2430,0x454d37)*ambientScale;
            DynamicGI.UpdateEnvironment();
        }
        RenderSettings.reflectionIntensity=0;
        var interiorFog=Color.Lerp(Hex(0x29231b),Hex(0x343731),.5f);
        view.clearFlags=indoors?CameraClearFlags.SolidColor:CameraClearFlags.Skybox;view.backgroundColor=interiorFog;
        RenderSettings.fog=true;RenderSettings.fogMode=FogMode.ExponentialSquared;RenderSettings.fogColor=indoors?interiorFog:Blend(0x7b877d,0x111d30,0xb5c7cd);RenderSettings.fogDensity=indoors?.021f:BlendNumber(.0019f,.00065f,.0019f);
        Shader.SetGlobalFloat("_WeatherEnabled",indoors?0:1);Shader.SetGlobalColor("_WeatherHorizon",horizon.linear);Shader.SetGlobalFloat("_GroundMist",BlendNumber(.014f,.018f,0));Shader.SetGlobalFloat("_CountrysideHaze",BlendNumber(.0008f,.0009f,.00065f));Shader.SetGlobalFloat("_CloudShadow",BlendNumber(.11f,0,.16f));
        colourGrade.material.SetFloat("_Exposure",indoors?.91f:BlendNumber(1.05f,1.05f,1.15f));
        // GLES depth precision is especially sensitive to the walking camera's
        // old .08-to-7000 range. Keep close indoor clearance and distant aerial
        // scenery, but give facade details a tighter range while on foot.
        view.nearClipPlane=indoors?.08f:mode==Mode.Outside?.18f:mode==Mode.Aerial?1f:.5f;view.farClipPlane=indoors?150:mode==Mode.Outside?3500:7000;
        view.fieldOfView=mode==Mode.Title?46:mode==Mode.Aerial?55:74;
        if(configure)ConfigureShadows();
    }
    void ConfigureShadows()
    {
        QualitySettings.shadows=lowGraphics?ShadowQuality.Disable:ShadowQuality.All;QualitySettings.shadowResolution=ShadowResolution.High;QualitySettings.shadowProjection=ShadowProjection.StableFit;QualitySettings.shadowCascades=2;QualitySettings.shadowDistance=mode==Mode.Aerial?220:105;
        sun.shadows=lowGraphics?LightShadows.None:LightShadows.Soft;sun.shadowStrength=.8f;sun.shadowBias=.035f;sun.shadowNormalBias=.22f;
        if(estateMeshes!=null)for(int i=0;i<estateMeshes.Length;i++)estateMeshes[i].shadowCastingMode=!lowGraphics&&manifest.meshFlags[i].shadow?ShadowCastingMode.On:ShadowCastingMode.Off;
    }
    void UpdateLanding(float dt)
    {
        landingTime+=dt;float distance=56*Mathf.Clamp(1.25f/view.aspect,1,2.8f),sway=Mathf.Sin(landingTime*.035f)*.10f;
        view.transform.position=new Vector3(Mathf.Sin(sway)*distance,6+(distance-56)*.035f,-19.8f-Mathf.Cos(sway)*distance);view.transform.LookAt(new Vector3(0,10,-19.8f));
    }
}
