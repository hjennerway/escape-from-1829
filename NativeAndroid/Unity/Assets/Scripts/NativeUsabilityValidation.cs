using System;
using System.Collections;
using System.Text.RegularExpressions;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    IEnumerator UsabilitySmoke(string directory)
    {
        StartOutside();paused=true;
        foreach(var direction in new[]{Vector2.up,Vector2.down,Vector2.left,Vector2.right,new Vector2(1,1).normalized}){
            SetMoveStick(direction*stickTravel*.4f);Check(!sprintHeld&&Vector2.Dot(stickVector.normalized,direction)>.999f&&stickVector.magnitude<.5f,"Small Move deflection walks in requested direction: "+direction);
            SetMoveStick(direction*stickTravel);Check(sprintHeld&&Mathf.Abs(stickVector.magnitude-1)<.001f,"Move edge runs in requested direction: "+direction);
        }
        SetMoveStick(Vector2.one);Check(stickVector==Vector2.zero&&!sprintHeld,"Move centre has a stable dead zone");
        var clearPatch=new Vector2(0,55);for(float z=50;z<100;z+=5)if(OutsideClearAt(new Vector2(0,z),0)&&OutsideClearAt(new Vector2(0,z-2),0)){clearPatch=new Vector2(0,z);break;}
        player=clearPatch;playerY=0;yaw=0;SetMoveStick(Vector2.up*stickTravel*.4f);var from=player;Walk(stickVector,.1f,sprintHeld);float walked=Vector2.Distance(from,player);
        player=from;SetMoveStick(Vector2.up*stickTravel);Walk(stickVector,.1f,sprintHeld);Check(Vector2.Distance(from,player)>walked*4,"Move edge produces faster actual walking travel");
        SetMoveStick(Vector2.zero);Check(!sprintHeld&&stickVector==Vector2.zero,"Releasing Move stops movement and run request");
        int numbered=0;
        foreach(var plan in floors){int count=0;foreach(var room in plan.rooms)if(!string.IsNullOrEmpty(room.number)){count++;Check(Regex.IsMatch(room.number,plan.id==0?"^G[1-9][0-9]*$":plan.id==1?"^1[0-9]{2}$":plan.id==2?"^B[1-9][0-9]*$":"^2[0-9]{2}$"),"Visible room format: "+plan.id+" / "+room.number);}numbered+=count;}
        Check(numbered==92,"All 92 actual numbered rooms reach the native maps and notes");
        var finished=new bool[floors.Length];
        foreach(var renderer in inside.GetComponentsInChildren<Renderer>(true))if(renderer.sharedMaterial.GetFloat("_RoomWalls")>.5f){var name=renderer.transform.parent.name;int level=int.Parse(name.Split('-')[1]);Check(Mathf.Abs(renderer.sharedMaterial.GetFloat("_RoomFloor")-floors[level].elevation)<.001f,"Rendered wallpaper uses its own floor height: "+name);finished[level]=true;}
        Check(Array.TrueForAll(finished,v=>v),"Rendered wallpaper exists on all four floors");
        foreach(int variant in new[]{0,1,2,3,4,5,6,7}){
            StartInside();paused=true;NewEscapeScenario(variant);
            foreach(var id in new[]{"memo","release-note","office-index","release","plan"})VisitEscapeNode(id);
            foreach(var plan in floors)foreach(var exit in plan.exits){
                floor=plan.id;layout=plan;player=XZ(exit.inside);playerY=plan.elevation;playerFlight=null;ShowFloor();
                bool allowed=exit.x<0||exit.id==arrangement.exitId;
                Check(ScenarioDoorAllowed(exit)==allowed,"Key door coverage: "+variant+" / "+plan.id+" / "+exit.id);
                Check(Fitting("lock-"+plan.id+"-"+exit.id).gameObject.activeSelf==!allowed,"Chain agrees with key coverage: "+variant+" / "+plan.id+" / "+exit.id);
                UseDoor(exit,plan.id);Check(escapeOutside==allowed,"Actual key door departure: "+variant+" / "+plan.id+" / "+exit.id);
                if(allowed){
                    Check(OutsideClearAt(player,playerY),"Escape door landing is collision clear: "+variant+" / "+plan.id+" / "+exit.id);
                    var landing=player;float landingY=playerY;bool walkedAway=false;
                    foreach(var direction in new[]{Vector2.right,Vector2.left,Vector2.up,Vector2.down}){
                        player=landing;playerY=landingY;hasSafeOutside=false;
                        for(int tick=0;tick<12;tick++)MovePlayer(direction*.025f,1f/60);
                        if(Vector2.Distance(player,landing)>.12f&&OutsideClearAt(player,playerY))walkedAway=true;
                    }
                    Check(walkedAway,"Actual movement works after Escape door: "+variant+" / "+plan.id+" / "+exit.id);
                    UseDoor(exit,plan.id);Check(Indoors&&floor==plan.id,"Actual west door return retains level: "+variant+" / "+plan.id+" / "+exit.id);
                }
            }
            foreach(var note in notes)Check(!Regex.IsMatch(note.title+" "+note.text+" "+note.source,@"\bR\d+\b"),"Native notebook omits model room IDs: "+note.id);
            foreach(int level in new[]{0,1,2,3}){floor=level;layout=floors[level];serviceKey=false;confiscated.Clear();evidence.Add("memo");UpdateObjective(60);Check(!Regex.IsMatch(objectiveHint,@"\bR\d+\b"),"Native objective uses actual room numbers: "+variant+" / "+level);}
        }
        foreach(int level in new[]{0,1,2,3}){
            StartInside();paused=true;floor=level;layout=floors[level];var room=Array.Find(layout.rooms,r=>r.id==(level==2?"B1":level==3?"R41":"R23"));player=XZ(room.label);playerY=layout.elevation;ShowFloor();yaw=Mathf.PI/2;pitch=0;PositionView();UpdateInteriorLights();ObserveNotebook();yield return null;
            Capture(directory,"wallpaper-floor-"+level+".png");paused=false;ToggleNotebook();notebookLevel=level;Check(map&&!paused,"Room-number capture shows the notebook on floor "+level);CaptureUI(directory,"room-numbers-floor-"+level+".png",1560);ToggleNotebook();paused=true;
        }
        Home();paused=true;CaptureUI(directory,"revised-title.png",1560);
        StartInside();paused=true;CaptureUI(directory,"revised-pause-exit.png",1560);paused=false;bool oldTouchPreview=showTouchPreview;showTouchPreview=true;CaptureUI(directory,"revised-move-controls.png",1560);showTouchPreview=oldTouchPreview;paused=true;
        StartAerial();paused=true;SetTimeOfDay(LightingMode.Dusk);orbitTarget=new Vector3(20,0,-70);orbitDistance=240;orbitPitch=70;UpdateOrbit(0);yield return null;Capture(directory,"revised-lamp-pools-aerial.png");
        Check(poolMaterial.shader==lampPoolShader&&!lampPools.GetComponent<Renderer>().receiveShadows,"Lamp pools use stable unlit road overlay without surface-light reflections");
        Check(PointerOverControls(quitButton.center),"Exploration exit accepts its full button area");
    }
}
