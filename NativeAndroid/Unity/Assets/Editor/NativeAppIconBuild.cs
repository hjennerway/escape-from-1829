using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.Android;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

// Keep launcher artwork outside the regenerated model/presentation directories.
public sealed class NativeAppIconBuild : IPreprocessBuildWithReport
{
    const string Folder = "Assets/AppIcon/";
    public int callbackOrder => 0;

    public void OnPreprocessBuild(BuildReport report)
    {
        if (report.summary.platform == BuildTarget.Android) Configure();
    }

    [Serializable] class IconSlot { public string kind; public int width, height; public string[] layers; }
    [Serializable] class IconReport { public bool passed; public IconSlot[] slots; }

    [MenuItem("Escape 1829/Android/Apply launcher icons")]
    public static void Configure()
    {
        const string clearPath = Folder + "adaptive-foreground.png";
        // The illustrated scene is entirely in the opaque background. A clear
        // foreground supplies the required second layer without obscuring it.
        if (!File.Exists(clearPath))
        {
            var clear = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            clear.SetPixels(new[] { Color.clear, Color.clear, Color.clear, Color.clear });
            clear.Apply();
            File.WriteAllBytes(clearPath, clear.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(clear);
        }
        AssetDatabase.Refresh();
        var square = Load("asylum-entrance.png");
        var background = Load("asylum-adaptive-background.png");
        var foreground = Load("adaptive-foreground.png");
        int[] sizes = PlayerSettings.GetIconSizes(NamedBuildTarget.Unknown, IconKind.Application);
        var defaults = new Texture2D[sizes.Length];
        for (int i = 0; i < defaults.Length; i++) defaults[i] = square;
        PlayerSettings.SetIcons(NamedBuildTarget.Unknown, defaults, IconKind.Application);
        var slots = new List<IconSlot>();
        // Unity 6.6 exports Android launcher resources from adaptive icons;
        // the old separate legacy and round platform kinds have been removed.
        Set(AndroidPlatformIconKind.Adaptive, "adaptive", background, foreground, slots);
        AssetDatabase.SaveAssets();
        Directory.CreateDirectory("../artifacts");
        File.WriteAllText("../artifacts/icon-settings.json", JsonUtility.ToJson(new IconReport { passed = true, slots = slots.ToArray() }, true));
        Debug.Log("NATIVE_APP_ICONS_PASS default and adaptive slots configured: " + slots.Count);
    }

    static Texture2D Load(string name)
    {
        string path = Folder + name;
        var importer = AssetImporter.GetAtPath(path) as TextureImporter;
        if (!importer) throw new BuildFailedException("Missing launcher artwork: " + path);
        importer.textureType = TextureImporterType.Default;
        importer.sRGBTexture = true;
        importer.alphaSource = TextureImporterAlphaSource.FromInput;
        importer.alphaIsTransparency = true;
        importer.mipmapEnabled = false;
        importer.npotScale = TextureImporterNPOTScale.None;
        importer.maxTextureSize = 2048;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.wrapMode = TextureWrapMode.Clamp;
        importer.SaveAndReimport();
        var texture = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
        if (!texture || texture.width != texture.height) throw new BuildFailedException("Launcher artwork must be square: " + path);
        return texture;
    }

    static void Set(PlatformIconKind kind, string name, Texture2D background, Texture2D foreground, List<IconSlot> report)
    {
        var icons = PlayerSettings.GetPlatformIcons(NamedBuildTarget.Android, kind);
        if (icons.Length == 0) throw new BuildFailedException("Android icon slots unavailable: " + name);
        foreach (var icon in icons)
        {
            var textures = new Texture2D[icon.maxLayerCount];
            textures[0] = background;
            if (foreground) textures[1] = foreground;
            icon.SetTextures(textures);
        }
        PlayerSettings.SetPlatformIcons(NamedBuildTarget.Android, kind, icons);
        foreach (var icon in PlayerSettings.GetPlatformIcons(NamedBuildTarget.Android, kind))
        {
            var layers = new List<string>();
            int count = foreground ? 2 : 1;
            for (int i = 0; i < count; i++)
            {
                var texture = icon.GetTexture(i);
                if (!texture || texture != (i == 0 ? background : foreground)) throw new BuildFailedException("Android icon layer was not saved: " + name);
                layers.Add(AssetDatabase.GetAssetPath(texture));
            }
            report.Add(new IconSlot { kind = name, width = icon.width, height = icon.height, layers = layers.ToArray() });
        }
    }
}
