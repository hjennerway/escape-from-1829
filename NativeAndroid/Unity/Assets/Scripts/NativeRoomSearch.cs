using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    class RoomSearch {public string roomId;public int floor;public Vector2 target;public float remaining,timeout;public bool waiting;}
    void EndRoomSearch(Enemy e){e.search=null;e.searchCooldown=8;e.path.Clear();e.memory=0;e.rethink=0;}
    static float PathLength(Vector2 start,List<Vector2> route){float length=0;foreach(var p in route){length+=Vector2.Distance(start,p);start=p;}return length;}
    bool UpdateRoomSearch(Enemy e,float dt){
        e.searchCooldown=Mathf.Max(0,e.searchCooldown-dt);var plan=floors[e.floor];
        if(e.search!=null){var search=e.search;var room=Array.Find(plan.rooms,r=>r.id==search.roomId);if(room==null||search.floor!=e.floor||floor==e.floor&&InPolygon(player.x,player.y,room.points)){EndRoomSearch(e);return false;}
            if(search.waiting){search.remaining-=dt;if(search.remaining<=0){EndRoomSearch(e);return false;}}
            else{search.timeout-=dt;if(Vector2.Distance(e.position,search.target)<.15f){e.path.Clear();search.waiting=true;search.remaining=6;}else if(search.timeout<=0){EndRoomSearch(e);return false;}}return true;
        }
        if(e.searchCooldown>0||e.rethink>0||e.flight!=null||playerFlight!=null||e.floor!=floor)return false;
        foreach(var room in plan.rooms)if(InPolygon(e.position.x,e.position.y,room.points)&&InPolygon(player.x,player.y,room.points))return false;
        var candidates=new List<Doorway>();foreach(var d in plan.doorways)if(!string.IsNullOrEmpty(d.roomId)&&Array.Exists(plan.rooms,r=>r.id==d.roomId))candidates.Add(d);
        candidates.Sort((a,b)=>Vector2.Distance(e.position,XZ(a)).CompareTo(Vector2.Distance(e.position,XZ(b))));if(candidates.Count==0)return false;
        var playerRoute=FindPath(plan,e.position,player);if(playerRoute.Count==0)return false;float playerDistance=PathLength(e.position,playerRoute);
        var nearestDoor=candidates[0];var nearestRoom=Array.Find(plan.rooms,r=>r.id==nearestDoor.roomId);float nearestLo=float.PositiveInfinity,nearestHi=float.NegativeInfinity;foreach(var p in nearestRoom.points){float value=p.x*nearestDoor.dx+p.z*nearestDoor.dz;nearestLo=Mathf.Min(nearestLo,value);nearestHi=Mathf.Max(nearestHi,value);}if(playerDistance<=nearestHi-nearestLo+.000001f)return false;
        foreach(var door in candidates){var room=Array.Find(plan.rooms,r=>r.id==door.roomId);float lo=float.PositiveInfinity,hi=float.NegativeInfinity;foreach(var p in room.points){float value=p.x*door.dx+p.z*door.dz;lo=Mathf.Min(lo,value);hi=Mathf.Max(hi,value);}float span=hi-lo;
            if(Vector2.Distance(e.position,XZ(door))>span||InPolygon(player.x,player.y,room.points))continue;
            var normal=new Vector2(-door.dz,door.dx);if(Vector2.Dot(XZ(room.label)-XZ(door),normal)<0)normal=-normal;
            foreach(float depth in new[]{2.4f,3.2f,1.8f,4f})foreach(float offset in new[]{0f,-.5f,.5f,-1f,1f}){var target=XZ(door)+normal*depth+new Vector2(door.dx,door.dz)*offset;if(!InPolygon(target.x,target.y,room.points)||!IndoorClear(plan,target.x,target.y,.4f))continue;
                bool corridor=false;foreach(var c in plan.corridors)for(int i=1;i<c.points.Length;i++)if(SegmentDistance(target.x,target.y,c.points[i-1],c.points[i])<c.width/2+.7f)corridor=true;if(corridor)continue;
                var route=FindPath(plan,e.position,target);float length=PathLength(e.position,route);if(route.Count==0||length>span+4)continue;
                e.search=new RoomSearch{roomId=room.id,floor=e.floor,target=target,timeout=length/.55f+3};e.target=target;e.targetFloor=e.floor;e.memory=0;e.path.Clear();foreach(var p in route)e.path.Add(new Waypoint(p,e.floor,plan.elevation));return true;
            }
        }return false;
    }
}
