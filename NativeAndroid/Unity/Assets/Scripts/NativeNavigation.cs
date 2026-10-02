using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    float playerY,jumpOffset,jumpVelocity,verticalTrend;bool jumping,perched,exploreInterior,escapeOutside;
    Flight playerFlight;Exit lastDoor;
    bool Indoors=>mode==Mode.Inside||(mode==Mode.Outside&&exploreInterior);
    bool Escaping=>mode==Mode.Inside||escapeOutside;
    static Vector2 XZ(Point p)=>new Vector2(p.x,p.z);
    static float SegmentDistance(float x,float z,Point a,Point b){var d=XZ(b)-XZ(a);float t=Mathf.Clamp01(Vector2.Dot(new Vector2(x,z)-XZ(a),d)/Mathf.Max(.000001f,d.sqrMagnitude));return Vector2.Distance(new Vector2(x,z),XZ(a)+d*t);}
    static bool InPolygon(float x,float z,Point[] points){bool inside=false;for(int i=0,j=points.Length-1;i<points.Length;j=i++){var a=points[i];var b=points[j];if((a.z>z)!=(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}return inside;}
    static bool InOutline(Layout p,float x,float z){foreach(var loop in p.loops)if(InPolygon(x,z,loop.points))return true;return false;}
    class RouteEdge {public int a,b;public List<Waypoint> route;}
    static readonly Dictionary<Layout,Dictionary<string,List<Vector2>>> routeCache=new Dictionary<Layout,Dictionary<string,List<Vector2>>>();
    static List<Waypoint> PlanRoute(Layout[] plans,Vector2 from,int f,Vector2 to,int t)
    {
        if(f==t){var direct=new List<Waypoint>();foreach(var p in FindPath(plans[f],from,to))direct.Add(new Waypoint(p,f,plans[f].elevation));return direct;}
        var nodes=new List<Waypoint>{new Waypoint(from,f),new Waypoint(to,t)};var edges=new List<RouteEdge>();
        foreach(var flight in plans[0].flights){
            int a=nodes.Count,b=a+1;var route=flight.route;nodes.Add(new Waypoint(XZ(route[0]),flight.lower));nodes.Add(new Waypoint(XZ(route[route.Length-1]),flight.upper));
            var forward=new List<Waypoint>();
            for(int i=1;i<route.Length;i++){var start=route[i-1];var end=route[i];int n=Mathf.CeilToInt(Vector2.Distance(XZ(start),XZ(end))/.3f);for(int k=1;k<=n;k++){float v=(float)k/n;forward.Add(new Waypoint(Vector2.Lerp(XZ(start),XZ(end),v),k==n&&i==route.Length-1?flight.upper:flight.lower,Mathf.Lerp(start.y,end.y,v)));}}
            var reverse=new List<Waypoint>();for(int i=forward.Count-1;i>=0;i--)reverse.Add(new Waypoint(forward[i].position,flight.upper,forward[i].y));
            forward.Add(new Waypoint(XZ(route[route.Length-1])+Vector2.down*.8f,flight.upper,route[route.Length-1].y));
            reverse.Add(new Waypoint(XZ(route[0])+Vector2.down*.8f,flight.lower,route[0].y));
            edges.Add(new RouteEdge{a=a,b=b,route=forward});edges.Add(new RouteEdge{a=b,b=a,route=reverse});
        }
        for(int a=0;a<nodes.Count;a++)for(int b=0;b<nodes.Count;b++)if(a!=b&&nodes[a].floor==nodes[b].floor){
            var plan=plans[nodes[a].floor];List<Vector2> path;
            if(a>=2&&b>=2){if(!routeCache.TryGetValue(plan,out var cache))routeCache[plan]=cache=new Dictionary<string,List<Vector2>>();string key=a+":"+b;if(!cache.TryGetValue(key,out path))cache[key]=path=FindPath(plan,nodes[a].position,nodes[b].position);}
            else path=FindPath(plan,nodes[a].position,nodes[b].position);
            if(path.Count==0&&Vector2.Distance(nodes[a].position,nodes[b].position)>.3f)continue;
            var waypoints=new List<Waypoint>();foreach(var p in path)waypoints.Add(new Waypoint(p,plan.id,plan.elevation));if(waypoints.Count==0)waypoints.Add(new Waypoint(nodes[b].position,plan.id,plan.elevation));
            edges.Add(new RouteEdge{a=a,b=b,route=waypoints});
        }
        var distance=new float[nodes.Count];var previous=new RouteEdge[nodes.Count];var visited=new bool[nodes.Count];for(int i=0;i<distance.Length;i++)distance[i]=float.PositiveInfinity;distance[0]=0;
        for(int count=0;count<nodes.Count;count++){int a=-1;for(int i=0;i<nodes.Count;i++)if(!visited[i]&&(a<0||distance[i]<distance[a]))a=i;if(a<0||float.IsInfinity(distance[a])||a==1)break;visited[a]=true;foreach(var edge in edges)if(edge.a==a&&distance[a]+edge.route.Count<distance[edge.b]){distance[edge.b]=distance[a]+edge.route.Count;previous[edge.b]=edge;}}
        var result=new List<Waypoint>();if(previous[1]==null)return result;for(int n=1;n!=0;){var edge=previous[n];result.InsertRange(0,edge.route);n=edge.a;}return result;
    }
    public static void MoveInterior(Layout[] plans,ref Vector2 position,ref float y,ref int level,ref Flight active,float dx,float dz)
    {
        int count=Mathf.Max(1,Mathf.CeilToInt(new Vector2(dx,dz).magnitude/.09f));
        for(int i=0;i<count;i++){
            if(dx!=0)InteriorAttempt(plans,ref position,ref y,ref level,ref active,position.x+dx/count,position.y);
            if(dz!=0)InteriorAttempt(plans,ref position,ref y,ref level,ref active,position.x,position.y+dz/count);
        }
    }
    static bool InteriorAttempt(Layout[] plans,ref Vector2 p,ref float y,ref int level,ref Flight active,float x,float z)
    {
        foreach(var plan in plans)foreach(var rail in plan.rails)for(int i=1;i<rail.points.Length;i++){
            var a=rail.points[i-1];var b=rail.points[i];var d=XZ(b)-XZ(a);float t=Mathf.Clamp01(Vector2.Dot(new Vector2(x,z)-XZ(a),d)/d.sqrMagnitude),height=Mathf.Lerp(a.y,b.y,t);
            if(y+.65f>height-.16f&&y+.65f<height+1.085f&&SegmentDistance(x,z,a,b)<.38f)return false;
        }
        foreach(var flight in plans[0].flights){
            if(active!=null?flight!=active:flight.lower!=level&&flight.upper!=level)continue;
            float nearest=float.PositiveInfinity,hit=0;
            for(int i=1;i<flight.route.Length;i++){var a=flight.route[i-1];var b=flight.route[i];var d=XZ(b)-XZ(a);float t=Mathf.Clamp01(Vector2.Dot(new Vector2(x,z)-XZ(a),d)/Mathf.Max(.000001f,d.sqrMagnitude));float distance=SegmentDistance(x,z,a,b),height=Mathf.Lerp(a.y,b.y,t);if(distance<.27f&&Mathf.Abs(height-y)<.38f&&distance<nearest){nearest=distance;hit=height;}}
            if(!float.IsInfinity(nearest)){p=new Vector2(x,z);y=hit;active=flight;return true;}
        }
        if(active!=null){foreach(int index in new[]{0,active.route.Length-1}){var end=active.route[index];int next=index==0?active.lower:active.upper;if(Vector2.Distance(new Vector2(x,z),XZ(end))<1.5f&&Mathf.Abs(y-end.y)<.3f&&IndoorClear(plans[next],x,z)){p=new Vector2(x,z);y=end.y;level=next;active=null;return true;}}return false;}
        if(!IndoorClear(plans[level],x,z))return false;p=new Vector2(x,z);y=plans[level].elevation;return true;
    }
    float JumpCeiling(Vector2 p,float y)
    {
        float ceiling=float.PositiveInfinity;
        foreach(var plan in floors){
            foreach(var offset in new[]{Vector2.zero,new Vector2(-.27f,-.27f),new Vector2(-.27f,.27f),new Vector2(.27f,-.27f),new Vector2(.27f,.27f)}){
                float x=p.x+offset.x,z=p.y+offset.y;if(!InOutline(plan,x,z))continue;
                for(int side=0;side<2;side++){float height=plan.elevation+(side==0?-.2f:plan.id==2?2.9f:3.8f);if(height<=y+.1f)continue;bool open=false;
                    foreach(var flight in plan.flights)if((side==0?flight.upper:flight.lower)==plan.id){int si=Array.FindIndex(plan.stairs,s=>s.id==flight.id);if(si<0)continue;var shaft=plan.shafts[si];if(x>shaft.minX&&x<shaft.maxX&&z>shaft.minZ&&z<shaft.maxZ)open=true;}
                    if(!open)ceiling=Mathf.Min(ceiling,height);
                }
            }
            foreach(var door in plan.doorways){float height=plan.elevation+door.height;var a=new Point{x=door.x-door.dx*door.width/2,z=door.z-door.dz*door.width/2};var b=new Point{x=door.x+door.dx*door.width/2,z=door.z+door.dz*door.width/2};if(height>y+.1f&&SegmentDistance(p.x,p.y,a,b)<.34f+door.depth/2)ceiling=Mathf.Min(ceiling,height);}
            foreach(var h in plan.exitHeaders)if(plan.elevation+h.height>y+.1f&&SegmentDistance(p.x,p.y,h.a,h.b)<.5f)ceiling=Mathf.Min(ceiling,plan.elevation+h.height);
        }return ceiling;
    }
    void ResetJump(){jumpOffset=jumpVelocity=0;jumping=perched=false;playerFlight=null;verticalTrend=0;}
    void Jump(){if(jumping||paused||map||help||viewingArt!=null)return;if(!Indoors){float support=OutdoorHeight(player,playerY);if(support>=playerY&&support<=playerY+.48f&&HeightClear(player,playerY,support))playerY=support;if(Mathf.Abs(playerY-JumpSupport(player,playerY))>.08f)return;}jumping=true;jumpVelocity=7.8f;}
    void MovePlayer(Vector2 step,float dt)
    {
        int previousFloor=floor;
        if(Indoors){
            int count=Mathf.Max(1,Mathf.CeilToInt(dt*120),Mathf.CeilToInt(step.magnitude/.08f));float delta=dt/count;
            for(int i=0;i<count;i++){
                playerY-=jumpOffset;var next=player;float nextY=playerY;int nextFloor=floor;var flight=playerFlight;
                MoveInterior(floors,ref next,ref nextY,ref nextFloor,ref flight,step.x/count,step.y/count);
                if(!jumping||nextY+jumpOffset+1.8f<=JumpCeiling(next,nextY)+.001f){player=next;playerY=nextY;floor=nextFloor;playerFlight=flight;}
                if(jumping){jumpOffset+=jumpVelocity*delta-9*delta*delta;jumpVelocity-=18*delta;float limit=Mathf.Max(0,JumpCeiling(player,playerY)-playerY-1.8f);if(jumpOffset>limit){jumpOffset=limit;jumpVelocity=Mathf.Min(jumpVelocity,0);}if(jumpOffset<=0){jumpOffset=jumpVelocity=0;jumping=false;}}playerY+=jumpOffset;
            }
            if(previousFloor!=floor)ShowFloor();
        }else MoveOutside(step,dt);
    }
    class SpatialObstacles
    {
        readonly Dictionary<Vector2Int,List<Obstacle>> cells=new Dictionary<Vector2Int,List<Obstacle>>();
        public SpatialObstacles(Obstacle[] source){foreach(var b in source)for(int x=Mathf.FloorToInt((b.minX-.4f)/12);x<=Mathf.FloorToInt((b.maxX+.4f)/12);x++)for(int z=Mathf.FloorToInt((b.minZ-.4f)/12);z<=Mathf.FloorToInt((b.maxZ+.4f)/12);z++){var key=new Vector2Int(x,z);if(!cells.TryGetValue(key,out var list))cells[key]=list=new List<Obstacle>();list.Add(b);}}
        static readonly List<Obstacle> empty=new List<Obstacle>();
        public List<Obstacle> At(Vector2 p)=>cells.TryGetValue(new Vector2Int(Mathf.FloorToInt(p.x/12),Mathf.FloorToInt(p.y/12)),out var list)?list:empty;
    }
    SpatialObstacles outsideIndex,supportIndex;CompactJumpIndex jumpIndex;int indexedPeriod=-1;bool indexedTrees;
    void EnsureOutside(){if(jumpIndex==null)jumpIndex=new CompactJumpIndex(collisionText.bytes,manifest.jumpBounds);if(indexedPeriod==periodIndex&&indexedTrees==trees&&outsideIndex!=null)return;var p=manifest.periods[periodIndex];outsideIndex=new SpatialObstacles(trees?p.obstacles:p.obstaclesNoTrees);var supports=new Obstacle[p.supportIds.Length];for(int i=0;i<supports.Length;i++)supports[i]=manifest.supportLibrary[p.supportIds[i]];supportIndex=new SpatialObstacles(supports);indexedPeriod=periodIndex;indexedTrees=trees;jumpIndex.period=periodIndex;jumpIndex.trees=trees;}
    bool OutsideClearAt(Vector2 p,float y){EnsureOutside();var b=manifest.playBounds;if(p.x<=b.minX||p.x>=b.maxX||p.y<=b.minZ||p.y>=b.maxZ)return false;float bucket=Mathf.Round(y*4)/4;foreach(var o in outsideIndex.At(p))if(o.maxY>bucket+.35f&&o.minY<bucket+1.5f&&Contains(o,p.x,p.y,.27f))return false;return true;}
    bool HeightClear(Vector2 p,float a,float b){for(int i=Mathf.RoundToInt(Mathf.Min(a,b)*4);i<=Mathf.RoundToInt(Mathf.Max(a,b)*4);i++)if(!OutsideClearAt(p,i/4f))return false;return true;}
    float OutdoorHeight(Vector2 p,float y,float trend=0){
        EnsureOutside();Obstacle surface=null;foreach(var s in manifest.periods[periodIndex].walkSurfaces)if(Contains(s,p.x,p.y,.0000001f)){surface=s;break;}
        var candidates=new List<float>();foreach(var s in supportIndex.At(p))if(s.height<=y+.48f&&s.height>=y-2.1f&&Contains(s,p.x,p.y,.0000001f))candidates.Add(s.height);
        if(surface!=null&&surface.height<=y+.48f)candidates.Add(surface.height);
        bool rear=Mathf.Abs(Mathf.Abs(p.x)-21.9f)<.75f&&p.y>-30.8f&&p.y<-24.8f&&y>2.5f;
        if(rear&&trend<0){var down=candidates.FindAll(h=>h<=y+.025f&&h>=y-.5f);if(down.Count>0)candidates=down;}
        if(rear&&trend>0){var up=candidates.FindAll(h=>h>=y-.025f);if(up.Count>0)candidates=up;}
        if(candidates.Count==0)return surface?.height??0;candidates.Sort();if(rear&&trend>0)candidates.Sort((a,b)=>Mathf.Abs(a-y).CompareTo(Mathf.Abs(b-y)));else candidates.Reverse();return candidates[0];
    }
    float JumpSupport(Vector2 p,float y){float height=OutdoorHeight(p,y-.48f+.000001f);foreach(var b in jumpIndex.At(p))if(b.maxY<=y+.025f&&Contains(b,p.x,p.y,.27f))height=Mathf.Max(height,b.maxY);return height;}
    bool JumpClear(Vector2 p,float y){if(OutdoorHeight(p,y-.48f+.000001f)>y+.025f)return false;var bounds=manifest.playBounds;if(p.x<=bounds.minX||p.x>=bounds.maxX||p.y<=bounds.minZ||p.y>=bounds.maxZ)return false;foreach(var b in jumpIndex.At(p))if(b.maxY>y+.025f&&b.minY<y+1.79f&&Contains(b,p.x,p.y,.27f))return false;return true;}
    Vector2 safeOutside;float safeOutsideY;bool hasSafeOutside;
    void MoveOutside(Vector2 move,float dt){
        EnsureOutside();int count=Mathf.Max(1,Mathf.CeilToInt(move.magnitude/.08f),jumping||perched?Mathf.CeilToInt(dt*120):1);float delta=dt/count;
        if(!jumping&&!perched&&!OutsideClearAt(player,playerY)){
            if(hasSafeOutside&&Vector2.Distance(player,safeOutside)<.8f&&HeightClear(safeOutside,playerY,safeOutsideY)){player=safeOutside;playerY=safeOutsideY;}
            else {var blocking=outsideIndex.At(player).FindAll(b=>b.maxY>playerY+.35f&&b.minY<playerY+1.5f&&Contains(b,player.x,player.y,.27f));bool found=false;for(float radius=.04f;radius<=.64f&&!found;radius+=.04f)for(int angle=0;angle<32&&!found;angle++){var p=player+new Vector2(Mathf.Cos(angle*Mathf.PI/16),Mathf.Sin(angle*Mathf.PI/16))*radius;float y=OutdoorHeight(p,playerY);if(y>playerY+.48f||!HeightClear(p,playerY,y))continue;bool clear=true;for(int i=1;i<=16&&clear;i++){var q=Vector2.Lerp(player,p,i/16f);foreach(var b in outsideIndex.At(q))if(!blocking.Contains(b)&&b.maxY>playerY+.35f&&b.minY<playerY+1.5f&&Contains(b,q.x,q.y,.27f)){clear=false;break;}}if(clear){player=p;playerY=y;found=true;}}}
        }
        for(int i=0;i<count;i++){
            if(jumping||perched){if(jumping){float old=playerY,y=old+jumpVelocity*delta-9*delta*delta;jumpVelocity-=18*delta;if(y>old){foreach(var b in jumpIndex.At(player))if(Contains(b,player.x,player.y,.27f)&&b.minY>=old+1.79f&&b.minY<y+1.8f){y=Mathf.Max(old,b.minY-1.8f);jumpVelocity=0;}}else{float support=JumpSupport(player,old);if(y<=support){y=support;jumpVelocity=0;jumping=false;}}playerY=y;}
                var p=player+new Vector2(move.x/count,0);if(JumpClear(p,playerY))player=p;p=player+new Vector2(0,move.y/count);if(JumpClear(p,playerY))player=p;
                if(!jumping&&JumpSupport(player,playerY)<playerY-.025f){jumping=true;jumpVelocity=0;}perched=!jumping&&playerY>OutdoorHeight(player,playerY-.48f+.000001f)+.025f;continue;
            }
            foreach(var step in new[]{new Vector2(move.x/count,0),new Vector2(0,move.y/count)}){if(step==Vector2.zero)continue;var p=player+step;if(!OutsideClearAt(p,playerY))continue;float y=OutdoorHeight(p,playerY,verticalTrend),old=playerY;if(y>old+.48f||!HeightClear(p,old,y))continue;player=p;playerY=y<old-.5f?Mathf.Max(y,old-5*delta):y;if(Mathf.Abs(playerY-old)>.05f)verticalTrend=Mathf.Sign(playerY-old);}
            if(move==Vector2.zero){float y=OutdoorHeight(player,playerY,verticalTrend);if(y<playerY&&HeightClear(player,playerY,y))playerY=Mathf.Max(y,playerY-5*delta);}
        }
        if(OutsideClearAt(player,playerY)){safeOutside=player;safeOutsideY=playerY;hasSafeOutside=true;}
    }
    Exit NearbyDoor(out int level){level=floor;if(Indoors){if(Mathf.Abs(playerY-layout.elevation)>.5f)return null;foreach(var e in layout.exits)if(Vector2.Distance(player,XZ(e.inside))<1.6f&&LineOfSight(layout,player,XZ(e.inside)))return e;return null;}float nearest=1.6f;Exit result=null;foreach(var plan in floors)foreach(var e in plan.exits){float distance=Vector3.Distance(World(player,playerY),World(XZ(e.destination),e.destination.y));if(distance<nearest){nearest=distance;result=e;level=plan.id;}}return result;}
    void UseDoor(Exit exit,int level){
        bool wasInside=Indoors;ResetJump();hasSafeOutside=false;RecordDoor(exit,level,true);
        if(wasInside){lastDoor=exit;player=XZ(exit.destination);playerY=exit.destination.y;escapeOutside=mode==Mode.Inside;exploreInterior=false;mode=Mode.Outside;}
        else{player=XZ(exit.inside);floor=level;playerY=floors[floor].elevation;if(escapeOutside){mode=Mode.Inside;escapeOutside=false;}else exploreInterior=true;}
        int dx=exit.axis=="x"?exit.facing:0,dz=exit.axis=="z"?exit.facing:0;yaw=Mathf.Atan2(wasInside?-dx:dx,wasInside?-dz:dz);pitch=0;hold=0;spotted=false;stairLatch=true;
        outside.SetActive(!Indoors);inside.SetActive(Indoors);artRoot.SetActive(Indoors);portal.SetActive(false);ShowFloor();SetLighting(Indoors);PositionView();ObserveNotebook();foreach(var e in enemies)PositionEnemy(e);
    }
}
