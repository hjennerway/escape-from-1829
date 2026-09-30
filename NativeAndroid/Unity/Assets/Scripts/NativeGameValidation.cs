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
        Check(activeExits.Count==5,"Exactly five exits selected per app session");var exits=new HashSet<int>(activeExits);
        for(int f=0;f<2;f++)foreach(var exit in floors[f].exits)Check(RouteBetweenFloors(floors,Position(floors[0].spawn,floors[0]),0,Position(exit,floors[f]),f).Count>0,"Reachable "+f+" / "+exit.name);
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
        night=true;SetLighting(false);yield return null;Check(lampPositions.Count>0&&lampPools.activeSelf,"Night uses estate street-lamp positions");Capture(directory,"frontage-night.png");night=false;SetLighting(false);
        foreach(var building in manifest.buildings){var photos=new List<Photo>();if(building.photos!=null)photos.AddRange(building.photos);if(building.contextPhotos!=null)photos.AddRange(building.contextPhotos);foreach(var photo in photos){var t=LoadArchive(photo.src);Check(t&&t.width>16&&t.height>16,"Archive loads "+photo.src);ReleaseArchiveTexture(ref t);}}
        foreach(var art in manifest.art)Check(LoadArchive(art.src)!=null,"Wall artwork loads "+art.src);
        StartAerial();paused=true;locationsOpen=true;locationsScroll=Vector2.zero;Check(LocationTouch(101,new Vector2(400,191),0,TouchPhase.Began),"Phone locations accepts touch");LocationTouch(101,new Vector2(400,191),0,TouchPhase.Ended);Check(selectedBuilding>=0&&!locationsOpen,"Phone locations selects a building");CloseBuilding();
        paused=false;HandleTap(helpButton.center);Check(help,"Touch opens help");HandleTap(helpResumeButton.center);Check(!help,"Touch closes help");
        StartInside();paused=true;Check(exits.SetEquals(activeExits),"Retry preserves open exits");foreach(var e in enemies)Check(Vector2.Distance(e.position,player)>=12,"Random enemy spawn keeps reception clear");
        Check(IndoorClear(floors[1],Position(floors[1].spawn,floors[1]).x,Position(floors[1].spawn,floors[1]).y),"Upper reception spawn remains walkable");
        elapsed=0;var before=enemies[0].position;UpdateEnemies(.2f);Check(before==enemies[0].position,"Five-second head start freezes pursuers");
        elapsed=6;before=enemies[0].position;StepInside(.2f,true);Check(before==enemies[0].position,"Held use pauses enemies");
        var spawn=player;crouching=true;Walk(Vector2.right,.1f,false);Check(Mathf.Abs(Vector2.Distance(spawn,player)-.16f)<.015f,"Crouch speed matches game rules");player=spawn;crouching=false;Walk(Vector2.right,.1f,true);Check(Mathf.Abs(Vector2.Distance(spawn,player)-.58f)<.015f,"Sprint speed matches game rules");player=spawn;PositionView();
        foreach(var e in enemies)e.model.SetActive(false);UpdateInteriorLights();yield return null;Capture(directory,"ground-floor.png");
        var stair=floors[0].stairs[0];player=Position(stair,layout);Interact(.6f,true);Check(floor==1&&stairLatch,"Held use goes upstairs");Interact(.6f,true);Check(floor==1,"Held use cannot bounce between floors");Interact(.1f,false);Interact(.6f,true);Check(floor==0,"Released use permits downstairs");
        ChangeFloor(stair);paused=true;player=Position(floors[1].spawn,floors[1]);yaw=0;PositionView();UpdateInteriorLights();yield return null;Capture(directory,"upper-floor.png");
        foreach(var part in interiorParts)Check(part.renderer.enabled==(part.floor==floor&&(part.region<0||part.open==activeExits.Contains(part.floor*7+part.region))),"Active exit geometry matches selected floor");
        // A pursuer at a staircase must consume a cross-floor waypoint rather than walk through ceilings.
        elapsed=6;foreach(var e in enemies){e.floor=0;e.position=Position(stair,floors[0]);e.target=player;e.targetFloor=1;e.memory=5;e.rethink=0;e.path.Clear();}
        UpdateEnemies(.01f);UpdateEnemies(.01f);UpdateEnemies(.01f);foreach(var e in enemies)Check(e.floor==1,"Enemy follows staircase: "+e.name);
        floor=0;ShowFloor();player=new Vector2(50,layout.galleryZ*layout.cellSize);yaw=0;PositionView();torch.enabled=true;
        var ghost=enemies.Find(e=>e.type==2);foreach(var e in enemies){e.floor=1;e.position=Position(stair,floors[1]);e.memory=0;}
        ghost.floor=0;ghost.position=player+new Vector2(0,-7);ghost.rethink=0;var start=ghost.position;UpdateEnemies(.1f);Check(Vector2.Distance(ghost.position,start)<.08f,"Aimed torch slows ghost");
        torch.enabled=false;ghost.position=start;ghost.rethink=0;ghost.path.Clear();UpdateEnemies(.1f);Check(Vector2.Distance(ghost.position,start)>.18f,"Unlit ghost resumes pursuit");
        foreach(var e in enemies)e.model.SetActive(false);var guard=enemies.Find(e=>e.type==1);guard.position=player+new Vector2(0,-4);guard.floor=0;guard.model.SetActive(true);guard.model.transform.rotation=Quaternion.identity;PositionEnemy(guard);guard.pose.Update(.14f,.08f);yield return null;Capture(directory,"guard.png");
        var picture=Array.Find(manifest.wallArt,a=>a.floor==0);player=new Vector2(picture.x+.4f,picture.z+.4f);var to=new Vector2(picture.x,picture.z)-player;yaw=Mathf.Atan2(-to.x,-to.y);Interact(.1f,true);Check(viewingArt!=null&&artworkTexture,"Held use opens wall artwork");ResetInput();paused=true;
        int active=0;foreach(int e in activeExits)active=e;floor=active/7;ShowFloor();player=Position(layout.exits[active%7],layout);Interact(.6f,true);Check(mode==Mode.Escape,"Open exit starts escape sequence");UpdateCinema(8);Check(mode==Mode.Escaped,"Escape sequence completes");
        StartInside();paused=true;Finish(false,"Security");string first=previousDiagnosis;StartInside();paused=true;Finish(false,"Security");Check(first!=previousDiagnosis&&status.Contains("Treatment:"),"Capture outcomes avoid immediate repeated diagnosis");
        StartOutside();paused=false;yield return new WaitForSecondsRealtime(.5f);
        File.WriteAllText(Path.Combine(directory,"smoke.json"),JsonUtility.ToJson(new SmokeReport{passed=true,engine=Application.unityVersion,gpu=SystemInfo.graphicsDeviceName,sourceHash=manifest.sourceHash,periods=manifest.periods.Length,archivePictures=72,exitCandidates=14,selectedExits=activeExits.Count,checks=smokeChecks.ToArray(),renderMilliseconds=smoothedFrame*1000},true));
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
