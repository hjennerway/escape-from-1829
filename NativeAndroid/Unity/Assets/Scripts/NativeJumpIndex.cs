using System;
using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    // One packed copy of each rendered bound, with visibility masks for all
    // historical periods. Only nearby bounds are decoded during walking.
    class CompactJumpIndex
    {
        readonly byte[] data;readonly Dictionary<Vector2Int,List<int>> cells=new Dictionary<Vector2Int,List<int>>();
        public int period;public bool trees=true;
        float Float(int offset)=>BitConverter.ToSingle(data,offset);
        public CompactJumpIndex(byte[] bytes,int expected){
            data=bytes;if(BitConverter.ToUInt32(data,0)!=0x4a313832||BitConverter.ToInt32(data,4)!=expected)throw new Exception("Invalid jump collision export");int offset=8;
            for(int i=0;i<expected;i++){float minX=Float(offset),maxX=Float(offset+4),minZ=Float(offset+8),maxZ=Float(offset+12);
                for(int x=Mathf.FloorToInt((minX-.4f)/12);x<=Mathf.FloorToInt((maxX+.4f)/12);x++)for(int z=Mathf.FloorToInt((minZ-.4f)/12);z<=Mathf.FloorToInt((maxZ+.4f)/12);z++){var key=new Vector2Int(x,z);if(!cells.TryGetValue(key,out var list))cells[key]=list=new List<int>();list.Add(offset);}
                offset+=32+BitConverter.ToInt32(data,offset+28)*8;
            }if(offset!=data.Length)throw new Exception("Jump collision length mismatch");
        }
        public IEnumerable<Obstacle> At(Vector2 p){
            if(!cells.TryGetValue(new Vector2Int(Mathf.FloorToInt(p.x/12),Mathf.FloorToInt(p.y/12)),out var nearby))yield break;
            foreach(int offset in nearby){if((BitConverter.ToUInt16(data,offset+(trees?24:26))&(1<<period))==0)continue;
                float minX=Float(offset),maxX=Float(offset+4),minZ=Float(offset+8),maxZ=Float(offset+12);if(p.x<=minX-.27f||p.x>=maxX+.27f||p.y<=minZ-.27f||p.y>=maxZ+.27f)continue;
                int count=BitConverter.ToInt32(data,offset+28);var b=new Obstacle{minX=minX,maxX=maxX,minZ=minZ,maxZ=maxZ,minY=Float(offset+16),maxY=Float(offset+20)};
                if(count>0){b.corners=new Point[count];for(int i=0;i<count;i++)b.corners[i]=new Point{x=Float(offset+32+i*8),z=Float(offset+36+i*8)};}yield return b;
            }
        }
    }
}
