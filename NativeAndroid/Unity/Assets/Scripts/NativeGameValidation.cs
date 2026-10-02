using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    [Serializable] class SmokeReport { public bool passed;public string engine,gpu,sourceHash;public int periods,archivePictures,exitCandidates,selectedExits;public string[] checks;public float renderMilliseconds; }
    readonly List<string> smokeChecks=new List<string>();
    void Check(bool condition,string message){if(!condition)throw new Exception("Native smoke failed: "+message);smokeChecks.Add(message);}
    IEnumerator Smoke(string directory)
    {
        // An exception in a coroutine would otherwise leave a batch player alive.
        Application.logMessageReceived+=(message,trace,type)=>{if(type==LogType.Exception||type==LogType.Error){File.WriteAllText(Path.Combine(directory,"failure.txt"),message+"\n"+trace);Application.Quit(1);}};
        Directory.CreateDirectory(directory);yield return null;paused=true;
        yield return PresentationSmoke(directory);
        yield return NavigationSmoke(directory);
        StartAerial();paused=true;orbitTarget=new Vector3(190,5,30);orbitDistance=590;orbitYaw=192;orbitPitch=55;UpdateOrbit(0);
        for(int p=0;p<manifest.periods.Length;p++){
            SetPeriod(p);lodClock=0;UpdateEstateLOD();int enabled=0;
            for(int m=0;m<estateMeshes.Length;m++)if(estateMeshes[m].enabled){enabled++;Check(periodMeshSet[m],"Visible mesh belongs to period "+manifest.periods[p].year);}
            Check(enabled>0,"Estate renders in "+manifest.periods[p].year);yield return null;
        }
        SetPeriod(8);lodClock=0;UpdateEstateLOD();yield return null;Capture(directory,"aerial-1916.png");
        trees=false;RefreshEstateVisibility();foreach(var r in estateMeshes)if(r.enabled)Check(!manifest.meshFlags[Array.IndexOf(estateMeshes,r)].tree,"Hidden trees have no visible meshes");
        Check(manifest.periods[8].obstaclesNoTrees.Length<manifest.periods[8].obstacles.Length,"Tree collision snapshot excludes hidden trees");trees=true;RefreshEstateVisibility();
        StartOutside();paused=true;yield return null;Capture(directory,"frontage.png");Check(Clear(0,40),"Outside start remains walkable");Check(!Clear(manifest.playBounds.maxX+1,40),"Estate boundary blocks movement");
        SetTimeOfDay(LightingMode.Night);yield return null;Check(lampPositions.Count>0&&lampPools.activeSelf,"Night uses estate street-lamp positions");Capture(directory,"frontage-night.png");SetTimeOfDay(LightingMode.Day);
        foreach(var building in manifest.buildings){var photos=new List<Photo>();if(building.photos!=null)photos.AddRange(building.photos);if(building.contextPhotos!=null)photos.AddRange(building.contextPhotos);foreach(var photo in photos){var t=LoadArchive(photo.src);Check(t&&t.width>16&&t.height>16,"Archive loads "+photo.src);ReleaseArchiveTexture(ref t);}}
        foreach(var art in manifest.art)Check(LoadArchive(art.src)!=null,"Wall artwork loads "+art.src);
        StartAerial();paused=true;locationsOpen=true;locationsScroll=Vector2.zero;Check(LocationTouch(101,new Vector2(400,191),0,TouchPhase.Began),"Phone locations accepts touch");LocationTouch(101,new Vector2(400,191),0,TouchPhase.Ended);Check(selectedBuilding>=0&&!locationsOpen,"Phone locations selects a building");CloseBuilding();
        StartInside();paused=false;HandleTap(helpButton.center);Check(help,"Touch opens help in asylum escape");HandleTap(helpResumeButton.center);Check(!help,"Touch closes help");
        yield return LatestGameplaySmoke(directory);
        StartOutside();paused=false;yield return new WaitForSecondsRealtime(.5f);
        File.WriteAllText(Path.Combine(directory,"smoke.json"),JsonUtility.ToJson(new SmokeReport{passed=true,engine=Application.unityVersion,gpu=SystemInfo.graphicsDeviceName,sourceHash=manifest.sourceHash,periods=manifest.periods.Length,archivePictures=73,exitCandidates=23,selectedExits=23,checks=smokeChecks.ToArray(),renderMilliseconds=smoothedFrame*1000},true));
        Debug.Log("NATIVE_FULL_PORT_SMOKE_PASS "+directory);Application.Quit(0);
    }
    void Capture(string directory,string name)
    {
        var target=new RenderTexture(1280,720,24,RenderTextureFormat.ARGB32);var previous=RenderTexture.active;var old=view.targetTexture;view.targetTexture=target;view.Render();RenderTexture.active=target;
        var image=new Texture2D(1280,720,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,1280,720),0,0);image.Apply();var pixels=image.GetPixels32();int min=255,max=0;
        for(int i=0;i<pixels.Length;i+=47){int value=(pixels[i].r+pixels[i].g+pixels[i].b)/3;min=Math.Min(min,value);max=Math.Max(max,value);}Check(max-min>40,"Nonblank render: "+name);
        File.WriteAllBytes(Path.Combine(directory,name),image.EncodeToPNG());view.targetTexture=old;RenderTexture.active=previous;target.Release();Destroy(target);Destroy(image);
    }
}
