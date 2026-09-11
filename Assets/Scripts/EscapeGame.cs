using System.Collections.Generic;
using UnityEngine;

public class EscapeGame : MonoBehaviour
{
    class WallArtDisplay { public Texture2D texture; public Vector3 position, normal; public string title; }
    struct WallSurface { public Vector3 position, normal; public WallSurface(Vector3 p, Vector3 n) { position=p; normal=n; } }
    public static EscapeGame Instance;
    public BuildingLayout Layout { get; private set; }
    public Transform Player { get; private set; }
    public Camera View { get; private set; }
    public bool Playing => state == 1 && !paused;
    public bool TorchOn => torch.enabled;
    public bool Sprinting { get; private set; }
    public bool Crouching { get; private set; }
    public bool HoldingUse => Input.GetKey(KeyCode.E);
    public float Noise => Sprinting ? 22 : Crouching ? 2 : moving ? 7 : 0;
    public float Elapsed { get; private set; }
    CharacterController controller;
    Light torch;
    AudioSource audioSource;
    AudioClip stepClip, pulseClip;
    readonly List<Pursuer> enemies = new List<Pursuer>();
    readonly List<WallArtDisplay> wallArt = new List<WallArtDisplay>();
    WallArtDisplay viewedArt;
    int state; // 0 title, 1 playing, 2 escaped, 3 captured
    bool paused, map, moving;
    float pitch, stamina = 1, exitHold, threat, stepClock, pulseClock;
    public float sensitivity = 2;
    string result = "", prompt = "";
    GUIStyle small, heading, title, button;
    Texture2D white;
    readonly Color ink = new Color(.035f, .055f, .053f, .96f);
    readonly Color mint = new Color(.64f, .88f, .74f);
    public static Material Material(string name, Color color)
    {
        var m = new Material(Shader.Find("Standard")); m.name = name; m.color = color; return m;
    }
    void Awake()
    {
        Instance = this;
        var data = Resources.Load<TextAsset>("layout");
        if (!data) { Debug.LogError("Missing generated layout.json. Run Tools/create_level.py in Blender."); enabled = false; return; }
        Layout = JsonUtility.FromJson<BuildingLayout>(data.text);
        RenderSettings.ambientLight = new Color(.19f,.23f,.22f);
        RenderSettings.fog = true; RenderSettings.fogColor = new Color(.025f,.04f,.038f);
        RenderSettings.fogMode = FogMode.ExponentialSquared; RenderSettings.fogDensity = .016f;
        QualitySettings.pixelLightCount = 6;
        BuildLevel(); BuildPlayer(); BuildEnemies();
        audioSource = gameObject.AddComponent<AudioSource>(); audioSource.volume = .28f;
        stepClip = Tone("Footstep", 85, .1f); pulseClip = Tone("Heartbeat", 48, .19f);
        Cursor.lockState = CursorLockMode.None; Cursor.visible = true;
    }
    AudioClip Tone(string name, float hz, float length)
    {
        int count = (int)(22050 * length); var values = new float[count];
        var random = new System.Random(1829);
        for (int i=0;i<count;i++) values[i] = (Mathf.Sin(i * hz * 2 * Mathf.PI / 22050) * .75f + ((float)random.NextDouble()-.5f)*.2f) * Mathf.Pow(1f-i/(float)count,2);
        var clip = AudioClip.Create(name,count,1,22050,false); clip.SetData(values,0); return clip;
    }
    void BuildLevel()
    {
        var model = Resources.Load<GameObject>("1829-Level");
        if (model) Instantiate(model, Vector3.zero, Quaternion.identity).name = "Blender architecture";
        var walls = new GameObject("Grid collision");
        for (int z=0; z<Layout.height; z++) for(int x=0; x<Layout.width; x++)
        {
            if (!Layout.Open(x,z)) continue;
            Vector3 p = Layout.World(x,z); float s=Layout.cellSize;
            ColliderBox(walls.transform, p + Vector3.down*.15f, new Vector3(s,.3f,s));
            int[] dx={1,-1,0,0}, dz={0,0,1,-1};
            for(int d=0;d<4;d++) if(!Layout.Open(x+dx[d],z+dz[d]))
                ColliderBox(walls.transform,p+new Vector3(dx[d]*s*.5f,1.8f,dz[d]*s*.5f),new Vector3(dx[d]!=0?.2f:s,3.6f,dz[d]!=0?.2f:s));
            if (!model)
            {
                Primitive("Floor",PrimitiveType.Cube,p+Vector3.down*.15f,new Vector3(s,.3f,s),new Color(.2f,.23f,.19f));
                for(int d=0;d<4;d++) if(!Layout.Open(x+dx[d],z+dz[d]))
                    Primitive("Wall",PrimitiveType.Cube,p+new Vector3(dx[d]*s*.5f,1.8f,dz[d]*s*.5f),new Vector3(dx[d]!=0?.2f:s,3.6f,dz[d]!=0?.2f:s),new Color(.38f,.42f,.37f));
            }
        }
        // Regular pools of warm light in the galleries; cold light marks exits.
        for (int x=8;x<=32;x+=4) Lamp(Layout.World(x,16)+Vector3.up*3, new Color(1,.73f,.42f),1.7f,11);
        foreach(int x in new[]{8,20,32}) for(int z=5;z<=27;z+=6)
            if(Layout.Open(x,z)) Lamp(Layout.World(x,z)+Vector3.up*3,new Color(.65f,.8f,.73f),1.4f,10);
        RoomSign("NECS Office",Layout.World(8,6)+Vector3.up*2.7f);
        RoomSign("Library",Layout.World(32,6)+Vector3.up*2.7f);
        RoomSign("MLCSU Office",Layout.World(8,13)+Vector3.up*2.7f);
        RoomSign("Reception",Layout.World(20,14)+Vector3.up*2.7f);
        RoomSign("NHS England office",Layout.World(32,13)+Vector3.up*2.7f);
        RoomSign("Snug",Layout.World(8,23)+Vector3.up*2.7f);
        RoomSign("Arden and GEM office",Layout.World(32,23)+Vector3.up*2.7f);
        BuildWallArt();
        for(int i=0;i<Layout.exits.Length;i++)
        {
            var e=Layout.exits[i]; Vector3 p=Layout.World(e.x,e.z);
            Lamp(p+Vector3.up*2.7f,new Color(.15f,1,.48f),2.4f,7);
            var sign = new GameObject("Exit sign "+(i+1)); sign.transform.position=p+new Vector3(0,2.8f,e.z==4?-.5f:.5f);
            sign.transform.rotation=Quaternion.Euler(0,e.z==4?180:0,0);
            var text=sign.AddComponent<TextMesh>(); text.text="EXIT  "+(i+1)+"\n"+e.name; text.fontSize=48; text.characterSize=.055f; text.anchor=TextAnchor.MiddleCenter; text.alignment=TextAlignment.Center; text.color=new Color(.55f,1,.7f);
        }
    }
    void RoomSign(string name,Vector3 position)
    {
        var sign=new GameObject("Room label - "+name); sign.transform.position=position+Vector3.up*.05f;
        var plaque=Primitive("Room plaque",PrimitiveType.Cube,sign.transform.position+Vector3.back*.035f,new Vector3(name.Length>16?2.35f:1.8f,.38f,.06f),new Color(.075f,.17f,.12f)); plaque.transform.SetParent(sign.transform,true);
        var text=sign.AddComponent<TextMesh>(); text.text=name; text.fontSize=48; text.characterSize=.045f; text.anchor=TextAnchor.MiddleCenter; text.alignment=TextAlignment.Center; text.color=new Color(.82f,.95f,.75f);
    }
    void ColliderBox(Transform root,Vector3 p,Vector3 size)
    {
        var obj=new GameObject("Solid"); obj.transform.SetParent(root); obj.transform.position=p;
        obj.AddComponent<BoxCollider>().size=size;
    }
    public static GameObject Primitive(string name,PrimitiveType type,Vector3 p,Vector3 size,Color color)
    {
        var g=GameObject.CreatePrimitive(type); g.name=name; g.transform.position=p; g.transform.localScale=size;
        g.GetComponent<Renderer>().sharedMaterial=Material(name,color); Destroy(g.GetComponent<Collider>()); return g;
    }
    void Lamp(Vector3 position,Color color,float intensity,float range)
    {
        var g=new GameObject("Gallery lamp"); g.transform.position=position;
        var l=g.AddComponent<Light>(); l.type=LightType.Point; l.color=color; l.intensity=intensity; l.range=range;
    }
    void BuildWallArt()
    {
        var textures=Resources.LoadAll<Texture2D>("art"); if(textures==null||textures.Length==0)return;
        var surfaces=new List<WallSurface>(); int[] dx={1,-1,0,0}, dz={0,0,1,-1};
        for(int z=0;z<Layout.height;z++)for(int x=0;x<Layout.width;x++)if(Layout.Open(x,z))
        {
            Vector3 cell=Layout.World(x,z); for(int d=0;d<4;d++)if(!Layout.Open(x+dx[d],z+dz[d]))
            {
                Vector3 outward=new Vector3(dx[d],0,dz[d]);
                surfaces.Add(new WallSurface(cell+outward*(Layout.cellSize*.5f-.07f)+Vector3.up*1.88f,-outward));
            }
        }
        if(surfaces.Count==0)return;
        int count=Mathf.Min(14,surfaces.Count), step=Mathf.Max(1,surfaces.Count/count);
        for(int i=0;i<count;i++)
        {
            WallSurface s=surfaces[(i*step)%surfaces.Count]; Texture2D texture=textures[i%textures.Length];
            var panel=GameObject.CreatePrimitive(PrimitiveType.Quad); panel.name="Wall art - "+texture.name; panel.transform.position=s.position;
            panel.transform.rotation=Quaternion.Euler(0,Mathf.Atan2(s.normal.x,s.normal.z)*Mathf.Rad2Deg,0); panel.transform.localScale=new Vector3(1.48f,1.02f,1);
            var renderer=panel.GetComponent<Renderer>(); var material=new Material(Shader.Find("Unlit/Texture")); material.mainTexture=texture; renderer.sharedMaterial=material;
            Destroy(panel.GetComponent<Collider>()); wallArt.Add(new WallArtDisplay{texture=texture,position=s.position,normal=s.normal,title=texture.name});
        }
    }
    void BuildPlayer()
    {
        var g=new GameObject("Player"); Player=g.transform; Player.position=Layout.World(Layout.spawn.x,Layout.spawn.z)+Vector3.up*.05f;
        controller=g.AddComponent<CharacterController>(); controller.height=1.75f; controller.radius=.28f; controller.center=Vector3.up*.9f; controller.stepOffset=.25f;
        var c=new GameObject("Player camera"); c.transform.SetParent(Player,false); c.transform.localPosition=Vector3.up*1.65f;
        View=c.AddComponent<Camera>(); View.fieldOfView=75; View.nearClipPlane=.05f; View.farClipPlane=140; View.backgroundColor=RenderSettings.fogColor; View.clearFlags=CameraClearFlags.SolidColor;
        c.AddComponent<AudioListener>();
        torch=c.AddComponent<Light>(); torch.type=LightType.Spot; torch.spotAngle=65; torch.range=27; torch.intensity=3.3f; torch.color=new Color(1,.91f,.73f); torch.shadows=LightShadows.Soft;
    }
    void BuildEnemies()
    {
        int[] xs={8,32,20}, zs={9,23,21}; string[] names={"Sylvia","Security","Deva asylum ghost"};
        for(int i=0;i<3;i++)
        {
            var g=new GameObject(names[i]); g.transform.position=Layout.World(xs[i],zs[i]);
            var enemy=g.AddComponent<Pursuer>(); enemy.Configure(this,i); enemies.Add(enemy);
        }
    }
    public void StartRun()
    {
        controller.enabled=false; Player.position=Layout.World(Layout.spawn.x,Layout.spawn.z)+Vector3.up*.05f; Player.rotation=Quaternion.identity; controller.enabled=true;
        pitch=0; View.transform.localRotation=Quaternion.identity; stamina=1; Elapsed=0; exitHold=0; state=1; paused=false; map=false; viewedArt=null; torch.enabled=true;
        foreach(var e in enemies)e.ResetPursuit(); LockCursor(true);
    }
    void LockCursor(bool locked) { Cursor.lockState=locked?CursorLockMode.Locked:CursorLockMode.None; Cursor.visible=!locked; }
    void OnApplicationFocus(bool focus) { if(!focus && state==1) {paused=true; LockCursor(false);} }
    void Update()
    {
        if(state!=1)return;
        if(viewedArt!=null){if(!HoldingUse)viewedArt=null;else return;}
        if(Input.GetKeyDown(KeyCode.Escape)){paused=!paused; LockCursor(!paused);}
        if(!Playing)return;
        Elapsed+=Time.deltaTime;
        if(Input.GetKeyDown(KeyCode.Tab))map=!map;
        if(Input.GetKeyDown(KeyCode.F))torch.enabled=!torch.enabled;
        Player.Rotate(0,Input.GetAxisRaw("Mouse X")*sensitivity,0);
        pitch=Mathf.Clamp(pitch-Input.GetAxisRaw("Mouse Y")*sensitivity,-80,80); View.transform.localRotation=Quaternion.Euler(pitch,0,0);
        float x=(Input.GetKey(KeyCode.D)?1:0)-(Input.GetKey(KeyCode.A)?1:0);
        float z=(Input.GetKey(KeyCode.W)?1:0)-(Input.GetKey(KeyCode.S)?1:0);
        moving=x!=0||z!=0; Crouching=Input.GetKey(KeyCode.LeftControl)||Input.GetKey(KeyCode.C);
        Sprinting=Input.GetKey(KeyCode.LeftShift)&&moving&&!Crouching&&stamina>.025f;
        stamina=Mathf.Clamp01(stamina+Time.deltaTime*(Sprinting?-.19f:.115f));
        Vector3 motion=(Player.right*x+Player.forward*z).normalized*(Crouching?1.6f:Sprinting?5.8f:3.1f);
        controller.Move((motion+Vector3.down*5)*Time.deltaTime);
        View.transform.localPosition=Vector3.up*Mathf.Lerp(View.transform.localPosition.y,Crouching?1.08f:1.65f,Time.deltaTime*9);
        if(moving&&!Crouching){stepClock-=Time.deltaTime; if(stepClock<=0){audioSource.PlayOneShot(stepClip,Sprinting?.65f:.3f); stepClock=Sprinting?.31f:.5f;}}
        threat=0; foreach(var e in enemies)threat=Mathf.Max(threat,Mathf.Clamp01(1-Vector3.Distance(Player.position,e.transform.position)/18));
        if(threat>.1f){pulseClock-=Time.deltaTime; if(pulseClock<=0){audioSource.PlayOneShot(pulseClip,threat); pulseClock=Mathf.Lerp(1.2f,.33f,threat);}}
        prompt=""; ExitPoint near=null;
        foreach(var e in Layout.exits)if(Vector3.Distance(Player.position,Layout.World(e.x,e.z))<2.7f)near=e;
        if(near!=null)
        {
            prompt="HOLD E  /  PUSH TO ESCAPE";
            exitHold=Input.GetKey(KeyCode.E)?exitHold+Time.deltaTime:0;
            if(exitHold>=1.2f){state=2; result=near.name; LockCursor(false); PlayerPrefs.SetInt("Escapes",PlayerPrefs.GetInt("Escapes",0)+1);}
        }
        else
        {
            exitHold=0; WallArtDisplay art=null; float nearest=2.8f;
            foreach(var candidate in wallArt)
            {
                Vector3 toPlayer=Player.position-candidate.position; float distance=new Vector2(toPlayer.x,toPlayer.z).magnitude;
                if(distance>=nearest)continue; Vector3 toArt=(candidate.position-View.transform.position).normalized;
                Vector3 viewerDirection=(View.transform.position-candidate.position).normalized;
                if(Vector3.Dot(View.transform.forward,toArt)>.05f&&Vector3.Dot(candidate.normal,viewerDirection)>.15f){art=candidate;nearest=distance;}
            }
            if(art!=null){prompt="HOLD E  /  VIEW ART";if(HoldingUse)viewedArt=art;}
        }
    }
    public void Capture(string who)
    {
        if(!Playing||Elapsed<5)return; state=3; result=who; LockCursor(false);
    }
    void Styles()
    {
        if(white)return; white=Texture2D.whiteTexture;
        small=new GUIStyle(GUI.skin.label){fontSize=15,wordWrap=true}; small.normal.textColor=new Color(.75f,.79f,.73f);
        heading=new GUIStyle(small){fontSize=25,fontStyle=FontStyle.Bold}; heading.normal.textColor=mint;
        title=new GUIStyle(heading){fontSize=70}; title.normal.textColor=new Color(.92f,.91f,.81f);
        button=new GUIStyle(GUI.skin.button){fontSize=18,padding=new RectOffset(16,16,14,14)};
    }
    void Rect(float x,float y,float w,float h,Color c){GUI.color=c; GUI.DrawTexture(new Rect(x,y,w,h),white); GUI.color=Color.white;}
    void Label(float x,float y,float w,float h,string text,GUIStyle style){GUI.Label(new Rect(x,y,w,h),text,style);}
    void OnGUI()
    {
        Styles(); GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,new Vector3(Screen.width/1280f,Screen.height/720f,1));
        if(viewedArt!=null)
        {
            Rect(0,0,1280,720,new Color(.018f,.03f,.028f,.97f)); Label(90,58,1100,35,"ARCHIVE WALL ART",small);
            GUI.DrawTexture(new UnityEngine.Rect(190,105,900,500),viewedArt.texture,ScaleMode.ScaleToFit,true);
            Label(90,628,1100,35,viewedArt.title.ToUpperInvariant(),heading); Label(90,671,1100,25,"RELEASE E TO RETURN",small); return;
        }
        if(state==0||state==2||state==3||paused)
        {
            Rect(0,0,1280,720,new Color(.018f,.03f,.028f,.95f)); Rect(60,70,4,570,mint);
            Label(92,74,1000,30,"CHESTER  /  THE 1829 BUILDING  /  A FICTIONAL NIGHT ESCAPE",small);
            Label(90,123,1090,110,state==2?"YOU MADE IT OUT.":state==3?"Return to office, 3 days per week":paused?"HOLD YOUR BREATH.":"ESCAPE FROM 1829",title);
            Label(94,227,980,65,state==2?"Escaped through "+result+" in "+Elapsed.ToString("0.0")+" seconds.":state==3?"Captured by "+result+" after "+Elapsed.ToString("0.0")+" seconds.":"Five exits. Three pursuers. One chance to find your way through the dark.",heading);
            Label(94,314,520,152,"WASD  Move     MOUSE  Look\nSHIFT  Sprint     CTRL / C  Crouch\nF  Torch     TAB  Building map\nE  Hold at art or an exit     ESC  Pause",small);
            Label(690,318,480,150,"SYLVIA follows noise and searches your last position.\nSECURITY patrols the wings and chases on sight.\nTHE DEVA ASYLUM GHOST senses you through walls. Aim your torch at it to slow its approach.",small);
            if(GUI.Button(new Rect(94,500,310,60),paused?"RESUME":state==0?"ENTER THE BUILDING":"TRY ANOTHER ROUTE",button))
            { if(paused){paused=false;LockCursor(true);}else StartRun(); }
            Label(450,500,170,25,"LOOK SENSITIVITY",small); sensitivity=GUI.HorizontalSlider(new Rect(450,540,200,20),sensitivity,.4f,4);
            Label(94,605,1090,65,"Inspired by the published 1828 principal-floor plan. Routes, five exits and characters are fictional. This is a game layout, not a current evacuation plan.\nBlender architecture · Unity first-person prototype",small);
            return;
        }
        Rect(24,24,370,87,ink); Label(42,34,340,30,"1829  /  FIND AN EMERGENCY EXIT",heading);
        Label(42,76,340,25,"ANY OF FIVE EXITS  ·  "+Elapsed.ToString("000.0")+"s",small);
        Rect(24,616,335,80,ink); Label(40,624,290,24,Sprinting?"SPRINTING  /  THEY CAN HEAR YOU":Crouching?"CROUCHING  /  QUIET":"STAMINA",small);
        Rect(40,659,298,5,new Color(.2f,.25f,.22f));Rect(40,659,298*stamina,5,mint);
        Label(910,657,340,35,"F TORCH   ·   TAB MAP   ·   ESC PAUSE",small);
        Rect(638,357,4,4,mint);
        if(threat>.25f){Rect(0,0,1280,7,new Color(.75f,.16f,.09f,threat));Label(492,32,380,35,threat>.75f?"SOMEONE IS VERY CLOSE":"YOU ARE NOT ALONE",small);}
        if(prompt!=""){Rect(435,535,410,70,ink);Label(467,548,355,28,prompt,heading);Rect(451,592,378*Mathf.Clamp01(exitHold/1.2f),4,mint);}
        if(map) DrawMap();
    }
    void DrawMap()
    {
        Rect(393,130,494,388,ink); Label(411,139,450,30,"NAMED AREAS  /  GAME ROUTES",heading);
        const float scale=8; float ox=474,oy=194;
        for(int z=0;z<Layout.height;z++)for(int x=0;x<Layout.width;x++)
            if(Layout.Open(x,z))Rect(ox+x*scale,oy+z*scale,scale-1,scale-1,new Color(.32f,.4f,.35f));
        for(int i=0;i<Layout.exits.Length;i++){var e=Layout.exits[i];Rect(ox+e.x*scale-2,oy+e.z*scale-2,12,12,mint);Label(ox+e.x*scale+10,oy+e.z*scale-8,25,25,(i+1).ToString(),small);}
        var p=Layout.Cell(Player.position);Rect(ox+p.x*scale,oy+p.y*scale,7,7,Color.white);
        Label(411,484,465,24,"WHITE: YOU     GREEN: EXITS     TAB: CLOSE",small);
    }
}
