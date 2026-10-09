using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Rendering;

public sealed partial class NativePrototypeGame
{
    void VisitEscapeNode(string id){var n=Array.Find(arrangement.nodes,p=>p.id==id);floor=n.floor;layout=floors[floor];player=XZ(n);playerY=layout.elevation;playerFlight=null;ShowFloor();Interact(.01f,false);Interact(.01f,true);}
    void VisitGroundsNode(string id,float seconds=.01f){var n=Array.Find(manifest.escape.nodes,p=>p.id==id);player=XZ(n);playerY=0;Interact(.01f,false);Interact(seconds,true);}
    IEnumerator CurrentGameplaySmoke(string directory){
        Check(SystemInfo.graphicsDeviceType!=GraphicsDeviceType.Null&&!SystemInfo.graphicsDeviceName.ToLowerInvariant().Contains("software"),"Native rendering uses hardware GPU: "+SystemInfo.graphicsDeviceName);
        yield return UsabilitySmoke(directory);
        yield return LatestExteriorSmoke(directory);
        Check(manifest.schema==4&&manifest.escape.variants.Length==8,"Current native assets include all eight Escape arrangements");
        foreach(var plan in floors){Check(plan.furniture.Length>0,"Furnished current floor "+plan.id);foreach(var item in plan.furniture)Check(!IndoorClear(plan,item.x,item.z,.01f),"Furniture blocks native walking at "+plan.id+" / "+item.x+","+item.z);}
        StartOutside();paused=true;SetPeriod(Array.FindIndex(manifest.periods,p=>p.year==1916));int doors=0;
        foreach(var plan in floors)foreach(var door in plan.exits){StartOutside();paused=true;player=XZ(door.destination);playerY=door.destination.y;UseDoor(door,plan.id);Check(Indoors&&!Escaping&&floor==plan.id,"Explore enters reviewed door "+plan.id+" / "+door.id);Interact(.01f,false);UseDoor(door,plan.id);Check(!Indoors&&!Escaping&&Vector2.Distance(player,XZ(door.destination))<.001f,"Explore returns to current outside landing "+plan.id+" / "+door.id);doors++;}
        Check(doors==24,"All 24 current exterior doors support peaceful round trips");
        StartOutside();paused=true;UseDoor(floors[0].exits[0],0);var spawn=player;
        foreach(int level in new[]{1,2,3}){var room=floors[level].rooms[0];FollowInterior(XZ(room.label),level);Check(!Escaping&&floor==level,"Peaceful physical stairs reach floor "+level);FollowInterior(spawn,0);}
        PositionView();UpdateInteriorLights();yield return null;Capture(directory,"current-reception.png");
        foreach(int variant in new[]{0,1,2,3,4,5,6,7}){
            StartInside();paused=true;NewEscapeScenario(variant);int notesBefore=notes.Count;
            var closed=Array.Find(floors[0].exits,e=>e.id==arrangement.exitId);player=XZ(closed.inside);UseDoor(closed,0);Check(Indoors&&!serviceKey,"Brass key required at selected outer door: "+variant);
            Check(!ScenarioDoorAllowed(floors[0].exits[0]),"Unselected outside door remains bolted: "+variant);
            UpdateObjective(59);Check(objectiveHint=="","Objective starts without a hint");UpdateObjective(1);Check(objectiveHint!="","Unchanged objective reveals its hint after sixty active seconds");
            VisitEscapeNode("memo");Check(evidence.Contains("memo")&&notes.Count>notesBefore,"Mounted memo records evidence in native notes");
            VisitEscapeNode("staff-key");Check(staffKey,"Reachable mounted staff key can be collected: "+variant);
            foreach(var g in arrangement.gates){floor=1;layout=floors[1];player=XZ(g);playerY=g.y;Interact(.01f,false);Interact(.01f,true);Check(openStaff.Contains(g.id),"Staff key opens native upper grille "+g.id);}
            Check(floors[0].flights.TrueForAllNative(f=>!f.blocked),"Unlocked staff stairs refresh native routing");
            VisitEscapeNode("plan");Check(serviceKey&&evidence.Contains("plan"),"Porter’s record supplies correct outside key: "+variant);
            VisitEscapeNode("memo");int remembered=notes.Count;Finish(false,"Security");Check(captures==1&&floor==0&&confiscated.Contains("staffKey")&&confiscated.Contains("serviceKey")&&notes.Count>=remembered,"First capture retains evidence and confiscates both keys");
            Check(capturePending&&IndoorClear(layout,player.x,player.y),"Capture shows a paused result and returns to a clear furnished room");if(variant==0){yield return null;CaptureUI(directory,"capture-reception.png",1560);}ContinueEscape();Check(!capturePending&&enemyReleaseAt==elapsed+10,"Continuing grants ten seconds of safe recovery");
            VisitEscapeNode("reclaim");Check(staffKey&&serviceKey&&confiscated.Count==0,"Supported Reception tray restores native keys");
            floor=0;layout=floors[0];player=XZ(closed.inside);playerY=layout.elevation;UseDoor(closed,0);Check(escapeOutside&&!Indoors&&escapeEstate.activeSelf,"Tagged outer door enters native Escape grounds");
            VisitGroundsNode("tower-door");Check(Mathf.Abs(doorAngles["tower-door"])>1,"Blue stores door opens in native game");
            VisitGroundsNode("workshop-door:repair");VisitGroundsNode("crowbar");Check(crowbar&&!movingFittings["tool-crowbar"].gameObject.activeSelf,"Repair bench crowbar is collected and disappears");
            VisitGroundsNode("workshop-door:oil-store");VisitGroundsNode("oil");Check(oil&&!movingFittings["tool-oil"].gameObject.activeSelf,"Oil-store tool is collected and disappears");
            VisitGroundsNode("pedestrian");Check(pedestrianOpen,"Oiled pedestrian gate opens");
            VisitGroundsNode("wicket",1);Check(!wicketOpen,"Boarded wicket retains required work time");Interact(2,true);Check(wicketOpen&&!movingFittings["wicket-boards"].gameObject.activeSelf,"Three seconds of native prising remove boards and open wicket");
            AdvanceGroundsDoors(.95f);foreach(var gate in manifest.escape.gates){player=new Vector2(gate.x,gate.z+.8f);playerY=0;for(int i=0;i<40;i++)MovePlayer(new Vector2(0,-.04f),.025f);Check(player.y<gate.z&&beyondBoundary,"Physical crossing of opened "+gate.id+" gate records boundary exit");}
            Finish(false,"Grounds security");Check(captures==2&&floor==2&&captureDelay==4&&!crowbar&&!oil&&pedestrianOpen&&wicketOpen&&Mathf.Abs(doorAngles["tower-door"])>1,"Second capture uses basement cell, returns tools and retains open gates");
            Check(movingFittings["tool-crowbar"].gameObject.activeSelf&&movingFittings["tool-oil"].gameObject.activeSelf,"Confiscated tools return to their workshop benches");
            ContinueEscape();Check(capturePending,"Observation cannot be skipped early");if(variant==0){yield return null;CaptureUI(directory,"capture-observation.png",1560);}UpdateCaptureRecovery(4);ContinueEscape();Check(!capturePending&&captureDelay==0,"Four-second observation enables continuing the Escape attempt");
            captures=captureLimit-1;Finish(false,"Security");Check(mode==Mode.Caught&&status.Contains("Treatment:"),"Last capture terminates the attempt");
            yield return null;
        }
        StartInside();paused=true;NewEscapeScenario(0);
        foreach(var id in new[]{"memo","staff-key","reclaim","plan"}){
            var n=Array.Find(arrangement.nodes,p=>p.id==id);floor=n.floor;layout=floors[floor];player=XZ(n);playerY=layout.elevation;playerFlight=null;ShowFloor();PositionView();view.transform.LookAt(World(XZ(n.mount),layout.elevation+n.mount.y));UpdateInteriorLights();yield return null;Capture(directory,"current-furnished-"+id+".png");
        }
        StartInside();paused=true;NewEscapeScenario(0);VisitEscapeNode("release");Check(openStaff.Contains("S1")&&openStaff.Contains("S5")&&!staffKey,"Basement release independently unlocks both staff routes");
        foreach(var g in arrangement.gates){Check(RouteBetweenFloors(floors,player,floor,XZ(floors[3].rooms[0].label),3).Count>0,"Released native routing reaches second floor");}
        VisitEscapeNode("plan");floor=0;layout=floors[0];var selected=Array.Find(layout.exits,e=>e.id==arrangement.exitId);player=XZ(selected.inside);playerY=0;UseDoor(selected,0);
        VisitGroundsNode("pedestrian");AdvanceGroundsDoors(.95f);player=new Vector2(-80,-84);playerY=0;for(int i=0;i<50;i++)MovePlayer(new Vector2(0,-.04f),.025f);player=XZ(manifest.escape.mast);Interact(.01f,false);Interact(.01f,true);Check(mode==Mode.Escape,"Only an open north-gate crossing followed by USE at the radio mast completes Escape");UpdateCinema(8);Check(mode==Mode.Escaped,"Native radio-mast ending completes");
        StartInside();paused=true;Check(captures==0&&notes.Count<10&&!staffKey&&!serviceKey&&!pedestrianOpen&&!wicketOpen,"New attempt resets physical state and notebook discovery");
        Check(CaptureLimitFor(false)==3&&CaptureLimitFor(true)==9,"Desktop keeps three lives and mobile receives nine");
        foreach(bool mobile in new[]{false,true}){
            StartInside();paused=true;NewEscapeScenario(0);captureLimit=CaptureLimitFor(mobile);
            var helpStyle=HelpStyle();Check(TextLines(EscapeHelp,helpStyle,660).Count*helpStyle.fontSize*1.26f<=350,"Life instructions fit above Resume: "+mobile);
            if(mobile){showTouchPreview=true;paused=false;help=true;yield return null;CaptureUI(directory,"mobile-nine-lives-help.png",1560);help=false;paused=true;showTouchPreview=false;}
            VisitEscapeNode("memo");VisitEscapeNode("release");pedestrianOpen=wicketOpen=true;SyncEscapeScenario();
            for(int life=1;life<=captureLimit;life++){
                staffKey=serviceKey=crowbar=oil=true;int remembered=notes.Count;Finish(false,life%2==0?"Grounds security":"Security");
                Check(captures==life&&LivesRemaining==captureLimit-life,"Life counter follows actual captures: "+mobile+" / "+life);
                if(life==captureLimit){Check(mode==Mode.Caught&&!capturePending&&status.Contains("Treatment:"),"Attempt ends exactly on last life: "+mobile);break;}
                Check(capturePending&&mode==Mode.Inside&&floor==(life%2==0?2:0)&&IndoorClear(layout,player.x,player.y),"Every recovery alternates clear Reception/cell positions: "+mobile+" / "+life);
                Check(notes.Count>=remembered&&evidence.Contains("memo")&&openStaff.Contains("S1")&&pedestrianOpen&&wicketOpen,"Later captures preserve discoveries and opened gates: "+mobile+" / "+life);
                Check(!staffKey&&!serviceKey&&!crowbar&&!oil&&confiscated.Count==2,"Later captures confiscate keys and return tools: "+mobile+" / "+life);
                Check(captureDelay==(life%2==0?4:0)&&enemyReleaseAt==elapsed+10,"Recovery delay and safe head start remain bounded: "+mobile+" / "+life);
                if(mobile&&life==8){yield return null;CaptureUI(directory,"mobile-eighth-capture.png",1560);}
                UpdateCaptureRecovery(4);ContinueEscape();Check(!capturePending,"Every remaining life can continue: "+mobile+" / "+life);
                VisitEscapeNode("reclaim");Check(staffKey&&serviceKey&&confiscated.Count==0,"Keys remain recoverable on later lives: "+mobile+" / "+life);
            }
            StartInside();Check(captures==0&&LivesRemaining==CaptureLimitFor(Application.isMobilePlatform),"Restart restores platform life budget: "+mobile);
        }
        StartInside();paused=true;
        paused=false;ToggleNotebook();var before=player;float time=elapsed;yield return null;Check(player==before&&elapsed==time,"Notebook pauses native movement and hints");CaptureUI(directory,"current-notebook.png",1560);ToggleNotebook();paused=true;
        VisitEscapeNode("release");VisitEscapeNode("plan");floor=0;layout=floors[0];selected=Array.Find(layout.exits,e=>e.id==arrangement.exitId);player=XZ(selected.inside);playerY=0;UseDoor(selected,0);SetTimeOfDay(LightingMode.Day);
        foreach(var shot in new[]{new Vector3(156,1.8f,-40),new Vector3(149,1.8f,-40),new Vector3(87,1.8f,-82),new Vector3(-80,1.8f,-82)}){player=new Vector2(shot.x,shot.z);playerY=0;view.transform.position=World(player,shot.y);view.transform.LookAt(World(player+new Vector2(0,-6),1.8f));UpdateScenarioLights();yield return null;Capture(directory,"current-grounds-"+shot.x+"-"+shot.z+".png");}
        StartOutside();paused=true;Check(!escapeEstate.activeSelf&&!escapeFittings.activeSelf,"Peaceful exploration restores the dated estate without scenario geometry");
    }
}
static class NativeValidationArrays {public static bool TrueForAllNative<T>(this T[] values,Predicate<T> test){return Array.TrueForAll(values,test);}}
