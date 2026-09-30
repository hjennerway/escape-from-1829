using System;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class NativePresentationBuild
{
    [Serializable] class Atlas { public int size,width,height,ascent,descent;public Glyph[] glyphs; }
    [Serializable] class Glyph { public int index,advance,minX,maxX,minY,maxY,x,y,width,height; }
    public static Font LoadFont(string name)
    {
        const string folder="Assets/NativePrototype/Presentation/";
        string texturePath=folder+name+".png";
        var importer=(TextureImporter)AssetImporter.GetAtPath(texturePath);
        if(!importer)throw new Exception("Run export-presentation.mjs before building.");
        importer.textureCompression=TextureImporterCompression.Uncompressed;importer.sRGBTexture=false;
        importer.alphaIsTransparency=true;importer.mipmapEnabled=false;importer.maxTextureSize=4096;importer.filterMode=FilterMode.Bilinear;importer.wrapMode=TextureWrapMode.Clamp;importer.SaveAndReimport();
        var data=JsonUtility.FromJson<Atlas>(File.ReadAllText(folder+name+".json"));
        var material=new Material(Shader.Find("GUI/Text Shader"));material.mainTexture=AssetDatabase.LoadAssetAtPath<Texture2D>(texturePath);
        string matPath=folder+name+".mat",fontPath=folder+name+".fontsettings";
        if(AssetDatabase.LoadAssetAtPath<Material>(matPath)){EditorUtility.CopySerialized(material,AssetDatabase.LoadAssetAtPath<Material>(matPath));UnityEngine.Object.DestroyImmediate(material);}
        else AssetDatabase.CreateAsset(material,matPath);
        var font=new Font(name);font.material=AssetDatabase.LoadAssetAtPath<Material>(matPath);
        var glyphs=new CharacterInfo[data.glyphs.Length];
        for(int i=0;i<glyphs.Length;i++){
            var g=data.glyphs[i];float left=(float)g.x/data.width,right=(float)(g.x+g.width)/data.width,top=1-(float)g.y/data.height,bottom=1-(float)(g.y+g.height)/data.height;
            glyphs[i]=new CharacterInfo{index=g.index,advance=g.advance,minX=g.minX,maxX=g.maxX,minY=g.minY,maxY=g.maxY,size=data.size,uvBottomLeft=new Vector2(left,bottom),uvBottomRight=new Vector2(right,bottom),uvTopLeft=new Vector2(left,top),uvTopRight=new Vector2(right,top)};
        }
        font.characterInfo=glyphs;
        var serialized=new SerializedObject(font);serialized.FindProperty("m_FontSize").floatValue=data.size;serialized.FindProperty("m_LineSpacing").floatValue=data.ascent+data.descent;serialized.FindProperty("m_Ascent").floatValue=data.ascent;serialized.ApplyModifiedPropertiesWithoutUndo();
        if(AssetDatabase.LoadAssetAtPath<Font>(fontPath)){EditorUtility.CopySerialized(font,AssetDatabase.LoadAssetAtPath<Font>(fontPath));UnityEngine.Object.DestroyImmediate(font);}
        else AssetDatabase.CreateAsset(font,fontPath);
        return AssetDatabase.LoadAssetAtPath<Font>(fontPath);
    }
}
