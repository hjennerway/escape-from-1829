using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    [Serializable] public class EscapeNode : Point {public string id,title;public int floor;public Point mount;}
    [Serializable] public class StaffGate : Point {public string id;public float dx,dz,height;}
    [Serializable] public class GroundsGate : Point {public string id;public float width;}
    [Serializable] public class MovingFitting {public string id;public float angle;public Obstacle obstacle;}
    [Serializable] public class EscapeVariant {public int seed;public string variant,exitId,office,keyRoom;public EscapeNode[] nodes;public StaffGate[] gates;}
    [Serializable] public class EscapeScenario {
        public int[] meshes;public EscapeVariant[] variants;public EscapeNode[] nodes;public MovingFitting[] moving;
        public Obstacle[] solids,obstacles,obstaclesNoTrees,supports,walkSurfaces;
        public Point[] outline,patrol,lamps;public GroundsGate[] gates;public Point mast;
    }
    public GameObject escapePrefab,fittingsPrefab;
    GameObject escapeEstate,escapeFittings,groundsGuard;NativeGuardPose groundsGuardPose;
    Transform activeFittings;EscapeVariant arrangement;
    readonly Dictionary<string,Transform> movingFittings=new Dictionary<string,Transform>();
    readonly Dictionary<string,float> doorAngles=new Dictionary<string,float>();
    readonly Dictionary<string,float> renderedDoorAngles=new Dictionary<string,float>();
    readonly HashSet<string> openStaff=new HashSet<string>(),evidence=new HashSet<string>(),confiscated=new HashSet<string>();
    bool staffKey,serviceKey,crowbar,oil,pedestrianOpen,wicketOpen,beyondBoundary;
    bool groundsPatrolSpawned;bool capturePending;string captureMessage="";float enemyReleaseAt;
    int captures,captureLimit,guardPatrol,scenarioRevision;float wicketWork,objectiveTime,captureDelay,guardRethink,guardMemory;
    static int CaptureLimitFor(bool mobile)=>mobile?9:3;
    int LivesRemaining=>Mathf.Max(0,captureLimit-captures);
    string objectiveId="",objectiveTitle="",objectiveHint="";Vector2 guardPosition,guardTarget;
    enum GroundsMode {Patrol,Investigate,Chase,Search,Return}
    GroundsMode groundsMode;float guardHeading,guardWait,guardSearchAngle,guardStuck;int guardRevision=-1;
    List<Vector2> guardPath=new List<Vector2>();
    SpatialObstacles scenarioSolids;CompactJumpIndex scenarioJumps;
    bool[] escapeMeshSet;Material[][] estateSurfaceMaterials,workshopSurfaceMaterials;bool workshopShaderActive;
    bool indexedScenario;int indexedScenarioRevision=-1;
    void InitializeEscapeScenario(){
        escapeMeshSet=new bool[manifest.meshFlags.Length];foreach(var id in manifest.escape.meshes)escapeMeshSet[id]=true;
        escapeEstate=Instantiate(escapePrefab);escapeFittings=Instantiate(fittingsPrefab);
        foreach(var t in escapeEstate.GetComponentsInChildren<Transform>(true))if(Array.Exists(manifest.escape.moving,d=>d.id==t.name)||t.name=="wicket-boards"||t.name.StartsWith("tool-")||t.name=="escape-trees")movingFittings[t.name]=t;
        groundsGuard=Instantiate(guardPrefab);groundsGuard.name="Grounds security patrol";groundsGuardPose=new NativeGuardPose(groundsGuard);
        PrepareWorkshopSurfaceShader();PrepareInteractionGlows();
        escapeEstate.SetActive(false);escapeFittings.SetActive(false);groundsGuard.SetActive(false);
    }
    void PrepareInteractionGlows(){
        var shader=Resources.Load<Shader>("NativeInteractionGlow");if(!shader||!shader.isSupported)throw new Exception("Native interaction glow shader is unavailable.");var copies=new Dictionary<Material,Material>();
        foreach(var renderer in escapeFittings.GetComponentsInChildren<MeshRenderer>(true)){
            var materials=renderer.sharedMaterials;bool changed=false;
            for(int i=0;i<materials.Length;i++){var original=materials[i];if(original.GetFloat("_Unlit")<.5f||Mathf.Abs(original.color.a-.28f)>.001f)continue;
                if(!copies.TryGetValue(original,out var copy)){copy=new Material(shader);var colour=original.color;colour.a=1;copy.color=colour;copies[original]=copy;}materials[i]=copy;changed=true;
            }if(changed)renderer.sharedMaterials=materials;
        }
    }
    void PrepareWorkshopSurfaceShader(){
        var shader=Resources.Load<Shader>("NativeWorkshopSurface");if(!shader||!shader.isSupported)throw new Exception("Current native workshop shader is unavailable.");
        var copies=new Dictionary<Material,Material>();Material Copy(Material original){if(!copies.TryGetValue(original,out var copy)){copy=new Material(original);var keywords=original.shaderKeywords;copy.shader=shader;foreach(var keyword in keywords)copy.EnableKeyword(keyword);copies[original]=copy;}return copy;}
        estateSurfaceMaterials=new Material[estateMeshes.Length][];workshopSurfaceMaterials=new Material[estateMeshes.Length][];
        for(int i=0;i<estateMeshes.Length;i++)if(escapeMeshSet[i]){var source=estateMeshes[i].sharedMaterials;estateSurfaceMaterials[i]=source;var target=new Material[source.Length];for(int k=0;k<source.Length;k++)target[k]=Copy(source[k]);workshopSurfaceMaterials[i]=target;}
        foreach(var renderer in escapeEstate.GetComponentsInChildren<Renderer>(true)){var source=renderer.sharedMaterials;for(int k=0;k<source.Length;k++)source[k]=Copy(source[k]);renderer.sharedMaterials=source;}
    }
    void SetWorkshopSurfaceShader(bool active){if(workshopShaderActive==active)return;workshopShaderActive=active;for(int i=0;i<estateMeshes.Length;i++)if(escapeMeshSet[i])estateMeshes[i].sharedMaterials=active?workshopSurfaceMaterials[i]:estateSurfaceMaterials[i];}
    void NewEscapeScenario(int variant=-1){
        arrangement=manifest.escape.variants[variant<0?UnityEngine.Random.Range(0,manifest.escape.variants.Length):variant];
        capturePending=false;groundsPatrolSpawned=false;enemyReleaseAt=5;captureLimit=CaptureLimitFor(Application.isMobilePlatform);
        int index=Array.IndexOf(manifest.escape.variants,arrangement);
        foreach(var t in escapeFittings.GetComponentsInChildren<Transform>(true))if(t.name.StartsWith("variant-")){t.gameObject.SetActive(t.name=="variant-"+index);if(t.gameObject.activeSelf)activeFittings=t;}
        staffKey=serviceKey=crowbar=oil=pedestrianOpen=wicketOpen=beyondBoundary=false;captures=0;captureDelay=wicketWork=objectiveTime=guardMemory=0;objectiveId="";
        openStaff.Clear();evidence.Clear();confiscated.Clear();doorAngles.Clear();
        renderedDoorAngles.Clear();foreach(var d in manifest.escape.moving){doorAngles[d.id]=0;renderedDoorAngles[d.id]=0;}
        guardPosition=XZ(manifest.escape.patrol[0]);guardTarget=guardPosition;guardPatrol=0;guardPath.Clear();guardRethink=0;groundsMode=GroundsMode.Patrol;guardHeading=Mathf.PI;guardWait=guardStuck=0;guardRevision=-1;
        foreach(var flight in floors[0].flights)flight.blocked=false;
        SyncEscapeScenario();RefreshScenarioVisibility();
    }
    Transform Fitting(string name){foreach(var t in activeFittings.GetComponentsInChildren<Transform>(true))if(t.name==name)return t;foreach(var t in escapeFittings.GetComponentsInChildren<Transform>(true))if(t.name==name)return t;throw new Exception("Missing exported Escape fitting "+name);}
    void SyncEscapeScenario(){
        if(arrangement==null)return;
        bool routeChanged=false;foreach(var gate in arrangement.gates){bool open=openStaff.Contains(gate.id);Fitting("staff-leaf-"+gate.id).gameObject.SetActive(!open);foreach(var flight in floors[0].flights)if(flight.id==gate.id&&flight.lower==1&&flight.upper==3){routeChanged|=flight.blocked==open;flight.blocked=!open;}}if(routeChanged)routeCache.Clear();
        foreach(var node in arrangement.nodes){var keyName="key-"+node.id;if(node.id=="staff-key"||node.id=="plan"||node.id=="reclaim")Fitting(keyName).gameObject.SetActive(node.id=="staff-key"?!staffKey:node.id=="plan"?!serviceKey:confiscated.Count>0);}
        foreach(var plan in floors)foreach(var exit in plan.exits)Fitting("lock-"+plan.id+"-"+exit.id).gameObject.SetActive(!serviceKey||!ServiceKeyFits(exit));
        movingFittings["tool-crowbar"].gameObject.SetActive(!crowbar);movingFittings["tool-oil"].gameObject.SetActive(!oil);movingFittings["wicket-boards"].gameObject.SetActive(!wicketOpen);
        foreach(var d in manifest.escape.moving)movingFittings[d.id].localRotation=Quaternion.Euler(0,-renderedDoorAngles[d.id]*Mathf.Rad2Deg,0);
        scenarioRevision++;indexedScenarioRevision=-1;UpdateObjective(0);
    }
    void RefreshScenarioVisibility(){
        if(!escapeEstate)return;bool active=Escaping;
        escapeEstate.SetActive(active&&!Indoors);escapeFittings.SetActive(active&&Indoors);groundsGuard.SetActive(active&&!Indoors);
        if(movingFittings.TryGetValue("escape-trees",out var treeRoot))treeRoot.gameObject.SetActive(trees);
        SetWorkshopSurfaceShader(active&&!Indoors);
        if(!active){foreach(var flight in floors[0].flights)flight.blocked=false;routeCache.Clear();}RefreshEstateVisibility();indexedPeriod=-1;
    }
    void RefreshScenarioActive(){if(escapeEstate.activeSelf!=(Escaping&&!Indoors)||escapeFittings.activeSelf!=(Escaping&&Indoors))RefreshScenarioVisibility();}
    bool StaffMoveAllowed(Vector2 from,float fromY,Vector2 next,float nextY){
        if(!Escaping||arrangement==null)return true;
        foreach(var g in arrangement.gates){if(openStaff.Contains(g.id)||nextY+1.8f<g.y||nextY>g.y+g.height)continue;
            float a=(from.x-g.x)*g.dx+(from.y-g.z)*g.dz,b=(next.x-g.x)*g.dx+(next.y-g.z)*g.dz;if(a*b>0&&Mathf.Abs(b)>.35f)continue;
            float t=a==b?1:Mathf.Clamp01(a/(a-b));var p=Vector2.Lerp(from,next,t);if(Mathf.Abs((p.x-g.x)*-g.dz+(p.y-g.z)*g.dx)<=.95f)return false;
        }return true;
    }
    void ScenarioNote(string id,string title,string content){evidence.Add(id);AddNote("escape:"+id,title,content,"Personal observation · fictional escape scenario");}
    bool ScenarioInteract(float dt,bool use){
        if(!Escaping||arrangement==null)return false;
        EscapeNode node=null;
        if(Indoors){
            foreach(var gate in arrangement.gates)if(!openStaff.Contains(gate.id)&&Mathf.Abs(playerY-gate.y)<1&&Vector2.Distance(player,XZ(gate))<1.8f){prompt="USE · Staff offices · locked upper grille";if(use&&!stairLatch){stairLatch=true;ScenarioNote("gate","Staff offices","The upper grille needs a staff stair key, or the basement safety release.");if(staffKey){openStaff.Add(gate.id);SyncEscapeScenario();}}return true;}
            float nearest=2.1f;foreach(var n in arrangement.nodes){var mount=n.mount??n;float distance=Vector2.Distance(player,XZ(mount));if(n.floor==floor&&distance<nearest&&(n.id!="staff-key"||!staffKey)&&LineOfSight(layout,player,XZ(mount))){nearest=distance;node=n;}}
        }else{
            float nearest=1.85f;foreach(var n in manifest.escape.nodes){float distance=Vector2.Distance(player,XZ(n));if(distance<nearest&&Mathf.Abs(playerY)<.7f&&(n.id!="crowbar"||!crowbar)&&(n.id!="oil"||!oil)&&(n.id!="pedestrian"||!pedestrianOpen)&&(n.id!="wicket"||!wicketOpen)){nearest=distance;node=n;}}
            if(beyondBoundary&&Vector2.Distance(player,XZ(manifest.escape.mast))<7){prompt="USE · Radio mast · Finish escape";if(use&&!stairLatch)Finish(true,"the radio mast");return true;}
        }
        if(node==null){wicketWork=0;return false;}
        prompt=(node.id=="wicket"&&crowbar?"Hold USE · Prise boards":"USE · ")+node.title;
        if(node.id=="wicket"&&crowbar&&use){if(Mathf.FloorToInt(wicketWork)!=Mathf.FloorToInt(wicketWork+dt)||wicketWork==0)GroundsNoise(player,65);wicketWork+=dt;if(wicketWork>=3){wicketOpen=true;doorAngles["wicket"]=-Mathf.PI/2;ScenarioNote("wicket","Maintenance wicket opened","I prised off the boards. The gate remains open if I am caught.");SyncEscapeScenario();wicketWork=0;}return true;}
        if(!use){wicketWork=0;return true;}if(stairLatch)return true;stairLatch=true;
        switch(node.id){
            case "staff-key":staffKey=true;confiscated.Remove("staffKey");ScenarioNote(node.id,"Staff stair key","I took the staff stair key. It opens the upper grilles.");break;
            case "release":openStaff.Add("S1");openStaff.Add("S5");ScenarioNote(node.id,"Basement safety release","Both upper staff grilles are released. The porter’s record is in room "+RoomNumber(3,arrangement.office)+" on the second floor.");break;
            case "plan":serviceKey=true;confiscated.Remove("serviceKey");ScenarioNote(node.id,"Porter’s service record","I took the brass outside-door key. It unlocks every west-side exit on all floors and the tagged "+arrangement.variant+" outer entrance, "+arrangement.exitId+". Beyond the boundary, the radio mast stands northwest.");break;
            case "reclaim":foreach(var key in confiscated){if(key=="staffKey")staffKey=true;if(key=="serviceKey")serviceKey=true;}confiscated.Clear();ScenarioNote(node.id,"Property tray","I recovered my confiscated keys from Reception.");break;
            case "memo":ScenarioNote(node.id,"Staff memorandum","The staff stair key is in room "+RoomNumber(0,arrangement.keyRoom)+" beside Reception. The basement offers a safety release.");break;
            case "release-note":ScenarioNote(node.id,"Maintenance notice","The shared staff-stair release is in basement room "+RoomNumber(2,"B4")+" beside the west stair.");break;
            case "office-index":ScenarioNote(node.id,"Office filing notice","The porter’s record and outside-door key are in second-floor room "+RoomNumber(3,arrangement.office)+".");break;
            case "crowbar":crowbar=true;ScenarioNote(node.id,"Crowbar taken","The repair bench supplied a crowbar for the north maintenance wicket.");break;
            case "oil":oil=true;ScenarioNote(node.id,"Oil can taken","The oil store supplied oil to quiet the pedestrian gate.");break;
            case "pedestrian":pedestrianOpen=true;doorAngles[node.id]=-Mathf.PI/2;ScenarioNote(node.id,"Pedestrian gate",oil?"I oiled the hinges and opened the gate quietly.":"The gate squeaked open. Security may investigate.");if(!oil)GroundsNoise(player,48);break;
            case "wicket":ScenarioNote(node.id,"Boarded maintenance wicket","A crowbar from the repair workshop can prise these boards off.");break;
            case "night-gate":ScenarioNote(node.id,"Locked carriage gate","The west perimeter path leads to the pedestrian gate. The maintenance wicket is on the north boundary.");break;
            default:if(doorAngles.ContainsKey(node.id)){var definition=Array.Find(manifest.escape.moving,d=>d.id==node.id);doorAngles[node.id]=Mathf.Abs(doorAngles[node.id])>.01f?0:definition.angle;ScenarioNote(node.id,node.title,"I operated this workshop door.");GroundsNoise(XZ(node),22);}else ScenarioNote(node.id,node.title,"These double doors are locked; this section is closed.");break;
        }
        SyncEscapeScenario();return true;
    }
    string RoomNumber(int level,string id){var room=Array.Find(floors[level].rooms,r=>r.id==id);if(room==null||string.IsNullOrEmpty(room.number))throw new Exception("Missing player room number "+level+":"+id);return room.number;}
    bool ServiceKeyFits(Exit exit)=>exit.x<0||exit.id==arrangement.exitId;
    bool ScenarioDoorAllowed(Exit exit){if(!Escaping||!Indoors)return true;if(ServiceKeyFits(exit)&&serviceKey)return true;ScenarioNote("outside-door",exit.name,ServiceKeyFits(exit)?"This exit needs the brass outside-door key from the upper offices. It fits every west-side exit.":"This door is bolted for the night. The brass key fits west-side exits and its tagged entrance.");prompt="Locked · "+exit.name;stairLatch=true;return false;}
    void ObserveGroundsBoundary(Vector2 previous){
        if(!escapeOutside)return;
        foreach(var g in manifest.escape.gates){bool open=g.id=="pedestrian"?pedestrianOpen:wicketOpen;if(!open||previous.y<g.z||player.y>=g.z)continue;float t=(g.z-previous.y)/(player.y-previous.y),x=Mathf.Lerp(previous.x,player.x,t);if(Mathf.Abs(x-g.x)<g.width/2-.25f){beyondBoundary=true;ScenarioNote("boundary","Beyond the grounds","I crossed the open north gate. The radio mast lies northwest.");}}
        if(previous.y<-85&&player.y>=-85)beyondBoundary=false;
    }
    void UpdateObjective(float dt){
        if(arrangement==null)return;string id,title,hint;
        if(escapeOutside){id=beyondBoundary?"mast":"grounds";title=beyondBoundary?"Reach the radio mast":"Find a way through the grounds boundary";hint=beyondBoundary?"USE at the lattice mast northwest of the asylum.":"Follow the north gates. Oil quiets the pedestrian gate; a crowbar from the tower repair workshop opens the boarded wicket.";}
        else if(serviceKey){id="door";title="Unlock any west-side exit";hint="Any floor · USE at a west-side exit with the brass key. It also fits the tagged entrance, "+arrangement.exitId+".";}
        else if(confiscated.Count>0){id="reclaim";title="Recover your keys at Reception";hint="USE the glowing property tray on the Reception desk.";}
        else if(openStaff.Count>0||floor==3){id="record";title="Explore the upper offices";hint="Find the porter’s record and brass key in second-floor room "+RoomNumber(3,arrangement.office)+".";}
        else if(staffKey){id="stairs";title="Access the staff stairs";hint="USE the staff key at an upper stair grille.";}
        else if(evidence.Contains("release-note")){id="release";title="Use the basement stair release";hint="USE the safety control in basement room "+RoomNumber(2,"B4")+".";}
        else if(evidence.Contains("memo")){id="key";title="Find the staff stair key";hint="Ground floor · room "+RoomNumber(0,arrangement.keyRoom)+" beside Reception.";}
        else{id="access";title="Find a way into the upper offices";hint="Inspect glowing notices and keys near Reception, or the basement maintenance notice.";}
        string progress=id+":"+captures+":"+staffKey+":"+serviceKey+":"+openStaff.Count+":"+crowbar+":"+oil+":"+pedestrianOpen+":"+wicketOpen;
        if(progress!=objectiveId){objectiveId=progress;objectiveTime=0;}else objectiveTime+=Mathf.Max(0,dt);objectiveTitle=title;objectiveHint=objectiveTime>=60?hint:"";
    }
    bool RecoverFromCapture(string who){
        if(arrangement==null||!Escaping)return false;captures++;if(captures>=captureLimit)return false;groundsPatrolSpawned=false;
        if(staffKey)confiscated.Add("staffKey");if(serviceKey)confiscated.Add("serviceKey");staffKey=serviceKey=crowbar=oil=beyondBoundary=false;
        bool observation=captures%2==0;
        ResetInput();mode=Mode.Inside;escapeOutside=exploreInterior=false;floor=observation?2:0;var room=Array.Find(floors[floor].rooms,r=>r.id==(observation?"B5":"R23"));player=XZ(room.label);playerY=floors[floor].elevation;playerFlight=null;captureDelay=observation?4:0;stamina=1;spotted=false;capturePending=true;enemyReleaseAt=elapsed+10;
        captureMessage=(observation?"You are moved to a padded cell in the basement for a brief observation period.":"You are brought back to the admissions room beside Reception.")+"\n\n"+(confiscated.Count>0?"Your keys are in the property tray beside Reception. ":"")+"Your notebook and discoveries remain. Opened gates stay open. Tools are returned to the tower workshops.\n\n"+(LivesRemaining==1?"One life remains. The next capture ends this attempt.":LivesRemaining+" lives remain.");
        inside.SetActive(true);outside.SetActive(false);artRoot.SetActive(true);portal.SetActive(false);ShowFloor();
        foreach(var e in enemies){e.floor=0;e.y=floors[0].elevation;e.flight=null;e.search=null;e.searchCooldown=0;var safe=Array.FindAll(floors[0].safeSpawns,p=>floor!=0||Vector2.Distance(XZ(p),player)>18);e.position=XZ(safe[UnityEngine.Random.Range(0,safe.Length)]);e.path.Clear();e.memory=0;e.rethink=0;PositionEnemy(e);}
        ScenarioNote("capture:"+captures,"Returned under supervision",who+" returned me to "+room.name+". Keys were taken to Reception; my notes and opened gates are retained.");SyncEscapeScenario();RefreshScenarioVisibility();SetLighting(true);PositionView();ObserveNotebook();UnlockMouse();return true;
    }
    void UpdateCaptureRecovery(float dt){captureDelay=Mathf.Max(0,captureDelay-dt);}
    void ContinueEscape(){if(!capturePending||captureDelay>0)return;capturePending=false;paused=false;LockMouse();}
    void DrawCaptureRecovery(){
        Panel(new Rect(280,85,720,585));Label(new Rect(320,118,640,35),"CAPTURE "+captures+" OF "+captureLimit,eyebrow);
        Label(new Rect(320,162,640,65),floor==2?"Under observation":"Returned to Reception",heading);
        Label(new Rect(325,245,630,275),captureMessage,new GUIStyle(serif){fontSize=21});
        if(Button(resultHomeButton,"RESTART"))StartInside();
        bool enabled=GUI.enabled;GUI.enabled=captureDelay<=0;
        if(Button(retryButton,captureDelay>0?"OBSERVATION · "+Mathf.CeilToInt(captureDelay)+"s":"CONTINUE ESCAPE",true))ContinueEscape();GUI.enabled=enabled;
    }
    void BuildScenarioObstacles(){
        var solids=new List<Obstacle>(manifest.escape.solids);
        foreach(var d in manifest.escape.moving){
            var source=d.obstacle;var pivot=movingFittings[d.id];var corners=new Point[4];var sourceCorners=source.corners??new[]{new Point{x=source.minX,z=source.minZ},new Point{x=source.maxX,z=source.minZ},new Point{x=source.maxX,z=source.maxZ},new Point{x=source.minX,z=source.maxZ}};
            float angle=renderedDoorAngles[d.id],c=Mathf.Cos(angle),s=Mathf.Sin(angle),px=pivot.position.x,pz=-pivot.position.z;
            float minX=float.PositiveInfinity,maxX=float.NegativeInfinity,minZ=float.PositiveInfinity,maxZ=float.NegativeInfinity;
            for(int i=0;i<4;i++){float x=sourceCorners[i].x-px,z=sourceCorners[i].z-pz;corners[i]=new Point{x=px+c*x+s*z,z=pz-s*x+c*z};minX=Mathf.Min(minX,corners[i].x);maxX=Mathf.Max(maxX,corners[i].x);minZ=Mathf.Min(minZ,corners[i].z);maxZ=Mathf.Max(maxZ,corners[i].z);}
            solids.Add(new Obstacle{minX=minX,maxX=maxX,minZ=minZ,maxZ=maxZ,minY=source.minY,maxY=source.maxY,corners=corners});
        }
        scenarioSolids=new SpatialObstacles(solids.ToArray());indexedScenarioRevision=scenarioRevision;
    }
    // Ordinary departures need the small walking index. Decode the detailed
    // rendered bounds only when a jump actually queries them.
    void EnsureScenarioJumps(){if(scenarioJumps==null)scenarioJumps=new CompactJumpIndex(escapeCollisionText.bytes,manifest.escapeJumpBounds);scenarioJumps.trees=trees;}
    void AdvanceGroundsDoors(float dt){
        if(arrangement==null)return;bool changed=false;
        foreach(var d in manifest.escape.moving){float current=renderedDoorAngles[d.id],next=Mathf.MoveTowards(current,doorAngles[d.id],Mathf.PI/2*dt/.95f);if(next==current)continue;
            var pivot=movingFittings[d.id];float oldAngle=current;renderedDoorAngles[d.id]=next;scenarioRevision++;BuildScenarioObstacles();
            if(escapeOutside&&Mathf.Abs(next)<Mathf.Abs(current)&&!ScenarioClear(player,playerY)){renderedDoorAngles[d.id]=oldAngle;scenarioRevision++;BuildScenarioObstacles();continue;}
            pivot.localRotation=Quaternion.Euler(0,-next*Mathf.Rad2Deg,0);changed=true;
        }if(changed){scenarioRevision++;indexedScenarioRevision=-1;}
    }
    bool ScenarioClear(Vector2 p,float y,bool airborne=false){if(!Escaping)return true;if(indexedScenarioRevision!=scenarioRevision)BuildScenarioObstacles();foreach(var o in scenarioSolids.At(p))if(o.maxY>y+(airborne?.025f:.35f)&&o.minY<y+(airborne?1.79f:1.5f)&&Contains(o,p.x,p.y,.27f))return false;if(airborne){EnsureScenarioJumps();foreach(var o in scenarioJumps.At(p))if(o.maxY>y+.025f&&o.minY<y+1.79f&&Contains(o,p.x,p.y,.27f))return false;}return true;}
    bool PrepareGroundsPatrol(){
        if(groundsPatrolSpawned)return true;float closest=float.PositiveInfinity;int candidate=-1;
        for(int i=0;i<manifest.escape.patrol.Length;i++){var p=XZ(manifest.escape.patrol[i]);float distance=Vector2.Distance(p,player);if(distance>12&&distance<closest&&OutsideClearAt(p,0)){candidate=i;closest=distance;}}
        if(candidate<0)return false;guardPatrol=candidate;guardPosition=XZ(manifest.escape.patrol[candidate]);ChangeGroundsMode(GroundsMode.Patrol,guardPosition);guardHeading=Mathf.PI;guardMemory=0;guardRevision=-1;groundsPatrolSpawned=true;groundsGuard.transform.position=World(guardPosition,0);return true;
    }
    void ChangeGroundsMode(GroundsMode next,Vector2 target){groundsMode=next;guardTarget=target;guardPath.Clear();guardRethink=guardStuck=guardWait=0;}
    void GroundsNoise(Vector2 point,float radius){if(groundsMode!=GroundsMode.Chase&&Vector2.Distance(guardPosition,point)<radius)ChangeGroundsMode(GroundsMode.Investigate,point);}
    List<Vector2> GroundsPath(Vector2 from,Vector2 to){
        const int minX=-132,minZ=-203,width=356,height=299;var start=new Vector2Int(Mathf.RoundToInt(from.x-minX),Mathf.RoundToInt(from.y-minZ));var end=new Vector2Int(Mathf.RoundToInt(to.x-minX),Mathf.RoundToInt(to.y-minZ));
        var result=new List<Vector2>();if(start.x<0||start.y<0||start.x>=width||start.y>=height||end.x<0||end.y<0||end.x>=width||end.y>=height)return result;
        int begin=start.y*width+start.x,finish=end.y*width+end.x;var previous=new int[width*height];Array.Fill(previous,-1);var queue=new Queue<int>();previous[begin]=begin;queue.Enqueue(begin);
        while(queue.Count>0){int n=queue.Dequeue();if(n==finish)break;int x=n%width,z=n/width;foreach(var d in new[]{Vector2Int.right,Vector2Int.left,Vector2Int.up,Vector2Int.down}){int nx=x+d.x,nz=z+d.y;if(nx<0||nz<0||nx>=width||nz>=height)continue;int next=nz*width+nx;if(previous[next]>=0)continue;bool clear=true;for(int i=0;i<=4;i++)if(!OutsideClearAt(new Vector2(minX+x+d.x*i/4f,minZ+z+d.y*i/4f),0)){clear=false;break;}if(!clear)continue;previous[next]=n;queue.Enqueue(next);}}
        if(previous[finish]<0)return result;for(int n=finish;n!=begin;n=previous[n])result.Add(new Vector2(minX+n%width,minZ+n/width));result.Reverse();return result;
    }
    void UpdateGroundsGuard(float dt){
        if(!escapeOutside||!PrepareGroundsPatrol()||elapsed<enemyReleaseAt)return;
        float distance=Vector2.Distance(player,guardPosition),facing=Vector2.Dot((player-guardPosition).normalized,new Vector2(Mathf.Sin(guardHeading),Mathf.Cos(guardHeading)));
        bool seen=distance<(crouching?12:27)&&(distance<2.5f||facing>.35f);
        if(seen)for(int i=1;i<Mathf.CeilToInt(distance/.35f);i++)if(!OutsideClearAt(Vector2.Lerp(guardPosition,player,i*.35f/distance),0)){seen=false;break;}
        if(seen){if(groundsMode!=GroundsMode.Chase)ChangeGroundsMode(GroundsMode.Chase,player);guardTarget=player;guardMemory=5;spotted=true;}
        else if(groundsMode==GroundsMode.Chase){guardMemory-=dt;if(guardMemory<=0)ChangeGroundsMode(GroundsMode.Investigate,guardTarget);}
        if(groundsMode==GroundsMode.Search){guardWait-=dt;guardHeading=guardSearchAngle+Mathf.Sin((6-guardWait)*1.2f)*1.25f;if(guardWait<=0)ChangeGroundsMode(GroundsMode.Return,XZ(manifest.escape.patrol[guardPatrol]));}
        else if(groundsMode==GroundsMode.Patrol&&guardWait>0)guardWait-=dt;
        else if(Vector2.Distance(guardPosition,guardTarget)<.65f){
            if(groundsMode==GroundsMode.Investigate||groundsMode==GroundsMode.Chase&&!seen){ChangeGroundsMode(GroundsMode.Search,guardPosition);guardWait=6;guardSearchAngle=guardHeading;}
            else if(groundsMode==GroundsMode.Return)ChangeGroundsMode(GroundsMode.Patrol,XZ(manifest.escape.patrol[guardPatrol]));
            else if(groundsMode==GroundsMode.Patrol){guardPatrol=(guardPatrol+1)%manifest.escape.patrol.Length;ChangeGroundsMode(GroundsMode.Patrol,XZ(manifest.escape.patrol[guardPatrol]));guardWait=2;}
        }else{
            guardRethink-=dt;if(guardRevision!=scenarioRevision){guardRevision=scenarioRevision;guardRethink=0;guardPath.Clear();}
            if(guardRethink<=0){guardRethink=groundsMode==GroundsMode.Chase?.8f:2;if(groundsMode==GroundsMode.Chase||guardPath.Count==0)guardPath=GroundsPath(guardPosition,guardTarget);
                if(guardPath.Count==0){if(groundsMode==GroundsMode.Patrol||groundsMode==GroundsMode.Return){guardPatrol=(guardPatrol+1)%manifest.escape.patrol.Length;ChangeGroundsMode(GroundsMode.Patrol,XZ(manifest.escape.patrol[guardPatrol]));guardWait=1;}else{ChangeGroundsMode(GroundsMode.Search,guardPosition);guardWait=6;guardSearchAngle=guardHeading;}}}
            if(guardPath.Count>0){var next=guardPath[0];var delta=Vector2.MoveTowards(guardPosition,next,dt*(groundsMode==GroundsMode.Chase?3.6f:groundsMode==GroundsMode.Investigate?2.8f:2.2f))-guardPosition;
                bool clear=OutsideClearAt(guardPosition+delta,0);if(clear)guardPosition+=delta;float moved=clear?delta.magnitude:0;groundsGuardPose.Update(moved,dt);
                if(delta.sqrMagnitude>.00001f)guardHeading=Mathf.Atan2(delta.x,delta.y);if(Vector2.Distance(guardPosition,next)<.15f)guardPath.RemoveAt(0);
                guardStuck=moved<.001f?guardStuck+dt:0;if(guardStuck>2){if(groundsMode==GroundsMode.Patrol){guardPatrol=(guardPatrol+1)%manifest.escape.patrol.Length;ChangeGroundsMode(GroundsMode.Patrol,XZ(manifest.escape.patrol[guardPatrol]));}else{ChangeGroundsMode(GroundsMode.Search,guardPosition);guardWait=6;guardSearchAngle=guardHeading;}}
            }
        }
        groundsGuard.transform.position=World(guardPosition,0);groundsGuard.transform.rotation=Quaternion.LookRotation(World(new Vector2(Mathf.Sin(guardHeading),Mathf.Cos(guardHeading)),0))*Quaternion.Euler(0,180,0);
        if(!seen&&(groundsMode==GroundsMode.Patrol||groundsMode==GroundsMode.Return))spotted=false;
        if(distance<.85f&&Mathf.Abs(playerY)<1.4f)Finish(false,"Grounds security");
    }
    void UpdateScenarioLights(){var lights=new List<Point>(manifest.escape.lamps);lights.Sort((a,b)=>(XZ(a)-player).sqrMagnitude.CompareTo((XZ(b)-player).sqrMagnitude));for(int i=0;i<lightPool.Length;i++){bool active=escapeOutside&&i<lights.Count&&Vector2.Distance(player,XZ(lights[i]))<18;lightPool[i].enabled=active;if(active){lightPool[i].transform.position=World(XZ(lights[i]),lights[i].y);lightPool[i].color=Color.white;lightPool[i].intensity=.8f;lightPool[i].range=12;}}}
}
