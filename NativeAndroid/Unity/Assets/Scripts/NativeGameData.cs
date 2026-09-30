using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    [Serializable] public class Point { public float x, z, yaw; }
    [Serializable] public class Exit : Point { public string name, axis; public int facing; }
    [Serializable] public class Stair : Point { public string name, direction; }
    [Serializable] public class Spawn : Point { public string name; public int type; }
    [Serializable] public class Layout
    {
        public int width, height, galleryZ; public float cellSize;
        public int[] cells; public Point spawn; public Exit[] exits;
        public Stair[] stairs; public Point[] patrol; public Spawn[] enemies;
        public UpperLayout upperFloor;
    }
    // JsonUtility cannot populate a self-recursive layout class reliably.
    [Serializable] public class UpperLayout { public int[] cells;public Point spawn;public Exit[] exits;public Point[] patrol; }
    [Serializable] public class Lamp : Point { public float y; }
    [Serializable] public class Bounds { public float minX, maxX, minZ, maxZ; }
    [Serializable] public class Obstacle : Bounds { public Point[] corners; public float height, grade; }
    [Serializable] public class Stats { public int batches; public long triangles; }
    [Serializable] public class MeshFlag { public bool tree,shadow; public int group, level; }
    [Serializable] public class DetailGroup { public float x,y,z,radius,windowHeight; }
    [Serializable] public class BuildingBounds : Bounds { public int index,selectionMesh; public float minY,maxY; }
    [Serializable] public class Period
    {
        public int year; public string title,description; public int[] meshes;
        public Obstacle[] obstacles,obstaclesNoTrees,walkSurfaces; public BuildingBounds[] buildings;public Lamp[] lamps;
    }
    [Serializable] public class Photo { public string src,caption; }
    [Serializable] public class Dates { public string section; public int built,demolished; }
    [Serializable] public class Building { public string id,name; public string[] locations,sections; public Photo[] photos,contextPhotos; public Dates[] dates; }
    [Serializable] public class Location { public string key; public float[] position,target,walkPosition,walkTarget; public float fov; }
    [Serializable] public class Artwork { public string src,title; public bool imageOnly; }
    [Serializable] public class WallArt : Point { public int floor,index; public float rotation; }
    [Serializable] public class EarthAnchor { public double latitude,longitude; public float x,z; }
    [Serializable] public class Diagnosis { public string name,treatment; }
    [Serializable] public class Cause { public string name,description; }
    [Serializable] public class Manifest
    {
        public int schema,defaultPeriod; public float floorHeight; public string sourceHash;
        public Bounds playBounds; public Stats outdoor,indoor,guard,selection;
        public Period[] periods; public MeshFlag[] meshFlags; public DetailGroup[] detailGroups;
        public Building[] buildings; public Location[] locations; public Artwork[] art; public WallArt[] wallArt;
        public EarthAnchor earthAnchor; public Point[] perimeter; public Diagnosis[] diagnoses; public Cause[] causes;
    }
    public struct Waypoint { public Vector2 position; public int floor; public Waypoint(Vector2 p,int f) { position=p;floor=f; } }
    public static Layout[] MakeFloors(Layout ground)
    {
        if(ground.upperFloor==null)throw new Exception("Upper floor is missing.");
        var u=ground.upperFloor;
        var upper=new Layout { width=ground.width,height=ground.height,cellSize=ground.cellSize,galleryZ=ground.galleryZ,
            cells=u.cells??ground.cells,spawn=ground.spawn,exits=u.exits??new Exit[0],stairs=ground.stairs,
            patrol=u.patrol??ground.patrol,enemies=ground.enemies };
        if(u.spawn!=null&&IndoorClear(upper,u.spawn.x*upper.cellSize,u.spawn.z*upper.cellSize))upper.spawn=u.spawn;
        return new[]{ground,upper};
    }
    static int Cell(float coordinate,float size)=>Mathf.FloorToInt(coordinate/size+.5f);
    public static bool IndoorClear(Layout plan,float x,float z,float radius=.34f)
    {
        for(int i=-1;i<=1;i+=2)for(int j=-1;j<=1;j+=2){
            int cx=Cell(x+i*radius,plan.cellSize),cz=Cell(z+j*radius,plan.cellSize);
            if(cx<0||cz<0||cx>=plan.width||cz>=plan.height||plan.cells[cz*plan.width+cx]!=1)return false;
        }return true;
    }
    public static bool OutdoorClear(Manifest data,float x,float z,int periodIndex=8,bool trees=true)
    {
        var b=data.playBounds;if(x<=b.minX||x>=b.maxX||z<=b.minZ||z>=b.maxZ)return false;
        var period=data.periods[periodIndex];var obstacles=trees?period.obstacles:period.obstaclesNoTrees??period.obstacles;
        foreach(var o in obstacles)if(Contains(o,x,z,.4f))return false;
        return true;
    }
    static bool Contains(Obstacle b,float x,float z,float padding)
    {
        if(x<=b.minX-padding||x>=b.maxX+padding||z<=b.minZ-padding||z>=b.maxZ+padding)return false;
        if(b.corners==null||b.corners.Length==0)return true;
        bool inside=false;
        for(int i=0,j=b.corners.Length-1;i<b.corners.Length;j=i++){
            var a=b.corners[j];var c=b.corners[i];float dx=c.x-a.x,dz=c.z-a.z;
            float t=Mathf.Clamp01(((x-a.x)*dx+(z-a.z)*dz)/Mathf.Max(.000001f,dx*dx+dz*dz));
            if(Vector2.Distance(new Vector2(x,z),new Vector2(a.x+t*dx,a.z+t*dz))<padding)return true;
            if((a.z>z)!=(c.z>z)&&x<(c.x-a.x)*(z-a.z)/(c.z-a.z)+a.x)inside=!inside;
        }return inside;
    }
    public static List<Vector2> FindPath(Layout plan,Vector2 from,Vector2 to)
    {
        var result=new List<Vector2>();int ax=Cell(from.x,plan.cellSize),az=Cell(from.y,plan.cellSize),bx=Cell(to.x,plan.cellSize),bz=Cell(to.y,plan.cellSize);
        if(ax<0||az<0||bx<0||bz<0||ax>=plan.width||bx>=plan.width||az>=plan.height||bz>=plan.height)return result;
        int start=az*plan.width+ax,end=bz*plan.width+bx;
        if(plan.cells[start]!=1||plan.cells[end]!=1)return result;
        var previous=new int[plan.cells.Length];for(int i=0;i<previous.Length;i++)previous[i]=-1;
        var queue=new Queue<int>();previous[start]=start;queue.Enqueue(start);int[] dx={1,-1,0,0},dz={0,0,1,-1};
        while(queue.Count>0){
            int index=queue.Dequeue();if(index==end)break;int x=index%plan.width,z=index/plan.width;
            for(int d=0;d<4;d++){int nx=x+dx[d],nz=z+dz[d];if(nx<0||nz<0||nx>=plan.width||nz>=plan.height)continue;
                int next=nz*plan.width+nx;if(plan.cells[next]!=1||previous[next]>=0)continue;previous[next]=index;queue.Enqueue(next);}
        }
        if(previous[end]<0)return result;
        for(int n=end;n!=start;n=previous[n])result.Add(new Vector2(n%plan.width*plan.cellSize,n/plan.width*plan.cellSize));
        result.Reverse();return result;
    }
    public static List<Waypoint> RouteBetweenFloors(Layout[] plans,Vector2 from,int fromFloor,Vector2 to,int toFloor)
    {
        var best=new List<Waypoint>();
        if(fromFloor==toFloor){foreach(var p in FindPath(plans[fromFloor],from,to))best.Add(new Waypoint(p,fromFloor));return best;}
        foreach(var stair in plans[fromFloor].stairs){
            var at=new Vector2(stair.x*plans[fromFloor].cellSize,stair.z*plans[fromFloor].cellSize);
            var first=FindPath(plans[fromFloor],from,at);var last=FindPath(plans[toFloor],at,to);
            if((first.Count==0&&(Cell(from.x,plans[fromFloor].cellSize)!=Cell(at.x,plans[fromFloor].cellSize)||Cell(from.y,plans[fromFloor].cellSize)!=Cell(at.y,plans[fromFloor].cellSize)))||
                (last.Count==0&&(Cell(to.x,plans[toFloor].cellSize)!=Cell(at.x,plans[toFloor].cellSize)||Cell(to.y,plans[toFloor].cellSize)!=Cell(at.y,plans[toFloor].cellSize))))continue;
            var route=new List<Waypoint>();foreach(var p in first)route.Add(new Waypoint(p,fromFloor));
            route.Add(new Waypoint(at,fromFloor));route.Add(new Waypoint(at,toFloor));foreach(var p in last)route.Add(new Waypoint(p,toFloor));
            if(best.Count==0||route.Count<best.Count)best=route;
        }return best;
    }
    static Vector2 Position(Point p,Layout plan)=>new Vector2(p.x*plan.cellSize,p.z*plan.cellSize);
    bool LineOfSight(Layout plan,Vector2 a,Vector2 b)
    {
        int count=Mathf.CeilToInt(Vector2.Distance(a,b)/.35f);
        for(int i=1;i<count;i++){var p=Vector2.Lerp(a,b,(float)i/count);if(!IndoorClear(plan,p.x,p.y,.02f))return false;}return true;
    }
    static Vector3 World(Vector2 p,float y)=>new Vector3(p.x,y,-p.y);
}
