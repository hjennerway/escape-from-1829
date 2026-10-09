using System.Collections;
using System.IO;
using UnityEngine;
public sealed partial class NativePrototypeGame
{
    IEnumerator CaptureInterface(string directory,string name){yield return null;CaptureUI(directory,name);}
    IEnumerator PresentationSmoke(string directory)
    {
        showTouchPreview=true;Home();paused=true;UpdateLanding(0);yield return null;
        Check(Mathf.Abs(view.transform.position.z+75.8f)<.1f&&view.fieldOfView==46,"Title matches browser front-of-asylum camera");
        Check(trees&&RenderSettings.skybox&&view.clearFlags==CameraClearFlags.Skybox,"Title has trees and cloud sky");
        yield return CaptureInterface(directory,"title-ui.png");
        SurfaceRenderingSmoke(directory);
        VertexAlphaSmoke(directory);
        bool hasWind=false,hasOffsets=false,hasCountryside=false;foreach(var r in estateMeshes){var m=r.sharedMaterial;if(m.IsKeywordEnabled("_LEAF_WIND"))hasWind=true;if(m.GetFloat("_OffsetFactor")==0&&m.GetFloat("_OffsetUnits")<0)hasOffsets=true;if(r.bounds.size.x>5000)hasCountryside=true;}
        Check(hasWind&&hasOffsets&&hasCountryside,"Imported wind, constant road depth priorities and countryside are present");
        Shader.SetGlobalFloat("_LeafTime",0);Capture(directory,"wind-0.png");Shader.SetGlobalFloat("_LeafTime",4);Capture(directory,"wind-4.png");
        StartAerial();paused=true;orbitTarget=new Vector3(12,5,12);orbitYaw=200;orbitPitch=55;orbitDistance=300;UpdateOrbit(0);lodClock=0;UpdateEstateLOD();yield return null;Capture(directory,"aerial-roads.png");
        paused=false;SelectBuilding(manifest.periods[periodIndex].buildings[0].index);yield return CaptureInterface(directory,"building-side-panel.png");
        Check(!photoExpanded&&buildingPanel.width<1280/3f&&selectionRenderer.enabled,"Building archive leaves most of estate visible with highlight");
        if(photoTexture){HandleTap(openPhotoButton.center);Check(photoExpanded,"Photograph expands only on request");yield return CaptureInterface(directory,"photo-expanded.png");HandleTap(closePictureButton.center);Check(!photoExpanded&&selectedBuilding>=0,"Back returns to compact building panel");}
        CloseBuilding();orbitTarget=new Vector3(190,5,0);orbitDistance=1100;orbitPitch=14;UpdateOrbit(0);Capture(directory,"countryside-horizon.png");paused=true;HandleTap(resolutionButton.center);Check(!lowGraphics,"High detail touch explicitly selects high detail");HandleTap(resolutionButton.center);Check(!lowGraphics,"Selected high detail does not toggle off");yield return CaptureInterface(directory,"settings-high-detail.png");
        HandleTap(saverButton.center);Check(lowGraphics,"Battery saver touch explicitly selects battery saver");yield return CaptureInterface(directory,"settings-battery-saver.png");HandleTap(resolutionButton.center);
        foreach(bool aerial in new[]{false,true}){
            if(aerial)StartAerial();else StartOutside();paused=false;string name=aerial?"aerial":"walk";
            bool torchBefore=torch.enabled;
            foreach(var rect in new[]{helpButton,mapButton,torchButton,useButton})Check(!HandleTap(rect.center),"Exploration ignores escape-only touch target: "+name+" / "+rect);
            Check(!help&&!map&&torch.enabled==torchBefore&&!useHeld,"Exploration keeps escape overlays and held use inactive: "+name);
            Check(PointerOverControls(quitButton.center)&&!PointerOverControls(torchButton.center)&&!PointerOverControls(useButton.center),"Visible exit accepts taps while hidden escape controls leave look/orbit area free: "+name);
            bool wasAutomation=automationMode;automationMode=false;OnApplicationPause(true);OnApplicationPause(false);OnApplicationFocus(false);OnApplicationFocus(true);automationMode=wasAutomation;Check(!paused,"Background and location permission focus changes cannot open exploration pause: "+name);
            var previousSafe=safeViewport;
            foreach(var viewport in new[]{new Rect(0,0,1280,720),new Rect(-140,0,1560,720),new Rect(-170,-20,1620,760)}){
                safeViewport=viewport;
                Check(explorationHeader.x-viewport.x==explorationHeader.y-viewport.y,"Exploration top and left insets match: "+viewport);
                Check(locateButton.width==locateButton.height&&locateButton.x==explorationHeader.x,"Square crosshair shares header left edge: "+viewport);
                foreach(var rect in new[]{dayButton,duskButton,nightButton})Check(rect.x==treeButton.x&&rect.width==rect.height&&rect.width>44&&PointerOverControls(rect.center),"Larger square lighting target follows left stack: "+viewport+" / "+rect);
                Check(dayButton.yMax<duskButton.y&&duskButton.yMax<nightButton.y,"Lighting targets form separated vertical stack: "+viewport);
            }safeViewport=previousSafe;
            foreach(var value in new[]{LightingMode.Day,LightingMode.Dusk,LightingMode.Night}){
                var rect=value==LightingMode.Day?dayButton:value==LightingMode.Dusk?duskButton:nightButton;
                Check(HandleTap(rect.center)&&lightingMode==value,"Touch selects "+value+" in "+name);
                Check(lampPools.activeSelf==(value!=LightingMode.Day),"Street lamps follow "+value+" in "+name);
                Check(Mathf.Abs(sun.intensity-(value==LightingMode.Day?1.05f:value==LightingMode.Dusk?.85f:.24f))<.001f,"Sunlight follows "+value+" in "+name);
                HandleTap(rect.center);Check(lightingMode==value,"Selecting active lighting keeps "+value+" in "+name);
                yield return CaptureInterface(directory,"exploration-"+name+"-"+value.ToString().ToLowerInvariant()+".png");
            }
            CaptureUI(directory,"exploration-"+name+"-wide.png",1560);
            var walkingPosition=player;int previousPeriod=periodIndex;var timeBefore=lightingMode;
            Check(ApplyDeviceLocation(new Vector2(0,40),12),"Nearby location is accepted: "+name);
            Check(mode==(aerial?Mode.Aerial:Mode.Outside)&&periodIndex==previousPeriod&&lightingMode==timeBefore,"Location preserves exploration mode, period and lighting: "+name);
            if(aerial){
                Check(player==walkingPosition&&deviceMarker.activeSelf&&Vector3.Distance(deviceMarker.transform.position,World(new Vector2(0,40),.6f))<.001f,"Aerial location marks exact ground fix without moving walker");
                Check(Vector3.Distance(orbitTarget,World(new Vector2(0,40),0))<.001f&&view.transform.position.y>=AerialClearance(view.transform.position),"Aerial location frames marker safely from above");
                SetTimeOfDay(LightingMode.Day);yield return CaptureInterface(directory,"aerial-location-day.png");
                SetTimeOfDay(LightingMode.Night);CaptureUI(directory,"aerial-location-wide-night.png",1560);
                var markerPosition=deviceMarker.transform.position;SetPeriod(previousPeriod-1);Check(deviceMarker.activeSelf&&deviceMarker.transform.position==markerPosition,"Physical location marker persists across historical periods");SetPeriod(previousPeriod);
                var cameraPosition=view.transform.position;Check(!ApplyDeviceLocation(new Vector2(100000,100000),0)&&!deviceMarker.activeSelf&&view.transform.position==cameraPosition,"Distant fix hides stale marker and does not move aerial camera");
                Check(!ApplyDeviceLocation(new Vector2(float.NaN,0),0)&&!deviceMarker.activeSelf,"Invalid fix leaves no marker");
                ApplyDeviceLocation(new Vector2(0,40),0);StartOutside();UpdateDeviceLocationMarker();Check(!deviceMarker.activeSelf,"Walking mode hides aerial marker");
            }else Check(player==new Vector2(0,40),"Walking location still positions walker");
            if(aerial)StartOutside();else StartAerial();Check(lightingMode==LightingMode.Night,"Lighting survives switching exploration views: "+name);
        }
        SetTimeOfDay(LightingMode.Day);
        paused=false;StartInside();paused=true;help=true;paused=false;yield return CaptureInterface(directory,"help-ui.png");help=false;paused=true;
        paused=false;Check(HandleTap(mapButton.center)&&map,"Map remains available in asylum escape");HandleTap(mapButton.center);bool insideTorch=torch.enabled;Check(HandleTap(torchButton.center)&&torch.enabled!=insideTorch,"Torch remains available in asylum escape");HandleTap(torchButton.center);paused=true;
        paused=false;Check(HandleTap(pauseButton.center)&&paused,"Pause remains available in asylum escape");Check(HandleTap(pauseButton.center)&&!paused,"Escape pause button resumes");paused=true;
        foreach(var caption in new[]{"TORCH: ON","TORCH: OFF","RESUME","HOLD USE"}){var rect=caption.StartsWith("TORCH")?torchButton:caption=="RESUME"?pauseButton:useButton;var style=FitButton(rect,caption);Check(TextWidth(caption,style)<=rect.width-24,"Button caption fits: "+caption);}
        paused=false;elapsed=0;yield return CaptureInterface(directory,"phone-controls-16x9.png");
        CaptureUI(directory,"phone-controls-wide.png",1560);yield return null;showTouchPreview=false;paused=true;
    }
    void VertexAlphaSmoke(string directory)
    {
        var probe=new GameObject("Vertex alpha probe");probe.layer=30;probe.transform.position=new Vector3(0,-1000,0);
        var mesh=new Mesh();mesh.vertices=new[]{new Vector3(-1,-1,0),new Vector3(1,-1,0),new Vector3(1,1,0),new Vector3(-1,1,0)};mesh.triangles=new[]{0,2,1,0,3,2};mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.one,Vector2.up};mesh.colors=new[]{new Color(1,1,1,0),Color.white,Color.white,new Color(1,1,1,0)};mesh.RecalculateNormals();
        probe.AddComponent<MeshFilter>().sharedMesh=mesh;var renderer=probe.AddComponent<MeshRenderer>();renderer.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;
        var cameraObject=new GameObject("Vertex alpha camera");var camera=cameraObject.AddComponent<Camera>();camera.enabled=false;camera.transform.position=new Vector3(0,-1000,-2);camera.orthographic=true;camera.orthographicSize=1;camera.nearClipPlane=.1f;camera.farClipPlane=5;camera.cullingMask=1<<30;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=Color.blue;camera.allowHDR=false;camera.allowMSAA=false;camera.renderingPath=RenderingPath.Forward;
        var target=new RenderTexture(128,128,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear);camera.targetTexture=target;var image=new Texture2D(128,128,TextureFormat.RGBA32,false,true);var previous=RenderTexture.active;bool fog=RenderSettings.fog;float weather=Shader.GetGlobalFloat("_WeatherEnabled");
        try{
            RenderSettings.fog=false;Shader.SetGlobalFloat("_WeatherEnabled",0);
            foreach(var shader in new[]{Shader.Find("Escape1829/NativeSurface"),Resources.Load<Shader>("NativeWorkshopSurface")}){
                Check(shader!=null,"Vertex alpha probe shader is available");var material=new Material(shader);renderer.sharedMaterial=material;
                try{
                    material.SetColor("_Color",Color.red);material.SetFloat("_Unlit",1);material.SetFloat("_VertexColours",1);material.SetFloat("_Cull",0);material.SetFloat("_ZWrite",0);material.SetFloat("_SrcBlend",(float)UnityEngine.Rendering.BlendMode.SrcAlpha);material.SetFloat("_DstBlend",(float)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);material.renderQueue=3000;
                    camera.Render();RenderTexture.active=target;image.ReadPixels(new Rect(0,0,128,128),0,0);image.Apply();var left=image.GetPixel(32,64);var right=image.GetPixel(96,64);
                    Check(right.r>left.r+.25f&&left.b>right.b+.25f,"Vertex alpha blends into the underlying surface: "+shader.name);
                    File.WriteAllBytes(Path.Combine(directory,shader.name.EndsWith("NativeSurface")?"vertex-alpha-surface.png":"vertex-alpha-workshop.png"),image.EncodeToPNG());
                    material.SetFloat("_VertexColours",0);camera.Render();image.ReadPixels(new Rect(0,0,128,128),0,0);image.Apply();left=image.GetPixel(32,64);right=image.GetPixel(96,64);
                    Check(left.r>.8f&&Mathf.Abs(left.r-right.r)<.03f,"Vertex alpha negative control becomes uniformly opaque: "+shader.name);
                }finally{Destroy(material);}
            }
        }finally{RenderSettings.fog=fog;Shader.SetGlobalFloat("_WeatherEnabled",weather);RenderTexture.active=previous;camera.targetTexture=null;target.Release();Destroy(target);Destroy(image);Destroy(mesh);Destroy(probe);Destroy(cameraObject);}
    }
    void SurfaceRenderingSmoke(string directory)
    {
        foreach(float scale in new[]{.625f,1f,1.375f})foreach(var size in new[]{new Vector2Int(210,56),new Vector2Int(52,52),new Vector2Int(285,50)}){
            int width=Mathf.CeilToInt(size.x*scale)+32,height=Mathf.CeilToInt(size.y*scale)+32;
            var target=new RenderTexture(width,height,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB);var previous=RenderTexture.active;RenderTexture.active=target;GL.Clear(false,true,Color.black);
            GL.PushMatrix();GL.LoadPixelMatrix(0,width,height,0);GL.MultMatrix(Matrix4x4.TRS(new Vector3(16.25f,16.25f,0),Quaternion.identity,new Vector3(scale,scale,1)));bool oldSrgb=GL.sRGBWrite;GL.sRGBWrite=true;capturingUI=true;
            try{Surface(new Rect(0,0,size.x,size.y),surfaceTexture);}finally{capturingUI=false;GL.sRGBWrite=oldSrgb;GL.PopMatrix();}
            var image=new Texture2D(width,height,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,width,height),0,0);image.Apply();var pixels=image.GetPixels32();
            var middle=pixels[(height-1-Mathf.FloorToInt(16.25f+size.y*scale/2))*width+Mathf.FloorToInt(16.25f+size.x*scale/2)];int samples=0;bool continuous=true;
            for(int y=0;y<height;y++)for(int x=0;x<width;x++){
                float localX=(x+.5f-16.25f)/scale,localY=(height-y-.5f-16.25f)/scale;
                if(localX<3||localX>size.x-3||localY<3||localY>size.y-3)continue;
                if((localX<9||localX>size.x-9)&&(localY<9||localY>size.y-9))continue;
                var p=pixels[y*width+x];continuous&=Mathf.Abs(p.r-middle.r)<=3&&Mathf.Abs(p.g-middle.g)<=3&&Mathf.Abs(p.b-middle.b)<=3;samples++;
            }
            Check(continuous,"Scaled button interior has no inset seams: "+scale+" / "+size);
            Check(samples>100,"GPU surface probe covers button interior: "+scale+" / "+size);
            File.WriteAllBytes(Path.Combine(directory,"button-surface-"+size.x+"x"+size.y+"-"+scale.ToString("0.000",System.Globalization.CultureInfo.InvariantCulture)+".png"),image.EncodeToPNG());
            RenderTexture.active=previous;target.Release();Destroy(target);Destroy(image);
        }
    }
}
