using System;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    [Serializable] public class TowerFlight {public Point a,b;public float dx,dz,startY,endY;}
    [Serializable] public class TowerPlan : Point {public float @base,rise,top;public TowerFlight[] flights;public EscapeNode[] nodes;public Point[] lamps;public Point entrance,lookout,noise;}
    bool towerHatchOpen,towerHatchOiled,towerSurveyed;float towerWork,towerKnock,towerPresence,towerLightLevel=-1,towerEcho,towerDrip,towerPreviousY=float.NaN,towerHatchMotionTime;
    AudioClip towerCreak,towerDrop;float towerGuardStep;
    bool InsideTower=>escapeOutside&&Mathf.Abs(player.x-manifest.escape.tower.x)<4.8f&&Mathf.Abs(player.y-manifest.escape.tower.z)<4.8f;
    void ResetTower(){towerHatchOpen=towerHatchOiled=towerSurveyed=false;towerWork=towerKnock=towerPresence=towerEcho=towerDrip=towerHatchMotionTime=towerGuardStep=0;towerLightLevel=-1;towerPreviousY=float.NaN;}
    bool TowerInteract(float dt,bool use){if(!escapeOutside){towerWork=towerKnock=0;return false;}var plan=manifest.escape.tower;EscapeNode node=null;float nearest=float.PositiveInfinity;
        foreach(var n in plan.nodes){if(n.id=="tower-hatch"&&towerHatchOpen)continue;float distance=Vector2.Distance(player,XZ(n));if(Mathf.Abs(playerY-n.y)<.65f&&distance<(n.id=="tower-maintenance"?1.45f:1.65f)&&distance<nearest){nearest=distance;node=n;}}
        if(node==null){towerWork=towerKnock=0;return false;}
        if(node.id=="tower-hatch"){
            prompt=crowbar?"Hold USE · Free tower retaining bar":"Tower retaining bar · Crowbar needed in the repair workshop";
            if(!use||!crowbar){towerWork=towerKnock=0;return true;}towerWork+=dt;towerKnock+=dt;
            if(towerKnock>=1){towerKnock=0;PlayTowerCreak(.055f);}
            if(towerWork>=3){towerHatchOpen=true;towerHatchOiled=oil;doorAngles["tower-hatch"]=-Mathf.PI/2;towerWork=towerKnock=0;GroundsNoise(XZ(plan.noise),oil?24:280);PlayTowerCreak(oil?.035f:.16f);
                ScenarioNote("tower-hatch","Tower access opened",oil?"I freed the retaining bar and oiled the hinge. The entrance opens quietly and stays open.":"I freed the retaining bar. The stiff hinge rang across the yard; security may investigate. The entrance stays open.");SyncEscapeScenario();}return true;
        }
        towerWork=towerKnock=0;prompt="USE · "+node.title;if(!use||stairLatch)return true;stairLatch=true;
        if(node.id=="tower-maintenance")ScenarioNote(node.id,"Water tower inspection","The retaining bar needs a crowbar from the repair workshop. Oil from the parts store quiets the hinge. Follow the landing lamps to the west lookout and return by the same stairs.");
        else{towerSurveyed=true;ScenarioNote(node.id,"View from the tower","The pedestrian gate lies far to the west on the north boundary. The boarded maintenance wicket is northwest of the tower. Beyond them, the perimeter path leads west to the lattice mast. Watch for security before descending by the same stairs.");UpdateObjective(0);}return true;
    }
    void PlayTowerCreak(float volume){if(!towerCreak)towerCreak=Tone(145,.95f);PlaySound(towerCreak,volume);}
    void UpdateTowerMood(float dt){bool insideTower=InsideTower;var plan=manifest.escape.tower;dt=Mathf.Min(dt,.1f);towerPresence+=((insideTower?1:0)-towerPresence)*(1-Mathf.Exp(-dt/.18f));
        if(insideTower){float target=Mathf.Clamp((playerY-plan.@base)/plan.rise,0,12);towerLightLevel=towerLightLevel<0?target:towerLightLevel+(target-towerLightLevel)*(1-Mathf.Exp(-dt/.12f));}
        if(towerLightLevel>=0){int level=Mathf.Min(11,Mathf.FloorToInt(towerLightLevel));float fraction=towerLightLevel-level,blend=fraction*fraction*(3-2*fraction);
            for(int i=0;i<2;i++){var light=lightPool[lightPool.Length-2+(level+i)%2];var lamp=plan.lamps[level+i];light.enabled=towerPresence>.0001f;light.transform.position=World(XZ(lamp),lamp.y);light.color=new Color(1,.808f,.533f);light.range=12;light.intensity=1.2f*towerPresence*(i==0?1-blend:blend);}}
        if(!insideTower){towerPreviousY=float.NaN;towerEcho=towerDrip=0;if(towerPresence<.0001f)towerLightLevel=-1;return;}
        towerEcho+=dt;towerDrip+=dt;if(towerDrip>4.6f){towerDrip=0;if(!towerDrop)towerDrop=Tone(680,.14f);PlaySound(towerDrop,.045f);}
        if(!float.IsNaN(towerPreviousY)&&Mathf.Abs(playerY-towerPreviousY)>.025f&&towerEcho>.65f){towerEcho=0;PlaySound(footstep,.065f);}towerPreviousY=playerY;
    }
}
