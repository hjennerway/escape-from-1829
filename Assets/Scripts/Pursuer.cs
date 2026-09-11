using System.Collections.Generic;
using UnityEngine;

public class Pursuer : MonoBehaviour
{
    EscapeGame game;
    int kind, routeIndex;
    Vector3 spawn, destination;
    float rethink, memory;
    List<Vector3> path=new List<Vector3>();
    Transform visual;
    public void Configure(EscapeGame owner,int type)
    {
        game=owner; kind=type; spawn=transform.position;
        Color color=kind==0?new Color(.45f,.15f,.12f):kind==1?new Color(.08f,.13f,.22f):new Color(.49f,.82f,.74f);
        var body=EscapeGame.Primitive("Coat",PrimitiveType.Capsule,transform.position+Vector3.up, new Vector3(.65f,.85f,.48f),color);
        visual=body.transform; visual.SetParent(transform,true);
        var head=EscapeGame.Primitive("Face",PrimitiveType.Sphere,transform.position+Vector3.up*1.95f,Vector3.one*.38f,kind==2?color:new Color(.55f,.45f,.33f));head.transform.SetParent(transform,true);
        for(int side=-1;side<=1;side+=2)
        {
            var eye=EscapeGame.Primitive("Eye",PrimitiveType.Sphere,transform.position+new Vector3(side*.075f,2,.17f),Vector3.one*.055f,Color.white);eye.transform.SetParent(transform,true);
            var mat=eye.GetComponent<Renderer>().material;mat.EnableKeyword("_EMISSION");mat.SetColor("_EmissionColor",kind==2?Color.cyan*3:Color.red*2);
        }
        if(kind==1)
        {
            var badge=EscapeGame.Primitive("Security badge",PrimitiveType.Cube,transform.position+new Vector3(.16f,1.45f,.25f),new Vector3(.14f,.18f,.03f),Color.yellow);badge.transform.SetParent(transform,true);
        }
        if(kind==0 || kind==2)
        {
            var signObject=new GameObject(kind==0?"Sandra sign":"Deva ghost sign"); signObject.transform.SetParent(transform,false); signObject.transform.localPosition=new Vector3(0,kind==0?1.32f:1.18f,.30f);
            var sign=signObject.AddComponent<TextMesh>(); sign.text=kind==0?"Sandra":"Deva ghost"; sign.fontSize=48; sign.characterSize=.045f; sign.anchor=TextAnchor.MiddleCenter; sign.alignment=TextAlignment.Center; sign.color=kind==0?new Color(.95f,.85f,.68f):new Color(.67f,1f,.85f);
            var plaque=EscapeGame.Primitive("Sign plaque",PrimitiveType.Cube,signObject.transform.position+new Vector3(0,0,-.035f),new Vector3(kind==0?.76f:1.02f,.23f,.04f),kind==0?new Color(.30f,.13f,.11f):new Color(.08f,.28f,.23f)); plaque.transform.SetParent(transform,true); plaque.transform.SetSiblingIndex(0);
        }
        if(kind==2){var l=gameObject.AddComponent<Light>();l.color=Color.cyan;l.range=4;l.intensity=.8f;}
        ResetPursuit();
    }
    public void ResetPursuit(){transform.position=spawn;destination=spawn;rethink=0;memory=0;routeIndex=0;path.Clear();}
    void Update()
    {
        if(game==null||!game.Playing||game.Elapsed<5)return;
        // Holding E is a deliberate inspection/use moment: freeze every NPC while it is held.
        if(game.HoldingUse)return;
        float dt=Time.deltaTime; var delta=game.Player.position-transform.position; delta.y=0;
        float distance=delta.magnitude;
        bool sight=distance<(game.Crouching?8:kind==1?22:16)&&!Physics.Linecast(transform.position+Vector3.up*1.6f,game.Player.position+Vector3.up*1.3f);
        // Player controller may be the first hit: explicitly ignore that hit.
        RaycastHit hit;
        if(distance<(game.Crouching?8:kind==1?22:16))
            sight=!Physics.Linecast(transform.position+Vector3.up*1.6f,game.Player.position+Vector3.up*1.3f,out hit)||hit.transform==game.Player;
        bool heard=kind==0&&distance<game.Noise;
        if(sight||heard||kind==2){destination=game.Player.position;memory=kind==0?8:5;}
        else memory=Mathf.Max(0,memory-dt);
        rethink-=dt;
        if(rethink<=0)
        {
            rethink=.45f;
            if(memory<=0 && (path.Count==0 || Vector3.Distance(transform.position,destination)<1))
            {
                int[] xs=kind==0?new[]{8,20,32,20}:new[]{32,8,8,32};
                int[] zs=kind==0?new[]{16,22,16,11}:new[]{26,26,5,5};
                destination=game.Layout.World(xs[routeIndex%4],zs[routeIndex%4]);routeIndex++;
            }
            path=game.Layout.Path(transform.position,destination);
        }
        float speed=kind==0?(memory>0?3.55f:2.1f):kind==1?(memory>0?3.85f:2.4f):2.2f;
        if(kind==2&&game.TorchOn&&distance<23)
        {
            Vector3 toGhost=(transform.position+Vector3.up*1.3f-game.View.transform.position).normalized;
            if(Vector3.Dot(game.View.transform.forward,toGhost)>.88f&&!Physics.Linecast(game.View.transform.position,transform.position+Vector3.up*1.3f))speed=.55f;
        }
        if(path.Count>0)
        {
            Vector3 target=path[0]; target.y=0;
            Vector3 direction=target-transform.position; direction.y=0;
            if(direction.sqrMagnitude>.01f)transform.rotation=Quaternion.Slerp(transform.rotation,Quaternion.LookRotation(direction),dt*7);
            transform.position=Vector3.MoveTowards(transform.position,target,speed*dt);
            if(Vector3.Distance(transform.position,target)<.06f)path.RemoveAt(0);
        }
        else if(memory>0 && game.Layout.Cell(transform.position)==game.Layout.Cell(game.Player.position))
        {
            var target=game.Player.position;target.y=0;transform.position=Vector3.MoveTowards(transform.position,target,speed*dt);
        }
        if(kind==2)visual.localPosition=Vector3.up*(1+Mathf.Sin(Time.time*2)*.12f);
        if(distance<.8f)game.Capture(name);
    }
}
