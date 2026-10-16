using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    bool freeInteriorJump;
    struct IndoorSupport {public float bottom,y;public int floor;public Flight flight;public bool rail;}
    bool FloorSolidAt(Layout plan,Vector2 p){foreach(var d in new[]{Vector2.zero,new Vector2(-.27f,-.27f),new Vector2(.27f,-.27f),new Vector2(-.27f,.27f),new Vector2(.27f,.27f)}){var q=p+d;if(InOutline(plan,q.x,q.y)&&!Array.Exists(plan.openings,b=>q.x>b.minX&&q.x<b.maxX&&q.y>b.minZ&&q.y<b.maxZ))return true;}return false;}
    IEnumerable<IndoorSupport> IndoorSolids(Vector2 p){
        foreach(var plan in floors)if(FloorSolidAt(plan,p))yield return new IndoorSupport{bottom=plan.elevation-.2f,y=plan.elevation,floor=plan.id};
        foreach(var f in floors[0].flights){foreach(var run in f.runs){var a=run.a;var b=run.b;var d=XZ(b)-XZ(a);float t=Vector2.Dot(p-XZ(a),d)/Mathf.Max(.000001f,d.sqrMagnitude);if(t<0||t>1||Mathf.Abs((p.x-a.x)*d.y-(p.y-a.z)*d.x)>d.magnitude*.65f)continue;float y=Mathf.Lerp(a.y,b.y,t);yield return new IndoorSupport{bottom=y-.18f,y=y,floor=f.lower,flight=f};}
            foreach(var deck in f.decks)if(InPolygon(p.x,p.y,deck.points))yield return new IndoorSupport{bottom=deck.y-.18f,y=deck.y,floor=f.lower,flight=f};}
        foreach(var plan in floors)foreach(var rail in plan.rails)for(int i=1;i<rail.points.Length;i++){var a=rail.points[i-1];var b=rail.points[i];var d=XZ(b)-XZ(a);float t=Mathf.Clamp01(Vector2.Dot(p-XZ(a),d)/Mathf.Max(.000001f,d.sqrMagnitude));if(Vector2.Distance(p,XZ(a)+d*t)>=.38f)continue;float y=Mathf.Lerp(a.y,b.y,t);yield return new IndoorSupport{bottom=y-.16f,y=y+1.085f,floor=plan.id,rail=true};}
    }
    bool IndoorSupportAt(Vector2 p,float y,out IndoorSupport support){support=default;bool found=false;foreach(var s in IndoorSolids(p))if(s.y<=y+.025f&&(!found||s.y>support.y)){found=true;support=s;}return found;}
    float IndoorAirCeiling(){float ceiling=JumpCeiling(player,playerY);foreach(var s in IndoorSolids(player))if(s.bottom>=playerY+1.8f-.025f)ceiling=Mathf.Min(ceiling,s.bottom);return ceiling;}
    bool IndoorAirClear(Vector2 p,float y){
        foreach(var d in new[]{Vector2.zero,new Vector2(-.27f,-.27f),new Vector2(.27f,-.27f),new Vector2(-.27f,.27f),new Vector2(.27f,.27f)}){var q=p+d;bool contains=false;foreach(var plan in floors)contains|=InOutline(plan,q.x,q.y);if(!contains)return false;}
        foreach(var plan in floors){foreach(var well in plan.wells)if(y+1.8f>well.bottom&&y<well.top&&p.x>well.minX-.34f&&p.x<well.maxX+.34f&&p.y>well.minZ-.34f&&p.y<well.maxZ+.34f)return false;
            if(y+1.8f<=plan.elevation||y>=plan.elevation+(plan.id==2?2.9f:3.8f))continue;
            foreach(var wall in plan.walls)if(SegmentDistance(p.x,p.y,wall.a,wall.b)<.43f)return false;
            foreach(var item in plan.furniture)if(FurnitureContains(item,p.x,p.y,.34f))return false;
            foreach(var item in plan.roomDoors)if(FurnitureContains(item,p.x,p.y,.34f))return false;}
        if(y+1.8f>JumpCeiling(p,y)+.001f)return false;foreach(var s in IndoorSolids(p))if(s.y>y+.025f&&s.bottom<y+1.79f)return false;return true;
    }
    void LandIndoor(IndoorSupport support){floor=support.floor;if(!support.rail)playerFlight=support.flight;}
    void MoveIndoorCurrent(Vector2 step,float dt){
        int previousFloor=floor;if(!freeInteriorJump){var p=player;float y=playerY;int f=floor;var flight=playerFlight;MoveInterior(floors,ref p,ref y,ref f,ref flight,step.x,step.y);if(StaffMoveAllowed(player,playerY,p,y)){player=p;playerY=y;floor=f;playerFlight=flight;}}
        else if(dt>0){int count=Mathf.Max(1,Mathf.CeilToInt(dt*120),Mathf.CeilToInt(step.magnitude/.08f));float delta=dt/count;
            for(int i=0;i<count;i++){
                if(jumping){float y=playerY+jumpVelocity*delta-9*delta*delta;jumpVelocity-=18*delta;bool landed=false;IndoorSupport landing=default;
                    if(y>playerY){float ceiling=IndoorAirCeiling()-1.8f;if(y>ceiling){y=Mathf.Max(playerY,ceiling);jumpVelocity=0;}}
                    else if(IndoorSupportAt(player,playerY,out landing)&&y<=landing.y){y=landing.y;landed=true;}
                    if(StaffMoveAllowed(player,playerY,player,y)){playerY=y;if(landed){LandIndoor(landing);jumpVelocity=0;jumping=false;}}else jumpVelocity=0;}
                foreach(var d in new[]{new Vector2(step.x/count,0),new Vector2(0,step.y/count)}){if(d==Vector2.zero)continue;var p=player+d;float y=playerY;bool found=IndoorSupportAt(p,y+(jumping?0:.2f),out var support);bool land=!jumping&&found&&support.y>=playerY-.2f;if(land)y=support.y;if(IndoorAirClear(p,y)&&StaffMoveAllowed(player,playerY,p,y)){player=p;playerY=y;if(land)LandIndoor(support);}}
                bool on=IndoorSupportAt(player,playerY,out var below);if(jumping&&on&&below.flight!=null)playerFlight=below.flight;
                if(!jumping&&(!on||below.y<playerY-.025f)){jumping=true;jumpVelocity=0;}
                if(!jumping&&on&&!below.rail){if(below.flight==null&&IndoorClear(floors[below.floor],player.x,player.y))freeInteriorJump=false;
                    else if(below.flight!=null){var p=player;float y=playerY;int f=floor;var flight=playerFlight;MoveInterior(floors,ref p,ref y,ref f,ref flight,.0001f,0);if(p.x>player.x&&Mathf.Abs(y-playerY)<.025f)freeInteriorJump=false;}}
            }}
        if(previousFloor!=floor)ShowFloor();
    }
}
