using UnityEngine;
using UnityEngine.Rendering;

public sealed partial class NativePrototypeGame
{
    public Shader deviceLocationShader;
    GameObject deviceMarker;Transform locationBeam,locationPin;bool locatingDevice;Coroutine locationRoutine;
    void BeginDeviceLocation()
    {
        if(!Exploring||locatingDevice)return;HideDeviceLocation();locatingDevice=true;locationRoutine=StartCoroutine(LocateDevice());
    }
    void CancelDeviceLocation()
    {
        if(locationRoutine!=null)StopCoroutine(locationRoutine);locationRoutine=null;
        if(locatingDevice)Input.location.Stop();locatingDevice=false;locationMessage="";HideDeviceLocation();
    }
    void HideDeviceLocation(){if(deviceMarker)deviceMarker.SetActive(false);}
    bool ApplyDeviceLocation(Vector2 point,float accuracy)
    {
        HideDeviceLocation();
        if(!Exploring)return false;
        if(float.IsNaN(point.x)||float.IsInfinity(point.x)||float.IsNaN(point.y)||float.IsInfinity(point.y)){
            locationMessage="Your position could not be found.";return false;
        }
        if(DistanceToEstate(point)>100){locationMessage="This only works near the West Cheshire Hospital site.";return false;}
        if(mode==Mode.Aerial){
            CloseBuilding();locationsOpen=false;stickVector=Vector2.zero;lookFinger=-1;aerialDragging=false;
            view.fieldOfView=46;orbitTarget=World(point,0);orbitPitch=54;orbitYaw=208;
            orbitDistance=230*Mathf.Max(1,1/view.aspect);UpdateOrbit(0);
            ShowDeviceLocation(point);locationMessage="Your location is marked in red with a pillar of light.";
        }else{if(Indoors)StartOutside();ResetJump();hasSafeOutside=false;player=point;playerY=OutdoorHeight(player,0);MoveOutside(Vector2.zero,.025f);PositionView();locationMessage="Your approximate position";}
        if(!float.IsNaN(accuracy)&&!float.IsInfinity(accuracy)&&accuracy>=0)locationMessage+=" Accuracy: about "+Mathf.CeilToInt(accuracy)+" m.";
        return true;
    }
    void ShowDeviceLocation(Vector2 point)
    {
        if(!deviceMarker){
            deviceMarker=new GameObject("Device location marker");deviceMarker.transform.SetParent(outside.transform,false);
            var beam=new Texture2D(64,256,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp};
            for(int y=0;y<256;y++)for(int x=0;x<64;x++){
                float centre=Mathf.Abs((x+.5f)/64-.5f),glow=Mathf.Exp(-centre*centre*90);
                var color=Color.Lerp(new Color(1,.19f,.19f),new Color(1,.96f,.92f),Mathf.Clamp01(1-centre*90));
                color.a=glow*Mathf.Clamp01((1-y/255f)*2);beam.SetPixel(x,y,color);
            }beam.Apply(false,true);
            var pin=new Texture2D(64,80,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp};
            for(int y=0;y<80;y++)for(int x=0;x<64;x++){
                float px=(x+.5f)/64-.5f,py=(y+.5f)/80;
                float circle=Vector2.Distance(new Vector2(px,py),new Vector2(0,.64f));
                bool tip=py>=.04f&&py<.64f&&Mathf.Abs(px)<(py-.04f)*.6f;
                bool innerTip=py>=.12f&&py<.64f&&Mathf.Abs(px)<(py-.12f)*.52f;
                Color color=circle<.38f||tip?Color.white:Color.clear;
                if(circle<.33f||innerTip)color=new Color(.89f,.19f,.21f);
                if(circle<.12f)color=Color.white;pin.SetPixel(x,y,color);
            }pin.Apply(false,true);
            locationBeam=LocationQuad("Device location light pillar",beam,0);locationPin=LocationQuad("Device location pin",pin,1);
        }
        deviceMarker.transform.position=World(point,.6f);deviceMarker.SetActive(true);UpdateDeviceLocationMarker();
    }
    Transform LocationQuad(string name,Texture2D texture,int order)
    {
        var obj=new GameObject(name);obj.transform.SetParent(deviceMarker.transform,false);
        var mesh=new Mesh{vertices=new[]{new Vector3(-.5f,0,0),new Vector3(.5f,0,0),new Vector3(-.5f,1,0),new Vector3(.5f,1,0)},
            uv=new[]{new Vector2(0,0),new Vector2(1,0),new Vector2(0,1),new Vector2(1,1)},triangles=new[]{0,2,1,1,2,3}};
        mesh.RecalculateBounds();obj.AddComponent<MeshFilter>().sharedMesh=mesh;
        var renderer=obj.AddComponent<MeshRenderer>();renderer.sharedMaterial=new Material(deviceLocationShader){mainTexture=texture,renderQueue=4000+order};
        renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;return obj.transform;
    }
    void UpdateDeviceLocationMarker()
    {
        if(!deviceMarker||!deviceMarker.activeSelf)return;
        if(mode!=Mode.Aerial){HideDeviceLocation();return;}
        int height=view.targetTexture?view.targetTexture.height:Screen.height;
        float worldPixel=2*Mathf.Tan(view.fieldOfView*Mathf.Deg2Rad/2)*Vector3.Distance(view.transform.position,deviceMarker.transform.position)/Mathf.Max(1,height);
        var delta=view.transform.position-deviceMarker.transform.position;
        locationBeam.rotation=Quaternion.Euler(0,Mathf.Atan2(delta.x,delta.z)*Mathf.Rad2Deg,0);
        locationBeam.localScale=new Vector3(Mathf.Max(8,worldPixel*18),Mathf.Max(180,worldPixel*200),1);
        locationPin.rotation=view.transform.rotation;locationPin.localScale=new Vector3(worldPixel*34,worldPixel*42,1);
    }
    void LateUpdate(){if(initialized)UpdateDeviceLocationMarker();}
}
