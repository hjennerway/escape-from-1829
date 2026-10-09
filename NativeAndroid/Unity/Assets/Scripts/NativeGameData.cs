using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    [Serializable] public class Point { public float x, y, z, yaw; }
    [Serializable] public class Exit : Point { public string id,name, axis; public int facing;public Point inside,destination; }
    [Serializable] public class Stair : Point { public string id,name, direction;public Point[] points; }
    [Serializable] public class Polygon { public Point[] points; }
    [Serializable] public class Wall { public Point a,b;public float height; }
    [Serializable] public class Doorway : Point { public string roomId;public float dx,dz,width,height,depth; }
    [Serializable] public class Room { public string id,number,name;public Point[] points;public Point label;public float width; }
    [Serializable] public class Flight { public string id;public int lower,upper;public Point[] route;public Point lowerDeparture,upperDeparture;[NonSerialized] public bool blocked; }
    [Serializable] public class Furnishing : Point {public float width,depth,height,rotation;}
    [Serializable] public class Navigation { public Layout[] floors;public Flight[] flights; }
    [Serializable] public class Spawn : Point { public string name; public int type; }
    [Serializable] public class Layout
    {
        public int width, height, galleryZ; public float cellSize;
        public int[] cells; public Point spawn; public Exit[] exits;
        public Stair[] stairs; public Point[] patrol; public Spawn[] enemies;
        public int id;public string name;public float elevation;public Point origin;
        public Polygon[] loops,rails;public Wall[] walls,exitHeaders;public Bounds[] shafts;
        public Doorway[] doorways;public Room[] rooms,corridors;public Point[] safeSpawns,lamps;
        public Furnishing[] furniture,roomDoors;
        [NonSerialized] public Flight[] flights;
    }
    [Serializable] public class Lamp : Point { }
    [Serializable] public class Bounds { public float minX, maxX, minZ, maxZ; }
    [Serializable] public class Obstacle : Bounds { public Point[] corners; public float height, grade,minY,maxY; }
    [Serializable] public class Stats { public int batches; public long triangles; }
    [Serializable] public class MeshFlag { public bool tree,shadow; public int group, level; }
    [Serializable] public class DetailGroup { public float x,y,z,radius,windowHeight; }
    [Serializable] public class BuildingBounds : Bounds { public int index,selectionMesh; public float minY,maxY; }
    [Serializable] public class Period
    {
        public int year; public string title,description; public int[] meshes;
        public Obstacle[] obstacles,obstaclesNoTrees,walkSurfaces;public int[] supportIds; public BuildingBounds[] buildings;public Lamp[] lamps;
    }
    [Serializable] public class Photo { public string src,caption; }
    [Serializable] public class Dates { public string section; public int built,demolished; }
    [Serializable] public class Building { public string id,name; public string[] locations,sections; public Photo[] photos,contextPhotos; public Dates[] dates; }
    [Serializable] public class Location { public string key; public float[] position,target,walkPosition,walkTarget; public float fov; }
    [Serializable] public class Artwork { public string src,title,note,source; public bool imageOnly; }
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
        public int jumpBounds,escapeJumpBounds;public Obstacle[] supportLibrary;
        public EscapeScenario escape;public Stats escapeStats,fittings;
        public string[] outdoorChunks;
    }
    public struct Waypoint { public Vector2 position; public int floor;public float y; public Waypoint(Vector2 p,int f,float height=0) { position=p;floor=f;y=height; } }
    public static Layout[] MakeFloors(Navigation navigation)
    {
        if(navigation.floors==null||navigation.floors.Length!=4)throw new Exception("Re-export the reviewed four-level plan.");
        foreach(var floor in navigation.floors)floor.flights=navigation.flights;
        return navigation.floors;
    }
    static int Cell(float coordinate,float size)=>Mathf.FloorToInt(coordinate/size+.5f);
    public static bool IndoorClear(Layout plan,float x,float z,float radius=.34f)
    {
        bool Inside(float px,float pz){foreach(var loop in plan.loops)if(InPolygon(px,pz,loop.points))return true;return false;}
        if(!Inside(x,z))return false;
        for(int i=-1;i<=1;i+=2)for(int j=-1;j<=1;j+=2)if(!Inside(x+i*radius,z+j*radius))return false;
        foreach(var shaft in plan.shafts)if(x>shaft.minX-radius&&x<shaft.maxX+radius&&z>shaft.minZ-radius&&z<shaft.maxZ+radius)return false;
        foreach(var wall in plan.walls)if(SegmentDistance(x,z,wall.a,wall.b)<radius+.09f)return false;
        foreach(var item in plan.furniture??Array.Empty<Furnishing>())if(FurnitureContains(item,x,z,radius))return false;
        foreach(var item in plan.roomDoors??Array.Empty<Furnishing>())if(FurnitureContains(item,x,z,radius))return false;
        return true;
    }
    static bool FurnitureContains(Furnishing item,float x,float z,float radius){float c=Mathf.Cos(item.rotation),s=Mathf.Sin(item.rotation),dx=x-item.x,dz=z-item.z,u=c*dx-s*dz,v=s*dx+c*dz;float a=Mathf.Max(0,Mathf.Abs(u)-item.width/2),b=Mathf.Max(0,Mathf.Abs(v)-item.depth/2);return a*a+b*b<=radius*radius;}
    public static bool OutdoorClear(Manifest data,float x,float z,int periodIndex=8,bool trees=true)
    {
        var b=data.playBounds;if(x<=b.minX||x>=b.maxX||z<=b.minZ||z>=b.maxZ)return false;
        var period=data.periods[periodIndex];var obstacles=trees?period.obstacles:period.obstaclesNoTrees??period.obstacles;
        foreach(var o in obstacles)if(o.maxY>.35f&&o.minY<1.5f&&Contains(o,x,z,.27f))return false;
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
        var result=new List<Vector2>();int ax=Cell(from.x-plan.origin.x,plan.cellSize),az=Cell(from.y-plan.origin.z,plan.cellSize),bx=Cell(to.x-plan.origin.x,plan.cellSize),bz=Cell(to.y-plan.origin.z,plan.cellSize);
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
        for(int n=end;n!=start;n=previous[n])result.Add(new Vector2(plan.origin.x+n%plan.width*plan.cellSize,plan.origin.z+n/plan.width*plan.cellSize));
        result.Reverse();if(result.Count>0)result[result.Count-1]=to;return result;
    }
    public static List<Waypoint> RouteBetweenFloors(Layout[] plans,Vector2 from,int fromFloor,Vector2 to,int toFloor)
    {
        return PlanRoute(plans,from,fromFloor,to,toFloor);
    }
    static Vector2 Position(Point p,Layout plan)=>new Vector2(p.x*plan.cellSize,p.z*plan.cellSize);
    bool LineOfSight(Layout plan,Vector2 a,Vector2 b)
    {
        int count=Mathf.CeilToInt(Vector2.Distance(a,b)/.35f);
        for(int i=1;i<count;i++){var p=Vector2.Lerp(a,b,(float)i/count);if(!InOutline(plan,p.x,p.y))return false;foreach(var w in plan.walls)if(SegmentDistance(p.x,p.y,w.a,w.b)<.11f)return false;foreach(var item in plan.furniture??Array.Empty<Furnishing>())if(item.y<1.5f&&item.y+item.height>1.5f&&FurnitureContains(item,p.x,p.y,.02f))return false;}return true;
    }
    static Vector3 World(Vector2 p,float y)=>new Vector3(p.x,y,-p.y);
}
