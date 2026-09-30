using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

public sealed partial class NativePrototypeGame
{
    public GameObject outdoorPrefab,indoorPrefab,guardPrefab;
    public TextAsset layoutText,manifestText;
    public Font worldFont;
    public long outdoorTriangles,indoorTriangles;public int outdoorBatches,indoorBatches;
    enum Mode { Title,Outside,Aerial,Arrival,Inside,Escape,Escaped,Caught }
    Mode mode=Mode.Title;Layout[] floors;Layout layout;Manifest manifest;
    GameObject outside,inside,portal,artRoot;Camera view;Light sun,torch;Light[] lightPool;
    Vector2 player,stickVector;int floor,periodIndex=8,fpsCap=60;
    float yaw,pitch,elapsed,hold,cinemaTime,stamina=1,lastStep,lastPulse,sensitivity=1.2f;
    float smoothedFrame=.0167f,displayedFPS=60,hudClock;
    bool paused,map,help,spotted,sprinting,crouching,crouchToggle,exhausted,stairLatch,diagnostics;
    bool initialized,automationMode,audioOn=true,lowGraphics,trees=true,night,useHeld,sprintHeld;
    string prompt="",status="",previousDiagnosis="";
    readonly Vector2 entrance=new Vector2(0,36);
    readonly HashSet<int> activeExits=new HashSet<int>();
    readonly Queue<float> timings=new Queue<float>();
    readonly List<Enemy> enemies=new List<Enemy>();
    WallArt viewingArt;Texture2D artworkTexture;AudioSource audioSource;AudioClip footstep,pulse;
    class Enemy
    {
        public string name;public int type,floor,patrol,targetFloor;public Vector2 position,target;
        public float memory,rethink;public GameObject model;public NativeGuardPose pose;
        public List<Waypoint> path=new List<Waypoint>();
    }
    void Awake(){Initialize();}
    void Initialize()
    {
        if(initialized)return;manifest=JsonUtility.FromJson<Manifest>(manifestText.text);layout=JsonUtility.FromJson<Layout>(layoutText.text);
        if(manifest.schema!=2)throw new Exception("Re-export full native assets.");floors=MakeFloors(layout);initialized=true;
        outside=Instantiate(outdoorPrefab);inside=Instantiate(indoorPrefab);
        view=new GameObject("Player view").AddComponent<Camera>();view.tag="MainCamera";view.fieldOfView=74;view.nearClipPlane=.08f;view.allowHDR=false;view.clearFlags=CameraClearFlags.SolidColor;
        sun=new GameObject("Sun").AddComponent<Light>();sun.type=LightType.Directional;sun.transform.rotation=Quaternion.Euler(48,-38,0);sun.shadows=LightShadows.None;
        torch=new GameObject("Torch").AddComponent<Light>();torch.transform.SetParent(view.transform,false);torch.type=LightType.Spot;torch.range=30;torch.spotAngle=58;torch.intensity=1.5f;torch.color=new Color(1,.94f,.8f);
        lightPool=new Light[12];for(int i=0;i<12;i++){var l=new GameObject("Corridor light").AddComponent<Light>();l.type=LightType.Point;l.range=9;l.intensity=.7f;lightPool[i]=l;}
        RenderSettings.ambientMode=AmbientMode.Flat;fpsCap=PlayerPrefs.GetInt("fps",60);audioOn=PlayerPrefs.GetInt("audio",1)==1;sensitivity=PlayerPrefs.GetFloat("sensitivity",1.2f);
        Application.targetFrameRate=fpsCap;QualitySettings.vSyncCount=0;QualitySettings.pixelLightCount=3;QualitySettings.shadows=ShadowQuality.Disable;QualitySettings.antiAliasing=2;
        lowGraphics=PlayerPrefs.GetInt("graphics",0)==1;if(Application.isMobilePlatform)ApplyGraphics();
        Input.simulateMouseWithTouches=false;pixel=new Texture2D(1,1);pixel.SetPixel(0,0,Color.white);pixel.Apply();
        portal=Marker("Enter asylum",World(entrance,.24f),mint,1.5f);
        var candidates=new List<int>();for(int i=0;i<14;i++)candidates.Add(i);
        for(int i=0;i<5;i++){int n=UnityEngine.Random.Range(0,candidates.Count);activeExits.Add(candidates[n]);candidates.RemoveAt(n);}
        InitializeEstate();InitializeInterior();InitializeSigns();InitializeNight();InitializeSound();
        foreach(var root in new[]{outside,inside})foreach(var filter in root.GetComponentsInChildren<MeshFilter>(true))if(filter.sharedMesh.isReadable)filter.sharedMesh.UploadMeshData(true);
        foreach(var source in layout.enemies){var model=source.type==1?Instantiate(guardPrefab):CreateGhost();enemies.Add(new Enemy{name=source.name,type=source.type,model=model,pose=source.type==1?new NativeGuardPose(model):null});}
        Home();var args=Environment.GetCommandLineArgs();for(int i=0;i<args.Length;i++)if(args[i]=="--prototype-smoke"){automationMode=true;Application.runInBackground=true;StartCoroutine(Smoke(i+1<args.Length?args[i+1]:"native-smoke"));}
    }
    GameObject Marker(string name,Vector3 position,Color color,float size)
    {
        var body=GameObject.CreatePrimitive(PrimitiveType.Cylinder);body.name=name;body.transform.position=position;body.transform.localScale=new Vector3(size,.022f,size);Destroy(body.GetComponent<Collider>());
        var m=new Material(Shader.Find("Escape1829/NativeSurface"));m.color=color;m.SetColor("_EmissionColor",color*.4f);body.GetComponent<Renderer>().material=m;return body;
    }
    void ResetInput(){paused=map=help=locationsOpen=false;stickVector=Vector2.zero;stickFinger=lookFinger=listFinger=-1;hold=0;stairLatch=false;useHeld=sprintHeld=false;viewingArt=null;ReleaseArchiveTexture(ref artworkTexture);CloseBuilding();timings.Clear();}
    void Home(){ResetInput();mode=Mode.Title;inside.SetActive(false);artRoot.SetActive(false);outside.SetActive(true);portal.SetActive(false);foreach(var e in enemies)e.model.SetActive(false);SetLighting(false);UnlockMouse();orbitTarget=new Vector3(90,8,15);orbitDistance=330;orbitYaw=190;orbitPitch=48;UpdateOrbit(0);}
    public void StartOutside(){mode=Mode.Outside;ResetInput();elapsed=0;player=new Vector2(0,40);yaw=pitch=0;outside.SetActive(true);portal.SetActive(true);inside.SetActive(false);artRoot.SetActive(false);foreach(var e in enemies)e.model.SetActive(false);SetLighting(false);PositionView();LockMouse();}
    void StartAerial(){mode=Mode.Aerial;ResetInput();outside.SetActive(true);inside.SetActive(false);artRoot.SetActive(false);portal.SetActive(false);foreach(var e in enemies)e.model.SetActive(false);SetLighting(false);orbitTarget=new Vector3(200,8,10);orbitDistance=500;orbitPitch=52;orbitYaw=200;UpdateOrbit(0);UnlockMouse();}
    void StartArrival(){StartOutside();mode=Mode.Arrival;cinemaTime=0;UnlockMouse();}
    public void StartInside()
    {
        mode=Mode.Inside;ResetInput();floor=0;layout=floors[0];elapsed=hold=0;stamina=1;spotted=exhausted=crouchToggle=false;player=Position(layout.spawn,layout);yaw=layout.spawn.yaw;pitch=0;stairLatch=false;lastStep=lastPulse=0;
        outside.SetActive(false);portal.SetActive(false);inside.SetActive(true);artRoot.SetActive(true);ShowFloor();
        var placed=new List<Vector2>();foreach(var e in enemies){
            var choices=new List<Vector2>();for(int z=0;z<layout.height;z++)for(int x=0;x<layout.width;x++){
                var p=new Vector2(x*layout.cellSize,z*layout.cellSize);if(!IndoorClear(layout,p.x,p.y,.5f)||Vector2.Distance(p,player)<12||FindPath(layout,player,p).Count==0)continue;
                bool clear=true;foreach(var exit in layout.exits)if(Vector2.Distance(p,Position(exit,layout))<2.7f)clear=false;foreach(var s in layout.stairs)if(Vector2.Distance(p,Position(s,layout))<1.4f)clear=false;foreach(var q in placed)if(Vector2.Distance(p,q)<5)clear=false;if(clear)choices.Add(p);
            }
            e.position=choices.Count>0?choices[UnityEngine.Random.Range(0,choices.Count)]:Position(layout.patrol[0],layout);placed.Add(e.position);e.floor=0;e.memory=e.rethink=0;e.path.Clear();e.patrol=0;e.model.SetActive(true);e.pose?.Reset();PositionEnemy(e);
        }SetLighting(true);PositionView();LockMouse();
    }
    void ShowFloor(){layout=floors[floor];UpdateInteriorVisibility();UpdateSigns();lightClock=0;foreach(var e in enemies)e.model.SetActive(e.floor==floor);}
    void SetLighting(bool indoors)
    {
        sun.enabled=!indoors;sun.intensity=night?.08f:1.1f;torch.enabled=indoors||night;RenderSettings.ambientLight=indoors?new Color(.29f,.31f,.29f):night?new Color(.075f,.09f,.12f):new Color(.58f,.62f,.62f);
        view.backgroundColor=indoors?new Color(.07f,.085f,.07f):night?new Color(.015f,.025f,.045f):new Color(.54f,.65f,.68f);RenderSettings.fog=true;RenderSettings.fogMode=FogMode.ExponentialSquared;RenderSettings.fogColor=view.backgroundColor;RenderSettings.fogDensity=indoors?.014f:night?.002f:.0011f;
        foreach(var l in lightPool){l.enabled=indoors;l.color=Color.white;l.range=9;l.intensity=.7f;}nightClock=0;UpdateNight();view.farClipPlane=indoors?150:mode==Mode.Outside?350:1800;
    }
    void LockMouse(){if(!Application.isMobilePlatform&&!automationMode){Cursor.lockState=CursorLockMode.Locked;Cursor.visible=false;}}
    void UnlockMouse(){Cursor.lockState=CursorLockMode.None;Cursor.visible=true;}
    void PositionView(){float y=mode==Mode.Inside?floor*manifest.floorHeight+(crouching?1.1f:1.65f):1.7f;if(mode==Mode.Outside)foreach(var s in manifest.periods[periodIndex].walkSurfaces)if(Contains(s,player.x,player.y,.00001f)){y+=s.height-s.grade;break;}view.transform.position=World(player,y);view.transform.rotation=Quaternion.Euler(-pitch*Mathf.Rad2Deg,-yaw*Mathf.Rad2Deg,0);}
    void Update()
    {
        if(!initialized)return;SetUIScale();TouchInput();float dt=Mathf.Min(Time.unscaledDeltaTime,.08f);smoothedFrame=Mathf.Lerp(smoothedFrame,Time.unscaledDeltaTime,.08f);hudClock+=Time.unscaledDeltaTime;if(hudClock>.3f){displayedFPS=1/Mathf.Max(.001f,smoothedFrame);hudClock=0;}
        if(Input.GetKeyDown(KeyCode.Escape)){if(selectedBuilding>=0)CloseBuilding();else if(help)help=false;else if(mode!=Mode.Title)TogglePause();}
        UpdateEstateLOD();UpdateNight();if(mode==Mode.Title){if(!paused)UpdateOrbit(dt*.04f);return;}if(mode==Mode.Arrival||mode==Mode.Escape){UpdateCinema(dt);return;}if(mode==Mode.Escaped||mode==Mode.Caught||paused||help||locationsOpen||selectedBuilding>=0)return;
        if(Input.GetKeyDown(KeyCode.Tab)||Input.GetKeyDown(KeyCode.M)){map=!map;if(map)UnlockMouse();else LockMouse();}if(Input.GetKeyDown(KeyCode.H)){help=true;UnlockMouse();return;}if(Input.GetKeyDown(KeyCode.F3))diagnostics=!diagnostics;if(Input.GetKeyDown(KeyCode.F))torch.enabled=!torch.enabled;if(Input.GetKeyDown(KeyCode.T)){trees=!trees;RefreshEstateVisibility();}
        if(mode==Mode.Aerial){UpdateAerialInput(dt);return;}bool use=useHeld||Input.GetKey(KeyCode.E);if(viewingArt!=null){if(!use){viewingArt=null;ReleaseArchiveTexture(ref artworkTexture);}return;}
        elapsed+=dt;timings.Enqueue(Time.unscaledDeltaTime);if(timings.Count>300)timings.Dequeue();var movement=stickVector+new Vector2((Input.GetKey(KeyCode.D)?1:0)-(Input.GetKey(KeyCode.A)?1:0),(Input.GetKey(KeyCode.W)?1:0)-(Input.GetKey(KeyCode.S)?1:0));if(movement.sqrMagnitude>1)movement.Normalize();
        crouching=mode==Mode.Inside&&(crouchToggle||Input.GetKey(KeyCode.C)||Input.GetKey(KeyCode.LeftControl));if(stamina<.02f)exhausted=true;if(stamina>.25f)exhausted=false;sprinting=(sprintHeld||Input.GetKey(KeyCode.LeftShift))&&movement.sqrMagnitude>.001f&&!crouching&&!exhausted;if(mode==Mode.Inside)stamina=Mathf.Clamp01(stamina+dt*(sprinting?-.19f:.115f));
        if(!map){if(!Application.isMobilePlatform&&Cursor.lockState==CursorLockMode.Locked){yaw-=Input.GetAxisRaw("Mouse X")*.025f*sensitivity;pitch=Mathf.Clamp(pitch+Input.GetAxisRaw("Mouse Y")*.022f*sensitivity,-1.25f,1.25f);}Walk(movement,dt,sprinting);}
        PositionView();if(mode==Mode.Inside){StepInside(dt,use);if(mode!=Mode.Inside)return;}Interact(dt,use);
        if(mode==Mode.Inside&&movement.sqrMagnitude>.01f&&!crouching&&elapsed-lastStep>(sprinting?.30f:.48f)){PlaySound(footstep,sprinting?.08f:.035f);lastStep=elapsed;}if(mode==Mode.Outside&&Input.GetMouseButtonDown(0)&&!PointerOverControls(UIPosition(Input.mousePosition)))PickBuilding(Input.mousePosition);
    }
    public void Walk(Vector2 input,float dt,bool sprint){float speed=mode==Mode.Inside?(crouching?1.6f:sprint?5.8f:3.1f):(sprint?7.2f:4.2f);var step=new Vector2(Mathf.Cos(yaw)*input.x-Mathf.Sin(yaw)*input.y,-Mathf.Sin(yaw)*input.x-Mathf.Cos(yaw)*input.y)*dt*speed;int n=Mathf.Max(1,Mathf.CeilToInt(step.magnitude/.12f));step/=n;for(int i=0;i<n;i++){if(Clear(player.x+step.x,player.y))player.x+=step.x;if(Clear(player.x,player.y+step.y))player.y+=step.y;}}
    bool Clear(float x,float z)=>mode==Mode.Inside?IndoorClear(layout,x,z):OutdoorClear(manifest,x,z,periodIndex,trees);
    void StepInside(float dt,bool use){UpdateInteriorLights();if(!use)UpdateEnemies(dt);}
    Stair NearStair(Vector2 p,int f){foreach(var s in floors[f].stairs)if(Vector2.Distance(p,Position(s,floors[f]))<1.4f)return s;return null;}
    public bool ChangeFloor(Stair stair){if(stair==null||NearStair(player,floor)!=stair)return false;var at=Position(stair,floors[1-floor]);if(!IndoorClear(floors[1-floor],at.x,at.y))return false;floor=1-floor;player=at;ShowFloor();PositionView();foreach(var e in enemies)if(e.memory>0||e.type==2){e.target=player;e.targetFloor=floor;e.rethink=0;}return true;}
    void UpdateEnemies(float dt)
    {
        float nearest=99;foreach(var e in enemies){bool same=e.floor==floor;float distance=Vector2.Distance(player,e.position);e.model.SetActive(same);if(same)nearest=Mathf.Min(nearest,distance);if(elapsed<5)continue;bool seen=same&&distance<(crouching?8:e.type==1?22:16)&&LineOfSight(floors[e.floor],e.position,player);if(seen)spotted=true;
            if(seen||e.type==2){e.target=player;e.targetFloor=floor;e.memory=5;}else e.memory=Mathf.Max(0,e.memory-dt);e.rethink-=dt;if(e.rethink<=0){e.rethink=.45f;if(e.memory<=0&&(e.path.Count==0||Vector2.Distance(e.position,e.target)<1)){var route=floors[e.floor].patrol;e.target=Position(route[e.patrol++%route.Length],floors[e.floor]);e.targetFloor=e.floor;}e.path=RouteBetweenFloors(floors,e.position,e.floor,e.target,e.targetFloor);}
            float speed=e.type==1?(e.memory>0?3.85f:2.4f):2.2f;if(same&&e.type==2&&torch.enabled&&distance<23&&LineOfSight(layout,player,e.position)){var toward=(World(e.position,view.transform.position.y)-view.transform.position).normalized;if(Vector3.Dot(view.transform.forward,toward)>.88f)speed=.55f;}
            var previous=e.position;int oldFloor=e.floor;if(e.path.Count>0){var target=e.path[0];if(target.floor!=e.floor){if(NearStair(e.position,e.floor)!=null){e.floor=target.floor;e.position=target.position;e.path.RemoveAt(0);}else e.path.Clear();}else{var travel=target.position-e.position;if(travel.sqrMagnitude>.000001f)e.model.transform.rotation=Quaternion.LookRotation(new Vector3(travel.x,0,-travel.y))*Quaternion.Euler(0,180,0);e.position=Vector2.MoveTowards(e.position,target.position,speed*dt);if(Vector2.Distance(e.position,target.position)<.08f)e.path.RemoveAt(0);}}
            e.pose?.Update(e.floor==oldFloor?Vector2.Distance(previous,e.position):0,dt);PositionEnemy(e);if(e.floor==floor&&Vector2.Distance(e.position,player)<.8f){Finish(false,e.name);return;}
        }bool far=true;foreach(var e in enemies)if(Mathf.Sqrt((e.position-player).sqrMagnitude+Mathf.Pow((e.floor-floor)*manifest.floorHeight,2))<26)far=false;if(far)spotted=false;if(nearest<15&&elapsed-lastPulse>Mathf.Lerp(.35f,1.2f,Mathf.Clamp01(nearest/15))){PlaySound(pulse,.1f*(1-nearest/18));lastPulse=elapsed;}
    }
    void PositionEnemy(Enemy e){e.model.transform.position=World(e.position,e.floor*manifest.floorHeight+(e.type==2?Mathf.Sin(elapsed*2)*.11f:0));e.model.SetActive(e.floor==floor&&mode==Mode.Inside);}
    void Interact(float dt,bool use)
    {
        prompt="";if(!use)stairLatch=false;if(mode==Mode.Outside){if(Vector2.Distance(player,entrance)<3.3f){prompt="Hold USE to enter the asylum";hold=use?hold+dt:0;if(hold>=.5f)StartInside();}else hold=0;return;}if(mode!=Mode.Inside)return;
        var stair=NearStair(player,floor);if(stair!=null){prompt="Hold USE to go "+(floor==0?"UP":"DOWN")+": "+stair.name;hold=use&&!stairLatch?hold+dt:0;if(hold>=.5f&&ChangeFloor(stair)){hold=0;stairLatch=true;}return;}
        foreach(var art in manifest.wallArt){if(art.floor!=floor||Vector2.Distance(player,new Vector2(art.x,art.z))>2.3f)continue;var toward=new Vector2(art.x,art.z)-player;if(Vector2.Dot(new Vector2(-Mathf.Sin(yaw),-Mathf.Cos(yaw)),toward.normalized)<.05f)continue;prompt="Hold USE to view artwork";hold=0;if(use){viewingArt=art;artworkTexture=LoadArchive(manifest.art[art.index].src);}return;}
        for(int i=0;i<layout.exits.Length;i++){if(!activeExits.Contains(floor*7+i)||Vector2.Distance(player,Position(layout.exits[i],layout))>=2.7f)continue;prompt="Hold USE to escape: "+layout.exits[i].name;hold=use&&!stairLatch?hold+dt:0;if(hold>=.5f)Finish(true,layout.exits[i].name);return;}hold=0;
    }
    void Finish(bool won,string who)
    {
        if(won){status="You escaped through "+who+" in "+elapsed.ToString("F1")+" seconds.";mode=Mode.Escape;cinemaTime=0;inside.SetActive(false);artRoot.SetActive(false);outside.SetActive(true);portal.SetActive(false);SetLighting(false);}else{var choices=new List<Diagnosis>();foreach(var d in manifest.diagnoses)if(d.name!=previousDiagnosis)choices.Add(d);var dgn=choices[UnityEngine.Random.Range(0,choices.Count)];var cause=manifest.causes[UnityEngine.Random.Range(0,manifest.causes.Length)];previousDiagnosis=dgn.name;status=who+" caught you.\n\nDiagnosis: "+dgn.name+"\nTreatment: "+dgn.treatment+"\n\nSupposed cause: "+cause.name+" — "+cause.description;mode=Mode.Caught;}
        ResetInput();foreach(var e in enemies)e.model.SetActive(false);UnlockMouse();
    }
    void UpdateCinema(float dt){cinemaTime+=dt;if(mode==Mode.Arrival){float t=Mathf.SmoothStep(0,1,cinemaTime/2);view.transform.position=Vector3.Lerp(new Vector3(0,2.5f,-42),new Vector3(0,1.7f,-31),t);view.transform.LookAt(new Vector3(0,3.5f,-19.8f));if(cinemaTime>=2)StartInside();}else{float t=Mathf.Clamp01(cinemaTime/7);view.transform.position=Vector3.Lerp(new Vector3(0,3,-38),new Vector3(65,65,-110),Mathf.SmoothStep(0,1,t));view.transform.LookAt(new Vector3(0,10,-19.8f));if(cinemaTime>=7)mode=Mode.Escaped;}}
    void TogglePause(){paused=!paused;stickVector=Vector2.zero;stickFinger=lookFinger=-1;useHeld=sprintHeld=false;if(paused)UnlockMouse();else if(mode==Mode.Outside||mode==Mode.Inside)LockMouse();}
    void OnApplicationPause(bool background){if(!automationMode&&background&&mode!=Mode.Title&&!paused)TogglePause();}
    void OnApplicationFocus(bool focus){if(!automationMode&&!focus&&mode!=Mode.Title&&!paused)TogglePause();}
    void InitializeSound(){audioSource=gameObject.AddComponent<AudioSource>();footstep=Tone(95,.11f);pulse=Tone(52,.18f);}
    AudioClip Tone(float hz,float seconds){int n=Mathf.RoundToInt(seconds*22050);var samples=new float[n];float phase=0;for(int i=0;i<n;i++){float t=(float)i/n;phase+=2*Mathf.PI*hz*Mathf.Pow(.5f,t)/22050;samples[i]=Mathf.Sin(phase)*Mathf.Exp(-t*5);}var clip=AudioClip.Create("Asylum ambience",n,1,22050,false);clip.SetData(samples,0);return clip;}
    void PlaySound(AudioClip clip,float volume){if(audioOn)audioSource.PlayOneShot(clip,volume);}
    GameObject CreateGhost(){var root=new GameObject("Deva asylum ghost");var coat=new Material(Shader.Find("Escape1829/NativeSurface"));coat.color=new Color(.34f,.48f,.43f,.68f);coat.SetColor("_EmissionColor",new Color(.15f,.32f,.25f));coat.SetInt("_SrcBlend",5);coat.SetInt("_DstBlend",10);coat.SetInt("_ZWrite",0);coat.renderQueue=3000;void Part(PrimitiveType shape,Vector3 p,Vector3 scale,Material m){var o=GameObject.CreatePrimitive(shape);o.transform.SetParent(root.transform,false);o.transform.localPosition=p;o.transform.localScale=scale;o.GetComponent<Renderer>().material=m;Destroy(o.GetComponent<Collider>());}Part(PrimitiveType.Cylinder,new Vector3(0,1.05f,0),new Vector3(.6f,.56f,.6f),coat);Part(PrimitiveType.Sphere,new Vector3(0,1.86f,0),Vector3.one*.42f,coat);for(int s=-1;s<=1;s+=2)Part(PrimitiveType.Cube,new Vector3(s*.34f,1.2f,0),new Vector3(.14f,.72f,.17f),coat);var eye=new Material(Shader.Find("Escape1829/NativeSurface"));eye.color=Color.white;eye.SetColor("_EmissionColor",new Color(.6f,1,.85f)*2);for(int s=-1;s<=1;s+=2)Part(PrimitiveType.Sphere,new Vector3(s*.074f,1.89f,-.185f),Vector3.one*.07f,eye);return root;}
    float lightClock;int lightsFloor=-1;readonly List<Vector2> fixturePositions=new List<Vector2>();
    void UpdateInteriorLights(){lightClock-=Time.unscaledDeltaTime;if(lightClock>0)return;lightClock=.15f;if(lightsFloor!=floor){lightsFloor=floor;fixturePositions.Clear();for(int z=0;z<layout.height;z++)for(int x=0;x<layout.width;x++)if(layout.cells[z*layout.width+x]==1&&((z==layout.galleryZ&&x%4==0)||(z%4==0&&x%4==0)))fixturePositions.Add(new Vector2(x*layout.cellSize,z*layout.cellSize));}fixturePositions.Sort((a,b)=>(a-player).sqrMagnitude.CompareTo((b-player).sqrMagnitude));for(int i=0;i<lightPool.Length;i++){bool active=i<fixturePositions.Count&&Vector2.Distance(fixturePositions[i],player)<28;lightPool[i].enabled=active;if(active)lightPool[i].transform.position=World(fixturePositions[i],floor*manifest.floorHeight+2.9f);}}
}
