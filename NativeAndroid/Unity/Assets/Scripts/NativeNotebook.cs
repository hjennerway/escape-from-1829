using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    class JournalNote {public string id,title,text,source;public bool deduction;}
    readonly List<JournalNote> notes=new List<JournalNote>();
    readonly HashSet<int> visitedLevels=new HashSet<int>();
    readonly HashSet<string> usedDoors=new HashSet<string>(),visitedPlaces=new HashSet<string>(),visitedStairs=new HashSet<string>();
    readonly Dictionary<int,HashSet<int>> discovered=new Dictionary<int,HashSet<int>>();
    readonly Dictionary<int,Texture2D> mapTextures=new Dictionary<int,Texture2D>();
    readonly Dictionary<int,Color32[]> mapPixels=new Dictionary<int,Color32[]>();
    int notebookLevel,notesRead;bool foundEast,foundWest;Vector2 notebookScroll,lastObserved=new Vector2(10000,10000);int lastObservedFloor=-1;
    readonly Rect notebookClose=new Rect(1088,112,104,44),notebookPrevious=new Rect(920,612,56,44),notebookNext=new Rect(984,612,56,44);
    int notePage;
    void InitializeNotebook(){for(int f=0;f<=floors.Length;f++){int width=f==floors.Length?192:floors[f].width,height=f==floors.Length?134:floors[f].height;discovered[f]=new HashSet<int>();var tex=new Texture2D(width,height,TextureFormat.RGBA32,false);tex.filterMode=FilterMode.Point;tex.wrapMode=TextureWrapMode.Clamp;mapTextures[f]=tex;mapPixels[f]=new Color32[width*height];}ResetNotebook();}
    void ResetNotebook(){notes.Clear();visitedLevels.Clear();usedDoors.Clear();visitedPlaces.Clear();visitedStairs.Clear();foundEast=foundWest=false;notesRead=notePage=0;lastObservedFloor=-1;lastObserved=new Vector2(10000,10000);foreach(var pair in discovered){pair.Value.Clear();Array.Clear(mapPixels[pair.Key],0,mapPixels[pair.Key].Length);mapTextures[pair.Key].SetPixels32(mapPixels[pair.Key]);mapTextures[pair.Key].Apply();}}
    void AddNote(string id,string title,string content,string source,bool deduction=false){int at=notes.FindIndex(n=>n.id==id);if(at>=0){if(notes[at].text==content)return;notes.RemoveAt(at);}notes.Insert(0,new JournalNote{id=id,title=title,text=content,source=source,deduction=deduction});}
    void RecordDoor(Exit door,int level,bool used){if(!Escaping)return;string key=level+":"+door.id;if(used)usedDoors.Add(key);bool tested=usedDoors.Contains(key);AddNote("door:"+key,door.name,tested?"I used this door and reached the outside. I can return through the same door.":"I found a marked outside door here. Its landing or path is still untested.",floors[level].name+" · "+door.id+" · "+(tested?"tested route":"observed sign"));}
    void RecordArtwork(WallArt art){if(!Escaping)return;var item=manifest.art[art.index];AddNote("art:"+item.src,item.title==""?"Wall artwork":item.title,item.note,item.source);}
    bool NotebookSight(Vector2 a,Vector2 b,Layout plan){var d=b-a;foreach(var w in plan.walls){var c=XZ(w.a);var edge=XZ(w.b)-c;float cross=d.x*edge.y-d.y*edge.x;if(Mathf.Abs(cross)<.00001f)continue;var q=c-a;float t=(q.x*edge.y-q.y*edge.x)/cross,u=(q.x*d.y-q.y*d.x)/cross;if(t>0&&t<1&&u>=0&&u<=1)return false;}return true;}
    void ObserveNotebook(){
        if(!Escaping)return;int selected=Indoors?floor:floors.Length;if(selected==lastObservedFloor&&Vector2.Distance(lastObserved,player)<.5f)return;lastObservedFloor=selected;lastObserved=player;visitedLevels.Add(selected);
        var plan=floors[Mathf.Min(selected,floors.Length-1)];int width=selected==floors.Length?192:plan.width,height=selected==floors.Length?134:plan.height;float cell=selected==floors.Length?1:plan.cellSize,ox=selected==floors.Length?-96:plan.origin.x,oz=selected==floors.Length?-52:plan.origin.z;
        int minX=Mathf.Max(0,Mathf.FloorToInt((player.x-11-ox)/cell)),maxX=Mathf.Min(width-1,Mathf.CeilToInt((player.x+11-ox)/cell)),minZ=Mathf.Max(0,Mathf.FloorToInt((player.y-11-oz)/cell)),maxZ=Mathf.Min(height-1,Mathf.CeilToInt((player.y+11-oz)/cell));bool changed=false;
        for(int z=minZ;z<=maxZ;z++)for(int x=minX;x<=maxX;x++){int index=z*width+x;if(discovered[selected].Contains(index))continue;var p=new Vector2(ox+x*cell,oz+z*cell);if(Vector2.Distance(player,p)>11||selected<floors.Length&&!NotebookSight(player,p,plan))continue;discovered[selected].Add(index);mapPixels[selected][(height-1-z)*width+x]=selected==floors.Length?new Color32(78,91,69,255):plan.cells[index]==1?new Color32(144,153,125,255):new Color32(42,51,43,255);changed=true;}
        if(changed){mapTextures[selected].SetPixels32(mapPixels[selected]);mapTextures[selected].Apply();}
        AddNote("arrival:"+selected,selected==floors.Length?"Outside the asylum":plan.name,selected==floors.Length?"I have reached the grounds. The outside sketch records the ground and landings I have explored.":"I have reached this level. The sketch fills in nearby as I explore; blank areas are still unknown.","Personal observation");
        if(selected==floors.Length)return;
        foreach(var room in plan.rooms)if(InPolygon(player.x,player.y,room.points)&&visitedPlaces.Add(selected+":"+room.id))AddNote("place:"+selected+":"+room.id,room.id+" · "+room.name,"I have explored this room.",plan.name+" · room uses in this game are fictional");
        foreach(var corridor in plan.corridors)for(int i=1;i<corridor.points.Length;i++)if(SegmentDistance(player.x,player.y,corridor.points[i-1],corridor.points[i])<corridor.width/2&&visitedPlaces.Add(selected+":"+corridor.id))AddNote("place:"+selected+":"+corridor.id,corridor.id+" · "+corridor.name,"I have explored this passage.",plan.name+" · personal observation");
        foreach(var stair in plan.stairs){bool near=playerFlight?.id==stair.id;for(int i=0;i<stair.points.Length;i++)if(SegmentDistance(player.x,player.y,stair.points[i],stair.points[(i+1)%stair.points.Length])<1.6f)near=true;if(near&&visitedStairs.Add(selected+":"+stair.id)){var names=new List<string>();for(int f=0;f<floors.Length;f++)if(visitedStairs.Contains(f+":"+stair.id))names.Add(floors[f].name);AddNote("stair:"+stair.id,stair.name,names.Count>1?"I have found this stair on "+string.Join(" and ",names)+".":"I found a stair here. I have only recorded it on this level so far.","Personal observation");}}
        if(player.x<-23)foundWest=true;if(player.x>23)foundEast=true;if(foundEast&&foundWest)AddNote("wings","A repeated pattern?","The east and west wings repeat several room and corridor patterns. A passage on one side may help me recognise the other, though the two sides are not identical.","My deduction after exploring both wings",true);
    }
    void ToggleNotebook(){map=!map;stickVector=Vector2.zero;useHeld=sprintHeld=false;stickFinger=lookFinger=-1;if(map){notebookLevel=Indoors?floor:floors.Length;notePage=0;notesRead=notes.Count;UnlockMouse();}else LockMouse();}
    bool NotebookTap(Vector2 p){if(!map)return false;if(notebookClose.Contains(p)||mapButton.Contains(p)){ToggleNotebook();return true;}for(int i=0;i<=floors.Length;i++)if(visitedLevels.Contains(i)&&new Rect(118+i*145,176,136,44).Contains(p)){notebookLevel=i;return true;}if(notebookPrevious.Contains(p)){notePage=Mathf.Max(0,notePage-1);return true;}if(notebookNext.Contains(p)){notePage=Mathf.Min(Mathf.Max(0,(notes.Count-1)/2),notePage+1);return true;}return true;}
    void DrawNotebookMap(Rect area,int selected,bool labels){
        Surface(area,surfaceTexture);var plan=floors[Mathf.Min(selected,floors.Length-1)];int width=selected==floors.Length?192:plan.width,height=selected==floors.Length?134:plan.height;float cell=selected==floors.Length?1:plan.cellSize,ox=selected==floors.Length?-96:plan.origin.x,oz=selected==floors.Length?-52:plan.origin.z;
        float scale=Mathf.Min((area.width-16)/width,(area.height-16)/height);var draw=new Rect(area.center.x-width*scale/2,area.center.y-height*scale/2,width*scale,height*scale);DrawImage(draw,mapTextures[selected]);
        Vector2 At(Vector2 p)=>new Vector2(draw.x+(p.x-ox)/cell*scale,draw.y+(p.y-oz)/cell*scale);
        bool Known(Vector2 p){int x=Cell(p.x-ox,cell),z=Cell(p.y-oz,cell);return x>=0&&z>=0&&x<width&&z<height&&discovered[selected].Contains(z*width+x);}
        void Mark(Vector2 p,Color color,float size=4){var at=At(p);if(draw.Contains(at))Fill(new Rect(at.x-size/2,at.y-size/2,size,size),color);}
        if(selected<floors.Length){foreach(var e in plan.exits)if(Known(XZ(e.inside)))Mark(XZ(e.inside),mint);foreach(var s in plan.stairs)if(visitedStairs.Contains(selected+":"+s.id)){Mark(Position(s,plan),amber,6);if(labels){var at=At(Position(s,plan));Label(new Rect(at.x+5,at.y-8,35,20),s.id,new GUIStyle(small){fontSize=12});}}}
        if(selected==(Indoors?floor:floors.Length))Mark(player,Color.white,7);
        if(selected<floors.Length)foreach(var e in enemies)if(e.floor==selected&&Known(e.position))Mark(e.position,e.type==2?new Color(.4f,.8f,.7f):amber,5);
    }
    void DrawNotebook(){
        Panel(new Rect(90,90,1115,585));Label(new Rect(118,112,800,46),"Notebook · observed places and routes",heading);if(Button(notebookClose,"CLOSE"))ToggleNotebook();
        for(int i=0;i<=floors.Length;i++)if(visitedLevels.Contains(i)&&Button(new Rect(118+i*145,176,136,44),i==floors.Length?"GROUNDS":floors[i].name.ToUpperInvariant(),notebookLevel==i))notebookLevel=i;
        DrawNotebookMap(new Rect(118,238,590,358),notebookLevel,true);Label(new Rect(118,610,700,32),"Only explored areas are shown. Blank areas are still unknown.",small);
        for(int row=0;row<2;row++){int index=notePage*2+row;if(index>=notes.Count)break;var n=notes[index];float y=238+row*181;Label(new Rect(736,y,424,25),n.deduction?"DEDUCTION":"OBSERVED FACT",eyebrow);Label(new Rect(736,y+26,424,40),n.title,new GUIStyle(heading){fontSize=20});Label(new Rect(736,y+66,424,91),n.text,new GUIStyle(text){fontSize=16});Label(new Rect(736,y+153,424,24),n.source,new GUIStyle(small){fontSize=12});}
        if(Button(notebookPrevious,"‹"))notePage=Mathf.Max(0,notePage-1);if(Button(notebookNext,"›"))notePage=Mathf.Min(Mathf.Max(0,(notes.Count-1)/2),notePage+1);Label(new Rect(1048,620,125,30),(notePage+1)+" / "+Mathf.Max(1,Mathf.CeilToInt(notes.Count/2f)),small);
    }
}
