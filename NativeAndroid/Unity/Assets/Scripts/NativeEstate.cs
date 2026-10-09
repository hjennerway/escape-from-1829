using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    MeshRenderer[] estateMeshes;bool[] periodMeshSet;int[] detailLevels;
    public Mesh[] selectionMeshes;public Shader selectionShader;
    MeshFilter selectionFilter;MeshRenderer selectionRenderer;const float selectionOpacity=.24f*.2f;
    readonly List<InteriorPart> interiorParts=new List<InteriorPart>();
    readonly List<GameObject> floorArtwork=new List<GameObject>();
    class InteriorPart { public MeshRenderer renderer;public int floor,region;public bool open; }
    Vector3 orbitTarget;float orbitDistance=500,orbitYaw=200,orbitPitch=52,lodClock;
    int selectedBuilding=-1,photoIndex;Texture2D photoTexture;float photoZoom=1;Vector2 photoPan;
    bool locationsOpen;Vector2 locationsScroll;string locationMessage="";
    void InitializeEstate()
    {
        estateMeshes=new MeshRenderer[manifest.meshFlags.Length];periodMeshSet=new bool[estateMeshes.Length];detailLevels=new int[manifest.detailGroups.Length];
        foreach(var r in outside.GetComponentsInChildren<MeshRenderer>(true)){
            string name=r.transform.parent.name;if(!name.StartsWith("estate-"))continue;
            int index=int.Parse(name.Substring(7));estateMeshes[index]=r;r.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;
        }
        for(int i=0;i<estateMeshes.Length;i++)if(!estateMeshes[i])throw new Exception("Estate mesh missing: "+i);
        var highlight=new GameObject("Selected building surfaces");highlight.transform.SetParent(outside.transform,false);
        selectionFilter=highlight.AddComponent<MeshFilter>();selectionRenderer=highlight.AddComponent<MeshRenderer>();
        selectionRenderer.sharedMaterial=new Material(selectionShader);selectionRenderer.sharedMaterial.SetFloat("_Opacity",selectionOpacity);
        selectionRenderer.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;selectionRenderer.receiveShadows=false;selectionRenderer.enabled=false;
        SetPeriod(periodIndex);
    }
    void SetPeriod(int index)
    {
        periodIndex=Mathf.Clamp(index,0,manifest.periods.Length-1);Array.Clear(periodMeshSet,0,periodMeshSet.Length);
        foreach(int mesh in manifest.periods[periodIndex].meshes)periodMeshSet[mesh]=true;
        CloseBuilding();RefreshEstateVisibility();RefreshNightEstate();
        if(mode==Mode.Outside&&!Indoors&&!OutdoorClear(manifest,player.x,player.y,periodIndex,trees)){
            bool found=false;for(float radius=1;radius<=40&&!found;radius+=1)for(int a=0;a<32&&!found;a++){
                var p=player+new Vector2(Mathf.Cos(a*Mathf.PI/16),Mathf.Sin(a*Mathf.PI/16))*radius;
                if(OutdoorClear(manifest,p.x,p.y,periodIndex,trees)){player=p;found=true;}
            }if(!found)player=new Vector2(0,40);PositionView();
        }
    }
    void RefreshEstateVisibility()
    {
        if(estateMeshes==null)return;
        if(movingFittings.TryGetValue("escape-trees",out var scenarioTrees))scenarioTrees.gameObject.SetActive(trees);
        for(int i=0;i<estateMeshes.Length;i++){
            var flag=manifest.meshFlags[i];bool visible=(Escaping&&escapeMeshSet!=null?escapeMeshSet[i]:periodMeshSet[i])&&(!flag.tree||trees)&&(flag.group<0||flag.level==detailLevels[flag.group]);estateMeshes[i].enabled=visible;
        }
    }
    void UpdateEstateLOD()
    {
        if(!outside.activeSelf)return;lodClock-=Time.unscaledDeltaTime;if(lodClock>0)return;lodClock=.15f;
        bool changed=false;float projection=Screen.height/(2*Mathf.Tan(view.fieldOfView*Mathf.Deg2Rad/2));
        for(int i=0;i<detailLevels.Length;i++){
            var g=manifest.detailGroups[i];var centre=new Vector3(g.x,g.y,-g.z);float depth=Vector3.Dot(view.transform.forward,centre-view.transform.position);
            float pixels=g.windowHeight*projection/Mathf.Max(.1f,depth-g.radius);int level=detailLevels[i];
            if(level==0&&pixels<40)level=1;else if(level>0&&pixels>48)level=0;
            if(level==1&&pixels<12)level=2;else if(level==2&&pixels>15)level=1;
            if(level!=detailLevels[i]){detailLevels[i]=level;changed=true;}
        }if(changed)RefreshEstateVisibility();
    }
    void InitializeInterior()
    {
        foreach(var r in inside.GetComponentsInChildren<MeshRenderer>(true)){
            string name=r.transform.parent.name;if(!name.StartsWith("floor-"))continue;var s=name.Split('-');
            interiorParts.Add(new InteriorPart{renderer=r,floor=int.Parse(s[1]),region=s[2]=="core"?-1:int.Parse(s[3]),open=s[2]=="open"});
        }
        artRoot=new GameObject("Archive wall art");
        // Keep every archive image on each floor, with a fresh assignment on app load.
        for(int f=0;f<floors.Length;f++){var panels=new List<WallArt>();foreach(var a in manifest.wallArt)if(a.floor==f)panels.Add(a);for(int i=panels.Count-1;i>0;i--){int j=UnityEngine.Random.Range(0,i+1),index=panels[i].index;panels[i].index=panels[j].index;panels[j].index=index;}}
        foreach(var art in manifest.wallArt){
            var panel=GameObject.CreatePrimitive(PrimitiveType.Quad);panel.name="Archive picture "+art.index;Destroy(panel.GetComponent<Collider>());
            panel.transform.SetParent(artRoot.transform,false);panel.transform.position=World(new Vector2(art.x,art.z),floors[art.floor].elevation+1.88f);
            panel.transform.rotation=Quaternion.Euler(0,-art.rotation*Mathf.Rad2Deg,0);panel.transform.localScale=new Vector3(1.48f,1.02f,1);
            var material=new Material(Shader.Find("Escape1829/NativeSurface"));material.SetFloat("_Unlit",1);material.SetInt("_Cull",0);material.mainTexture=LoadArchive(manifest.art[art.index].src);panel.GetComponent<Renderer>().material=material;floorArtwork.Add(panel);
        }
    }
    void UpdateInteriorVisibility()
    {
        foreach(var p in interiorParts)p.renderer.enabled=true;
        for(int i=0;i<floorArtwork.Count;i++)floorArtwork[i].SetActive(true);
    }
    static string ArchiveKey(string src)=>"Archive/"+src.Replace("./","").Substring(0,src.Replace("./","").LastIndexOf('.')).Replace('/','_');
    Texture2D LoadArchive(string src){var texture=Resources.Load<Texture2D>(ArchiveKey(src));if(!texture)Debug.LogError("Archive picture missing: "+src);return texture;}
    void ReleaseArchiveTexture(ref Texture2D texture){if(texture){bool wall=false;foreach(var p in floorArtwork)if(p.GetComponent<Renderer>().sharedMaterial.mainTexture==texture)wall=true;if(!wall)Resources.UnloadAsset(texture);}texture=null;}
    void UpdateOrbit(float amount)
    {
        orbitYaw+=amount*20;orbitPitch=Mathf.Clamp(orbitPitch,8,86);orbitDistance=Mathf.Clamp(orbitDistance,25,1500);
        var direction=Quaternion.Euler(orbitPitch,orbitYaw,0)*Vector3.back;
        // Panning or zooming towards a roof must never strand the camera inside
        // it. Move back along the same orbit ray, retaining a usable target.
        for(int attempt=0;attempt<=manifest.periods[periodIndex].buildings.Length;attempt++){
            var position=orbitTarget+direction*orbitDistance;float floor=AerialClearance(position);
            if(position.y>=floor-.001f)break;
            orbitDistance=Mathf.Max(orbitDistance,(floor-orbitTarget.y)/direction.y+.1f);
        }
        view.transform.position=orbitTarget+direction*orbitDistance;view.transform.LookAt(orbitTarget);
    }
    float AerialClearance(Vector3 position)
    {
        float height=4;foreach(var b in manifest.periods[periodIndex].buildings)
            if(position.x>b.minX-3&&position.x<b.maxX+3&&-position.z>b.minZ-3&&-position.z<b.maxZ+3)height=Mathf.Max(height,b.maxY+3);
        return height;
    }
    void FrameBuilding(BuildingBounds b,Location shot)
    {
        orbitTarget=new Vector3((b.minX+b.maxX)/2,(b.minY+b.maxY)/2,-(b.minZ+b.maxZ)/2);
        orbitPitch=50;orbitYaw=200;
        // Browser archive shots include corridor/interior photographs. Reuse
        // only their direction; frame the exterior from above its full bounds.
        if(shot!=null){var direction=new Vector3(shot.target[0]-shot.position[0],0,shot.position[2]-shot.target[2]);if(direction.sqrMagnitude>1)orbitYaw=Quaternion.LookRotation(direction).eulerAngles.y;}
        float radius=new Vector3(b.maxX-b.minX,b.maxY-b.minY,b.maxZ-b.minZ).magnitude*.5f;
        float halfAngle=Mathf.Min(view.fieldOfView*Mathf.Deg2Rad*.5f,Mathf.Atan(Mathf.Tan(view.fieldOfView*Mathf.Deg2Rad*.5f)*view.aspect));
        orbitDistance=Mathf.Max(65,radius/Mathf.Sin(halfAngle)*1.15f);UpdateOrbit(0);
    }
    Vector2 aerialDown;bool aerialDragging;float aerialMoved;
    void UpdateAerialInput(float dt)
    {
        if(!Application.isMobilePlatform){
            if(Input.GetMouseButtonDown(0)&&!PointerOverControls(UIPosition(Input.mousePosition))){aerialDown=Input.mousePosition;aerialDragging=true;aerialMoved=0;}
            if(aerialDragging&&Input.GetMouseButton(0)){var p=(Vector2)Input.mousePosition;var delta=p-aerialDown;aerialDown=p;aerialMoved+=delta.magnitude;
                if(Input.GetKey(KeyCode.LeftShift)){var right=view.transform.right;var forward=Vector3.Cross(right,Vector3.up);orbitTarget+=(-right*delta.x-forward*delta.y)*orbitDistance/900;}
                else{orbitYaw+=delta.x*.22f;orbitPitch=Mathf.Clamp(orbitPitch-delta.y*.18f,8,86);}}
            if(aerialDragging&&Input.GetMouseButtonUp(0)){if(aerialMoved<7)PickBuilding(Input.mousePosition);aerialDragging=false;}
            orbitDistance=Mathf.Clamp(orbitDistance*Mathf.Exp(-Input.mouseScrollDelta.y*.1f),25,1500);
            var pan=new Vector3((Input.GetKey(KeyCode.D)?1:0)-(Input.GetKey(KeyCode.A)?1:0),0,(Input.GetKey(KeyCode.W)?1:0)-(Input.GetKey(KeyCode.S)?1:0));
            orbitTarget+=Quaternion.Euler(0,orbitYaw,0)*pan*dt*orbitDistance*.5f;
        }
        if(Input.touchCount==2){var a=Input.GetTouch(0);var b=Input.GetTouch(1);if(!PointerOverControls(UIPosition(a.position))&&!PointerOverControls(UIPosition(b.position))){float before=Vector2.Distance(a.position-a.deltaPosition,b.position-b.deltaPosition);float now=Vector2.Distance(a.position,b.position);if(now>.01f)orbitDistance=Mathf.Clamp(orbitDistance*before/now,25,1500);var delta=(a.deltaPosition+b.deltaPosition)*.5f;orbitTarget+=(-view.transform.right*delta.x-Vector3.Cross(view.transform.right,Vector3.up)*delta.y)*orbitDistance/900;}}
        UpdateOrbit(0);
    }
    void PickBuilding(Vector2 screen)
    {
        var ray=view.ScreenPointToRay(screen);float nearest=float.PositiveInfinity;int index=-1;
        foreach(var b in manifest.periods[periodIndex].buildings){var bounds=new UnityEngine.Bounds(new Vector3((b.minX+b.maxX)/2,(b.minY+b.maxY)/2,-(b.minZ+b.maxZ)/2),new Vector3(b.maxX-b.minX,b.maxY-b.minY,b.maxZ-b.minZ));if(bounds.IntersectRay(ray,out float distance)&&distance<nearest){nearest=distance;index=b.index;}}
        if(index>=0)SelectBuilding(index);
    }
    void SelectBuilding(int index){selectedBuilding=index;photoExpanded=false;photoIndex=0;photoZoom=1;photoPan=Vector2.zero;ReleaseArchiveTexture(ref photoTexture);var photos=BuildingPhotos();if(photos.Count>0)photoTexture=LoadArchive(photos[0].src);UnlockMouse();stickVector=Vector2.zero;
        foreach(var b in manifest.periods[periodIndex].buildings)if(b.index==index){selectionFilter.sharedMesh=selectionMeshes[b.selectionMesh];selectionRenderer.enabled=true;}
    }
    List<Photo> BuildingPhotos(){var photos=new List<Photo>();if(selectedBuilding<0)return photos;var b=manifest.buildings[selectedBuilding];if(b.photos!=null)photos.AddRange(b.photos);if(b.contextPhotos!=null)photos.AddRange(b.contextPhotos);return photos;}
    string BuildingDates(){var years=new SortedSet<int>();var removed=new SortedSet<int>();var building=manifest.buildings[selectedBuilding];if(building.dates!=null)foreach(var date in building.dates){if(date.built>0)years.Add(date.built);if(date.demolished>0)removed.Add(date.demolished);}return "Built: "+string.Join(" / ",years)+(removed.Count>0?" · Removed: "+string.Join(" / ",removed):"")+" · Viewing "+manifest.periods[periodIndex].year;}
    void CloseBuilding(){selectedBuilding=-1;photoExpanded=false;if(selectionRenderer)selectionRenderer.enabled=false;ReleaseArchiveTexture(ref photoTexture);if(mode==Mode.Outside)LockMouse();}
    void ChangePhoto(int delta){var photos=BuildingPhotos();if(photos.Count==0)return;photoIndex=(photoIndex+delta+photos.Count)%photos.Count;ReleaseArchiveTexture(ref photoTexture);photoTexture=LoadArchive(photos[photoIndex].src);photoZoom=1;photoPan=Vector2.zero;}
    void GoToBuilding(int index)
    {
        if(Indoors&&Exploring)StartOutside();
        foreach(var b in manifest.periods[periodIndex].buildings)if(b.index==index){
            var building=manifest.buildings[index];Location shot=null;foreach(var l in manifest.locations)if(building.locations!=null&&Array.IndexOf(building.locations,l.key)>=0){shot=l;break;}
            if(mode==Mode.Aerial)FrameBuilding(b,shot);
            else{var p=shot?.walkPosition;player=p!=null?new Vector2(p[0],p[2]):new Vector2(b.maxX+5,(b.minZ+b.maxZ)/2);if(!OutdoorClear(manifest,player.x,player.y,periodIndex,trees)){for(float r=2;r<50;r+=2){var test=new Vector2(b.maxX+r,b.maxZ+r);if(OutdoorClear(manifest,test.x,test.y,periodIndex,trees)){player=test;break;}}}var target=new Vector2((b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2);var d=target-player;yaw=Mathf.Atan2(-d.x,-d.y);pitch=0;PositionView();}
            locationsOpen=false;CloseBuilding();return;
        }locationMessage="That building is not present in "+manifest.periods[periodIndex].year+".";
    }
    IEnumerator LocateDevice()
    {
        locationMessage="Finding your position…";
        try{
#if UNITY_ANDROID && !UNITY_EDITOR
        if(!UnityEngine.Android.Permission.HasUserAuthorizedPermission(UnityEngine.Android.Permission.FineLocation)){
            bool answered=false,granted=false;var callbacks=new UnityEngine.Android.PermissionCallbacks();
            callbacks.PermissionGranted+=s=>{answered=true;granted=true;};callbacks.PermissionDenied+=s=>answered=true;
            UnityEngine.Android.Permission.RequestUserPermission(UnityEngine.Android.Permission.FineLocation,callbacks);
            while(!answered)yield return null;if(!granted){locationMessage="Location permission was declined.";yield break;}
        }
#endif
        if(!Input.location.isEnabledByUser){locationMessage="Enable location on your phone to use this.";yield break;}
        Input.location.Start(10,5);float deadline=Time.realtimeSinceStartup+20;
        while(Input.location.status==LocationServiceStatus.Initializing&&Time.realtimeSinceStartup<deadline)yield return null;
        if(Input.location.status!=LocationServiceStatus.Running){locationMessage="Your position could not be found.";Input.location.Stop();yield break;}
        var reading=Input.location.lastData;var a=manifest.earthAnchor;double east=(reading.longitude-a.longitude)*111320*Math.Cos(a.latitude*Math.PI/180),north=(reading.latitude-a.latitude)*111320,L=Math.Sqrt(.55*.55+.835*.835);
        var p=new Vector2(a.x+(float)((-.55*east+.835*north)/L),a.z+(float)((.835*east+.55*north)/L));Input.location.Stop();
        ApplyDeviceLocation(p,reading.horizontalAccuracy);
        }finally{Input.location.Stop();locatingDevice=false;locationRoutine=null;}
    }
    float DistanceToEstate(Vector2 p)
    {
        bool inside=false;float distance=float.PositiveInfinity;var polygon=manifest.perimeter;
        for(int i=0,j=polygon.Length-1;i<polygon.Length;j=i++){var a=new Vector2(polygon[j].x,polygon[j].z);var b=new Vector2(polygon[i].x,polygon[i].z);var d=b-a;float t=Mathf.Clamp01(Vector2.Dot(p-a,d)/d.sqrMagnitude);distance=Mathf.Min(distance,Vector2.Distance(p,a+d*t));if((a.y>p.y)!=(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside?0:distance;
    }
}
