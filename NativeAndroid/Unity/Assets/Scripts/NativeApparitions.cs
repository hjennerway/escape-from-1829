using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    public GameObject ghostPrefab,figurePrefab;
    static Transform Joint(GameObject model,string name){foreach(var t in model.GetComponentsInChildren<Transform>(true))if(t.name==name)return t;throw new Exception("Missing apparition joint: "+name);}
    // Reflect the browser's XYZ Euler rotation through Z, just as the GLB importer does.
    static Quaternion ApparitionRotation(float x,float y,float z)=>Quaternion.AngleAxis(-x*Mathf.Rad2Deg,Vector3.right)*Quaternion.AngleAxis(-y*Mathf.Rad2Deg,Vector3.up)*Quaternion.AngleAxis(z*Mathf.Rad2Deg,Vector3.forward);
    sealed class GhostPose
    {
        readonly Transform body,head;readonly List<Transform> shoulders=new List<Transform>(),hands=new List<Transform>(),tatters=new List<Transform>();
        public float time;
        public GhostPose(GameObject model){body=Joint(model,"Suspended shroud");head=Joint(model,"Lolling head");foreach(var t in model.GetComponentsInChildren<Transform>(true)){if(t.name=="Drooping shoulder")shoulders.Add(t);if(t.name=="Claw hand")hands.Add(t);if(t.name=="Trailing shroud scrap")tatters.Add(t);}Reset();}
        public void Reset(){time=0;Pose();}
        public void Update(float dt){if(dt>0){time+=dt;Pose();}}
        void Pose(){float t=time;body.localPosition=new Vector3(0,.05f+Mathf.Sin(t*1.7f)*.045f,0);body.localRotation=ApparitionRotation(0,0,Mathf.Sin(t*.79f)*.024f);
            head.localRotation=ApparitionRotation(-.12f+Mathf.Sin(t*.91f)*.07f,Mathf.Sin(t*.63f)*.10f,-.16f+Mathf.Sin(t*1.13f)*.055f);
            for(int i=0;i<shoulders.Count;i++){float s=i==0?-1:1;shoulders[i].localRotation=ApparitionRotation(-.15f+Mathf.Sin(t*1.27f+s)*.11f,s*.09f,s*(.12f+Mathf.Sin(t*.83f+s)*.04f));hands[i].localRotation=ApparitionRotation(-.20f+Mathf.Sin(t*1.43f+s)*.10f,s*.16f,s*.07f);}
            for(int i=0;i<tatters.Count;i++){float a=i/7f*Mathf.PI*2;tatters[i].localRotation=ApparitionRotation(Mathf.Sin(t*1.6f+i*.9f)*.14f,a,Mathf.Sin(t*1.13f+i)*.08f);}
        }
    }
    GameObject CreateCurrentGhost(){var root=Instantiate(ghostPrefab);var light=new GameObject("Apparition local light").AddComponent<Light>();light.transform.SetParent(root.transform,false);light.transform.localPosition=new Vector3(0,1.35f,-.45f);light.type=LightType.Point;light.color=new Color(.506f,.725f,.624f);light.intensity=.45f;light.range=4;return root;}
    [Serializable] public class SightingRoute {public int floor;public Point center,a,b,direction;public float length,visibleHalf;public bool passage;public Point[] exposed;}
    GameObject corridorFigure;Material silhouetteMaterial;float sightingRemaining=20,sightingCheck,sightingTime,sightingDuration,sightingExposure;int sightingDirection=1;SightingRoute sightingRoute,lastSighting;
    Transform figurePelvis,figureUpper;Transform[] figureHip,figureKnee,figureAnkle,figureShoulder,figureElbow;
    void InitializeSightings(){corridorFigure=Instantiate(figurePrefab);figurePelvis=Joint(corridorFigure,"Figure pelvis");figureUpper=Joint(corridorFigure,"Figure upper");
        Transform[] All(string name){var list=new List<Transform>();foreach(var t in corridorFigure.GetComponentsInChildren<Transform>(true))if(t.name==name)list.Add(t);return list.ToArray();}
        figureHip=All("Hip");figureKnee=All("Knee");figureAnkle=All("Ankle");figureShoulder=All("Shoulder");figureElbow=All("Elbow");
        silhouetteMaterial=new Material(Resources.Load<Shader>("NativeSilhouette"));foreach(var r in corridorFigure.GetComponentsInChildren<Renderer>(true))r.sharedMaterial=silhouetteMaterial;ResetSightings();}
    void ResetSightings(){sightingRemaining=20;sightingCheck=0;sightingRoute=lastSighting=null;if(corridorFigure)corridorFigure.SetActive(false);}
    void EndSighting(){if(sightingRoute!=null&&sightingExposure<.05f)sightingRemaining=0;sightingRoute=null;sightingCheck=0;if(corridorFigure)corridorFigure.SetActive(false);}
    bool InCorridor(Layout plan,Vector2 p){foreach(var c in plan.corridors)for(int i=1;i<c.points.Length;i++)if(SegmentDistance(p.x,p.y,c.points[i-1],c.points[i])<c.width/2-.1f)return true;return false;}
    bool SightingView(Vector2 p,float margin=.82f){var v=view.WorldToViewportPoint(World(p,layout.elevation+1.05f));return v.z>=view.nearClipPlane&&v.z<=view.farClipPlane&&Mathf.Abs(v.x-.5f)<=margin*.5f&&Mathf.Abs(v.y-.5f)<=.35f;}
    bool SightingEligible(SightingRoute r){if(r.floor!=floor||SegmentDistance(player.x,player.y,r.a,r.b)<20)return false;var center=XZ(r.center);var direction=XZ(r.direction);var delta=center-player;
        if(Mathf.Abs(Vector2.Dot(delta.normalized,direction))>.35f||!SightingView(center))return false;
        foreach(float offset in new[]{-.6f,0,.6f})if(!LineOfSight(layout,player,center+direction*offset))return false;
        if(!r.passage){foreach(var end in new[]{r.a,r.b})foreach(float x in new[]{-.75f,.75f})foreach(float z in new[]{-.75f,.75f})if(LineOfSight(layout,player,XZ(end)+new Vector2(x,z)))return false;}
        if(r.exposed!=null){foreach(var p in r.exposed)if(!IndoorClear(layout,p.x,p.z,.28f))return false;}
        else for(int i=0;i<=24;i++){var p=Vector2.Lerp(XZ(r.a),XZ(r.b),i/24f);if(!IndoorClear(layout,p.x,p.y,.28f))return false;}return true;
    }
    void PoseFigure(float time){float phase=time*12.5f,height=.84f+Mathf.Cos(phase*2)*.015f;figurePelvis.localPosition=new Vector3(0,height,0);figureUpper.localRotation=ApparitionRotation(.20f,Mathf.Sin(phase)*.07f,0);
        for(int i=0;i<2;i++){float p=Mathf.Repeat(phase/(Mathf.PI*2)+i*.5f,1),swing=Mathf.Max(0,(p-.4f)/.6f),z=p<.4f?.33f*(1-2*p/.4f):-.33f*Mathf.Cos(Mathf.PI*swing),y=.09f+Mathf.Pow(Mathf.Sin(Mathf.PI*swing),2)*.27f,down=height-y;
            float bend=Mathf.Acos(Mathf.Clamp((down*down+z*z-.43f*.43f-.41f*.41f)/(2*.43f*.41f),-1,1)),hip=Mathf.Atan2(-z,down)-Mathf.Atan2(.41f*Mathf.Sin(bend),.43f+.41f*Mathf.Cos(bend));
            figureHip[i].localRotation=ApparitionRotation(hip,0,0);figureKnee[i].localRotation=ApparitionRotation(bend,0,0);figureAnkle[i].localRotation=ApparitionRotation(-hip-bend,0,0);figureShoulder[i].localRotation=ApparitionRotation(z*1.7f,0,0);figureElbow[i].localRotation=ApparitionRotation(-1.12f+Mathf.Sin(phase+i*Mathf.PI)*.12f,0,0);}
    }
    void UpdateSightings(float dt){if(!corridorFigure)return;
        if(!(dt>0)||dt>.5f||!Indoors||playerFlight!=null){EndSighting();return;}sightingRemaining=Mathf.Max(0,sightingRemaining-dt);
        if(sightingRoute!=null){var r=sightingRoute;if(r.floor!=floor||SegmentDistance(player.x,player.y,r.a,r.b)<20){EndSighting();return;}sightingTime+=dt;if(sightingTime>=sightingDuration){EndSighting();return;}
            float t=sightingDirection>0?sightingTime/sightingDuration:1-sightingTime/sightingDuration;var p=Vector2.Lerp(XZ(r.a),XZ(r.b),t);corridorFigure.transform.position=World(p,layout.elevation);corridorFigure.transform.rotation=Quaternion.Euler(0,-Mathf.Atan2(r.direction.x*sightingDirection,r.direction.z*sightingDirection)*Mathf.Rad2Deg,0);PoseFigure(sightingTime);
            float opacity=r.passage?Mathf.Clamp01((r.visibleHalf-Mathf.Abs(t-.5f)*r.length)/.6f):1;silhouetteMaterial.SetFloat("_Opacity",opacity);if(opacity>.5f&&SightingView(p,.98f)&&LineOfSight(layout,player,p))sightingExposure+=dt;return;}
        if(sightingRemaining>.000001f||!InCorridor(layout,player))return;sightingCheck-=dt;if(sightingCheck>0)return;sightingCheck=.15f;
        var candidates=new List<SightingRoute>();foreach(var r in manifest.sightings)if(SightingEligible(r))candidates.Add(r);if(candidates.Count==0)return;
        candidates.Sort((a,b)=>(XZ(b.center)-player).sqrMagnitude.CompareTo((XZ(a.center)-player).sqrMagnitude));var far=XZ(candidates[0].center);float end=Vector2.Distance(far,player);var axis=(far-player).normalized;var previous=far;
        for(float d=end+.25f;d<view.farClipPlane;d+=.25f){var next=player+axis*d;end=d;if(!InCorridor(layout,next)||!IndoorClear(layout,next.x,next.y,.1f)||!LineOfSight(layout,previous,next))break;previous=next;}
        candidates.RemoveAll(r=>Vector2.Distance(XZ(r.center),player)<end*.8f);if(candidates.Count==0)return;if(candidates.Count>1)candidates.Remove(lastSighting);
        sightingRoute=candidates[UnityEngine.Random.Range(0,candidates.Count)];lastSighting=sightingRoute;sightingDirection=UnityEngine.Random.value<.5f?-1:1;sightingDuration=sightingRoute.length/UnityEngine.Random.Range(8f,10f);sightingTime=sightingExposure=0;sightingRemaining=20;
        corridorFigure.transform.position=World(XZ(sightingDirection>0?sightingRoute.a:sightingRoute.b),layout.elevation);PoseFigure(0);silhouetteMaterial.SetFloat("_Opacity",sightingRoute.passage?0:1);corridorFigure.SetActive(true);
    }
}
