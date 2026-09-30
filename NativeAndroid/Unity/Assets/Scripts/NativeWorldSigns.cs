using System.Collections.Generic;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    class WorldSign { public GameObject root;public int floor,exit=-1; }
    readonly List<WorldSign> worldSigns=new List<WorldSign>();
    Material signTextMaterial;
    void InitializeSigns()
    {
        // The built-in font material ignores depth, making distant signs show
        // through walls. Share a depth-tested native material for these labels.
        signTextMaterial=new Material(Shader.Find("Escape1829/NativeSurface"));signTextMaterial.SetFloat("_Unlit",1);signTextMaterial.SetFloat("_Cutoff",.05f);signTextMaterial.SetInt("_Cull",0);signTextMaterial.SetInt("_SrcBlend",5);signTextMaterial.SetInt("_DstBlend",10);signTextMaterial.SetInt("_ZWrite",0);signTextMaterial.renderQueue=3000;
        Font.textureRebuilt+=SyncSignFont;SyncSignFont(worldFont);
        for(int f=0;f<2;f++){
            var plan=floors[f];
            for(int i=0;i<plan.exits.Length;i++){
                var e=plan.exits[i];var p=Position(e,plan);float angle=e.axis=="x"?(e.facing>0?90:-90):(e.facing>0?180:0);
                // The label faces the corridor, just inside the exit opening.
                var inward=e.axis=="x"?new Vector2(-e.facing,0):new Vector2(0,-e.facing);
                p+=inward*.96f;
                worldSigns.Add(new WorldSign{root=WorldLabel("EXIT",World(p,f*manifest.floorHeight+2.65f),angle,new Color(.06f,.25f,.15f),.24f),floor=f,exit=f*7+i});
            }
            foreach(var stair in plan.stairs){var p=Position(stair,plan);worldSigns.Add(new WorldSign{root=WorldLabel((f==0?"UPSTAIRS":"DOWNSTAIRS")+"\nHOLD USE",World(p+new Vector2(0,.9f),f*manifest.floorHeight+2.65f),0,new Color(.25f,.17f,.08f),.16f),floor=f});}
        }
    }
    GameObject WorldLabel(string caption,Vector3 p,float angle,Color background,float size)
    {
        var root=new GameObject(caption);root.transform.SetParent(artRoot.transform,false);root.transform.position=p;root.transform.rotation=Quaternion.Euler(0,angle,0);
        var panel=GameObject.CreatePrimitive(PrimitiveType.Quad);Destroy(panel.GetComponent<Collider>());panel.transform.SetParent(root.transform,false);panel.transform.localScale=new Vector3(1.65f,.65f,1);
        var material=new Material(Shader.Find("Escape1829/NativeSurface"));material.SetFloat("_Unlit",1);material.SetInt("_Cull",0);material.color=background;panel.GetComponent<Renderer>().material=material;
        var label=new GameObject("Label").AddComponent<TextMesh>();label.transform.SetParent(root.transform,false);label.transform.localPosition=new Vector3(0,0,-.012f);label.text=caption;label.font=worldFont;label.fontSize=48;label.characterSize=size;label.anchor=TextAnchor.MiddleCenter;label.alignment=TextAlignment.Center;label.color=Color.white;label.GetComponent<Renderer>().sharedMaterial=signTextMaterial;
        return root;
    }
    void UpdateSigns(){foreach(var sign in worldSigns)sign.root.SetActive(sign.floor==floor&&(sign.exit<0||activeExits.Contains(sign.exit)));}
    void SyncSignFont(Font font){if(font==worldFont&&signTextMaterial)signTextMaterial.mainTexture=font.material.mainTexture;}
    void OnDestroy(){Font.textureRebuilt-=SyncSignFont;}
}
