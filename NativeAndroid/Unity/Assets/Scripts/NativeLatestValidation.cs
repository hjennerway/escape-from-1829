using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    void FollowInterior(Vector2 target,int targetFloor){
        var route=RouteBetweenFloors(floors,player,floor,target,targetFloor);Check(route.Count>0,"Continuous native route to "+target+" / "+targetFloor);
        foreach(var point in route){int attempts=0;while(Vector2.Distance(player,point.position)>.025f&&attempts++<500){var delta=Vector2.ClampMagnitude(point.position-player,.04f);float prior=playerY;MovePlayer(delta,.025f);Check(Mathf.Abs(playerY-prior)<.081f,"Stair movement changes height continuously");}Check(Vector2.Distance(player,point.position)<.04f,"Physical interior route reaches "+point.position+" from "+player+" / "+floor);}
        Check(floor==targetFloor&&Mathf.Abs(playerY-floors[targetFloor].elevation)<.01f,"Physical route exits on correct floor");
    }
    void FollowOutside(Vector2[] points){foreach(var target in points){int attempts=0;while(Vector2.Distance(player,target)>.025f&&attempts++<1500){MoveOutside(Vector2.ClampMagnitude(target-player,.05f),.025f);Check(OutsideClearAt(player,playerY),"Outside steps remain clear at resulting height");}Check(Vector2.Distance(player,target)<.04f,"Rendered outside steps reach "+target+" from "+player+" at "+playerY);}}
    void CheckExteriorGuards(){
        int previousPeriod=periodIndex,guardPeriod=Array.FindIndex(manifest.periods,p=>p.year==1916);
        var starts=new[]{new Vector3(-61.3f,.3f,20.5f),new Vector3(66.6f,.3f,1.7f),new Vector3(67,.25f,-30.1f)};
        var routes=new[]{
            new[]{new Vector2(-61.3f,26.05f),new Vector2(-62.55f,26.05f),new Vector2(-62.55f,22.1f),new Vector2(-62.55f,21),new Vector2(-63.4f,21)},
            new[]{new Vector2(72.4f,1.7f),new Vector2(72.4f,3),new Vector2(68.75f,3),new Vector2(67.5f,3),new Vector2(67.5f,4)},
            new[]{new Vector2(63.3f,-30.1f),new Vector2(63.3f,-31.75f),new Vector2(66.4f,-31.75f)}};
        for(int r=0;r<routes.Length;r++){
            StartOutside();paused=true;SetPeriod(guardPeriod);player=new Vector2(starts[r].x,starts[r].z);playerY=starts[r].y;
            FollowOutside(routes[r]);Check(playerY>(r<2?8.35f:4.1f),"Guarded upper or remote stair reaches its highest landing: "+r);
            var reverse=new List<Vector2>(routes[r]);reverse.Reverse();reverse.RemoveAt(0);reverse.Add(new Vector2(starts[r].x,starts[r].z));FollowOutside(reverse.ToArray());Check(playerY<.7f,"Guarded upper or remote stair returns to the grounds: "+r);
        }
        StartOutside();paused=true;SetPeriod(guardPeriod);player=new Vector2(-62.1f,26.05f);playerY=4.32f;
        for(int i=0;i<40;i++)MoveOutside(new Vector2(0,.05f),.016f);
        Check(player.y<26.45f&&playerY>4.2f,"West landing guard prevents walking off its supported edge");
        SetPeriod(0);Check(OutsideClearAt(new Vector2(-62.1f,26.65f),4.3f),"Earlier period removes absent stair-guard collisions");SetPeriod(previousPeriod);
    }
    IEnumerator LatestExteriorSmoke(string directory){
        int previousPeriod=periodIndex;var previousLighting=lightingMode;float previousFov=view.fieldOfView;
        StartOutside();paused=true;SetPeriod(manifest.periods.Length-1);SetTimeOfDay(LightingMode.Day);
        var names=new[]{"west-garden-guards","west-garden-upper-guards","east-court-guards","central-door-guards","east-courtyard-corner","east-courtyard-roof","west-courtyard-corner"};
        var positions=new[]{new Vector3(-54,6,33),new Vector3(-59,11,28),new Vector3(78,7,-5),new Vector3(15,4,-40),new Vector3(14,1.8f,-5),new Vector3(20,1.8f,-21),new Vector3(-14,1.8f,-5)};
        var targets=new[]{new Vector3(-62.6f,4.5f,23),new Vector3(-63,7,22),new Vector3(69.5f,4.5f,3),new Vector3(8.9f,3.5f,-39),new Vector3(24,6,1),new Vector3(25,13.1f,-22),new Vector3(-24,6,1)};
        for(int i=0;i<names.Length;i++){
            player=new Vector2(positions[i].x,positions[i].z);playerY=positions[i].y-1.8f;view.transform.position=World(player,positions[i].y);view.transform.LookAt(World(new Vector2(targets[i].x,targets[i].z),targets[i].y));view.fieldOfView=62;lodClock=0;UpdateEstateLOD();
            yield return null;Capture(directory,names[i]+".png");
        }
        view.fieldOfView=previousFov;SetPeriod(previousPeriod);SetTimeOfDay(previousLighting);
    }
    IEnumerator LatestGameplaySmoke(string directory){
        yield return LatestExteriorSmoke(directory);
        Check(floors.Length==4&&floors[2].elevation==-3.2f&&floors[3].elevation==8.4f,"Four current plan levels retain their real elevations");
        StartInside();paused=true;var spawn=player;
        foreach(var e in enemies)Check(Vector2.Distance(e.position,player)>=12,"Enemy spawning keeps Reception clear");
        var before=enemies[0].position;elapsed=0;UpdateEnemies(.2f);Check(before==enemies[0].position,"Five-second head start freezes pursuers");elapsed=6;StepInside(.2f,true);Check(before==enemies[0].position,"Holding use pauses pursuers");
        foreach(var room in floors[3].rooms){StartInside();paused=true;FollowInterior(XZ(room.label),3);PositionView();UpdateInteriorLights();yield return null;Capture(directory,room.id+"-second-floor.png");ObserveNotebook();Check(visitedLevels.Contains(3),"Second floor appears in notebook only after reaching it");FollowInterior(new Vector2(-31.1f,-7),2);FollowInterior(spawn,0);}
        int doors=0;foreach(var plan in floors)foreach(var door in plan.exits){
            Check(RouteBetweenFloors(floors,spawn,0,XZ(door.inside),plan.id).Count>0,"Reachable door "+plan.id+" / "+door.id);
            StartInside();paused=true;floor=plan.id;player=XZ(door.inside);playerY=plan.elevation;ShowFloor();Interact(.01f,true);
            Check(escapeOutside&&!Indoors&&Vector2.Distance(player,XZ(door.destination))<.001f,"Door reaches correct exterior landing "+door.id+" / "+plan.id);
            Check(OutsideClearAt(player,playerY)&&Mathf.Abs(OutdoorHeight(player,playerY)-playerY)<.36f,"Outside door arrival is clear and supported");
            Interact(.01f,true);Check(escapeOutside,"Held use cannot bounce across a door");Interact(.01f,false);Interact(.01f,true);Check(mode==Mode.Inside&&floor==plan.id&&Vector2.Distance(player,XZ(door.inside))<.001f,"Door returns to its original level");doors++;
        }Check(doors==23,"All 23 outside doors round trip");
        var ids=new[]{"F1","F3","F2","F4","F5","F6","F7"};
        var routes=new[]{new[]{new Vector2(-21.9f,-25.8f),new Vector2(-21.9f,-30.1f),new Vector2(-21.9f,-25.8f),new Vector2(-20.3f,-25.8f),new Vector2(-20.3f,-30.1f),new Vector2(-20.3f,-30.5f)},new[]{new Vector2(21.9f,-25.8f),new Vector2(21.9f,-30.1f),new Vector2(21.9f,-25.8f),new Vector2(20.3f,-25.8f),new Vector2(20.3f,-30.1f),new Vector2(20.3f,-30.5f)},new[]{new Vector2(8.9f,-37.3f),new Vector2(8.9f,-43.2f),new Vector2(8.9f,-43.5f)},new[]{new Vector2(-63.55f,26.05f),new Vector2(-61.3f,26.05f),new Vector2(-61.3f,20.8f),new Vector2(-61.3f,20.5f)},new[]{new Vector2(-39.35f,44.5f),new Vector2(-45.75f,44.5f),new Vector2(-45.75f,46.05f),new Vector2(-39.35f,46.05f),new Vector2(-38.9f,46.05f)},new[]{new Vector2(42,32.15f),new Vector2(42,31.8f)},new[]{new Vector2(72.4f,3.9f),new Vector2(72.4f,1.7f),new Vector2(71,1.7f),new Vector2(66.9f,1.7f),new Vector2(66.6f,1.7f)}};
        for(int r=0;r<ids.Length;r++){StartOutside();paused=true;var door=Array.Find(floors[1].exits,e=>e.id==ids[r]);player=XZ(door.destination);playerY=door.destination.y;FollowOutside(routes[r]);Check(playerY<.7f,ids[r]+" descends to the grounds");var reverse=new List<Vector2>(routes[r]);reverse.Reverse();reverse.RemoveAt(0);reverse.Add(XZ(door.destination));FollowOutside(reverse.ToArray());Check(playerY>door.destination.y-.3f,ids[r]+" climbs back to the door");}
        CheckExteriorGuards();
        StartOutside();paused=true;player=new Vector2(-41.53f,-35.6f);playerY=-.4356667f;MoveOutside(Vector2.zero,.025f);Check(OutsideClearAt(player,playerY)&&Vector2.Distance(player,new Vector2(-41.53f,-35.6f))<.7f,"Embedded player recovers locally");
        foreach(int fps in new[]{30,60,120}){StartOutside();paused=false;player=new Vector2(0,55);playerY=OutdoorHeight(player,0);float ground=playerY;Jump();Jump();float peak=ground;for(int i=0;i<fps*2;i++){MovePlayer(Vector2.zero,1f/fps);peak=Mathf.Max(peak,playerY);}Check(peak-ground>1.65f&&peak-ground<1.70f&&!jumping&&Mathf.Abs(playerY-ground)<.001f,"Jump arc and idle landing at "+fps+" FPS (rise "+(peak-ground)+", height "+playerY+")");paused=true;}
        foreach(float x in new[]{-10f,45f}){StartOutside();paused=false;player=new Vector2(x,75.1f);playerY=0;for(int i=0;i<30;i++)MovePlayer(new Vector2(0,-3.1f/120),1f/120);float browserStop=x<0?74.5833333f:74.7383333f;Check(Mathf.Abs(player.y-browserStop)<.001f,"Walking stops at the browser controller's frontage wall/hedge position ("+x+", "+player.y+")");Jump();for(int i=0;i<150;i++)MovePlayer(new Vector2(0,-3.1f/120),1f/120);Check(player.y<73&&!jumping&&OutsideClearAt(player,playerY),"Jump clears the real frontage wall/hedge at "+x+" ("+player+", y="+playerY+")");}
        foreach(var plan in floors)foreach(var door in plan.exits){StartOutside();paused=false;player=XZ(door.destination);playerY=door.destination.y;MoveOutside(Vector2.zero,.1f);float ground=playerY;Jump();Check(jumping,"Jump starts after door arrival "+door.id);for(int i=0;i<150;i++)MovePlayer(Vector2.zero,1f/120);Check(OutsideClearAt(player,playerY)&&Mathf.Abs(playerY-ground)<.36f,"Jump lands safely at "+door.id+" / "+plan.id);}
        StartInside();paused=false;Jump();float maxHead=0;for(int i=0;i<120;i++){MovePlayer(Vector2.zero,1f/120);maxHead=Mathf.Max(maxHead,playerY+1.8f);}Check(maxHead<=3.801f&&!jumping,"Indoor jump respects ceiling and lands");
        floor=2;player=new Vector2(-31.1f,-7);playerY=-3.2f;ShowFloor();Jump();maxHead=-100;for(int i=0;i<120;i++){MovePlayer(Vector2.zero,1f/120);maxHead=Mathf.Max(maxHead,playerY+1.8f);}Check(maxHead<=-.299f&&!jumping,"Basement headroom limits jump");
        StartInside();paused=true;int cells=discovered[0].Count;Check(cells>0&&discovered[3].Count==0,"Notebook starts with local discovery only");paused=false;ToggleNotebook();Check(map,"Notebook opens from gameplay");var saved=player;float savedTime=elapsed;yield return null;Check(player==saved&&elapsed==savedTime,"Notebook pauses position and timer");CaptureUI(directory,"notebook-mobile.png",1560);ToggleNotebook();
        foreach(var art in manifest.wallArt){Check(LoadArchive(manifest.art[art.index].src)!=null,"Current wall artwork is available");}RecordArtwork(manifest.wallArt[0]);Check(notes.Exists(n=>n.id.StartsWith("art:")),"Inspected artwork adds a sourced notebook entry");
        StartOutside();paused=true;Check(!exploreInterior,"Exploration starts in the grounds");var entry=floors[0].exits[0];player=XZ(entry.destination);playerY=entry.destination.y;UseDoor(entry,0);Check(exploreInterior&&Indoors&&!Escaping,"Explore enters the same interior without an escape objective");foreach(var e in enemies)Check(!e.model.activeSelf,"Explore has no pursuers");FollowInterior(XZ(floors[3].rooms[0].label),3);PositionView();UpdateInteriorLights();yield return null;paused=false;CaptureUI(directory,"explore-second-floor-mobile.png",1560);paused=true;
        StartInside();paused=true;floor=2;player=new Vector2(-34.65f,3.8f);playerY=-3.2f;yaw=0;pitch=0;ShowFloor();PositionView();UpdateInteriorLights();yield return null;Capture(directory,"basement-mural.png");bool mural=false;foreach(var part in interiorParts)if(part.renderer.sharedMaterial.GetFloat("_Mural")>.5f&&part.renderer.sharedMaterial.GetTexture("_MuralMap"))mural=true;Check(mural,"Grindley mural uses the original archive texture on basement masonry");
        StartInside();paused=true;foreach(var e in enemies){e.floor=0;e.y=0;e.flight=null;e.position=new Vector2(0,14);e.path=RouteBetweenFloors(floors,e.position,0,XZ(floors[3].rooms[0].label),3);e.rethink=1000;e.memory=5;}
        // Exercise the actual enemy mover over stair turns, without allowing a capture.
        floor=3;player=new Vector2(1000,1000);playerY=8.4f;ShowFloor();elapsed=6;
        for(int n=0;n<8000&&!enemies.TrueForAll(e=>e.floor==3&&e.flight==null);n++){UpdateEnemies(.025f);if(n%1000==0)yield return null;}
        foreach(var e in enemies)Check(e.floor==3&&e.flight==null,"Pursuer walks physical stairs to second floor: "+e.name);
        StartInside();paused=true;Finish(false,"Security");string diagnosis=previousDiagnosis;StartInside();paused=true;Finish(false,"Security");Check(previousDiagnosis!=diagnosis&&status.Contains("Treatment:"),"Capture outcome avoids immediate repeats");
        StartInside();paused=true;UseDoor(floors[0].exits[0],0);Check(mode==Mode.Outside&&escapeOutside,"Leaving a door continues escape on foot");Finish(true,lastDoor.name);UpdateCinema(8);Check(mode==Mode.Escaped,"Front-path escape ending completes");
        StartInside();paused=true;Check(visitedLevels.Count==1&&usedDoors.Count==0,"Restart clears notebook discovery and tested doors");
    }
}
