using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    GameObject lampPools;Texture2D lampGlow;Material poolMaterial;float nightClock;
    readonly List<Lamp> lampPositions=new List<Lamp>();
    void InitializeNight()
    {
        var materials=new HashSet<Material>();foreach(var r in estateMeshes)materials.Add(r.sharedMaterial);
        foreach(var material in materials){var c=material.color;float metal=material.GetFloat("_Metallic"),rough=1-material.GetFloat("_Glossiness");
            bool glass=metal>=.08f&&metal<=.35f&&rough<.8f&&c.r<c.g*.95f&&c.b>c.r;
            bool atlas=material.GetTexture("_EmissionMap")!=null;
            if(glass||atlas)material.SetFloat("_Window",1);
        }
        lampGlow=new Texture2D(64,64,TextureFormat.RGBA32,false);var colors=new Color[4096];for(int y=0;y<64;y++)for(int x=0;x<64;x++){float radius=new Vector2((x+.5f-32)/32,(y+.5f-32)/32).magnitude;colors[y*64+x]=new Color(1,1,1,Mathf.Max(0,(Mathf.Exp(-radius*radius*5)-Mathf.Exp(-5))/(1-Mathf.Exp(-5))));}lampGlow.SetPixels(colors);lampGlow.Apply(false,true);
        poolMaterial=new Material(Shader.Find("Escape1829/NativeSurface"));poolMaterial.SetFloat("_Unlit",1);poolMaterial.SetInt("_Cull",0);poolMaterial.SetInt("_SrcBlend",5);poolMaterial.SetInt("_DstBlend",1);poolMaterial.SetInt("_ZWrite",0);poolMaterial.color=new Color(1,.68f,.33f,.26f);poolMaterial.mainTexture=lampGlow;poolMaterial.renderQueue=3001;
        lampPools=new GameObject("Street lamp pools");lampPools.AddComponent<MeshFilter>();lampPools.AddComponent<MeshRenderer>().sharedMaterial=poolMaterial;RefreshNightEstate();
    }
    void RefreshNightEstate()
    {
        if(!lampPools)return;lampPositions.Clear();if(manifest.periods[periodIndex].lamps!=null)lampPositions.AddRange(manifest.periods[periodIndex].lamps);
        var mesh=new Mesh();var v=new List<Vector3>();var uv=new List<Vector2>();var triangles=new List<int>();
        foreach(var p in lampPositions){int n=v.Count;v.Add(new Vector3(p.x-11.5f,.405f,-p.z-11.5f));v.Add(new Vector3(p.x+11.5f,.405f,-p.z-11.5f));v.Add(new Vector3(p.x+11.5f,.405f,-p.z+11.5f));v.Add(new Vector3(p.x-11.5f,.405f,-p.z+11.5f));uv.Add(Vector2.zero);uv.Add(Vector2.right);uv.Add(Vector2.one);uv.Add(Vector2.up);triangles.AddRange(new[]{n,n+2,n+1,n,n+3,n+2});}
        mesh.SetVertices(v);mesh.SetUVs(0,uv);mesh.SetTriangles(triangles,0);mesh.RecalculateNormals();mesh.RecalculateBounds();mesh.UploadMeshData(true);var filter=lampPools.GetComponent<MeshFilter>();if(filter.sharedMesh)Destroy(filter.sharedMesh);filter.sharedMesh=mesh;nightClock=0;
    }
    void UpdateNight()
    {
        if(!lampPools)return;bool active=(night||mode==Mode.Title)&&outside.activeSelf;lampPools.SetActive(active);Shader.SetGlobalFloat("_Night",active?1:0);if(!active)return;
        nightClock-=Time.unscaledDeltaTime;if(nightClock>0)return;nightClock=.25f;var position=mode==Mode.Aerial?orbitTarget:view.transform.position;
        lampPositions.Sort((a,b)=>((new Vector2(a.x,-a.z)-new Vector2(position.x,position.z)).sqrMagnitude).CompareTo((new Vector2(b.x,-b.z)-new Vector2(position.x,position.z)).sqrMagnitude));
        for(int i=0;i<lightPool.Length;i++){var light=lightPool[i];bool lit=i<8&&i<lampPositions.Count;light.enabled=lit;if(lit){var p=lampPositions[i];light.transform.position=new Vector3(p.x,p.y,-p.z);light.range=22;light.intensity=1.8f;light.color=new Color(1,.72f,.43f);}}
    }
}
