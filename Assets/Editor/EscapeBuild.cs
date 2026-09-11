using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using System.IO;

[InitializeOnLoad]
public static class EscapeBuild
{
    static EscapeBuild() { EditorApplication.delayCall += EnsureScene; }
    static void EnsureScene()
    {
        if(EditorApplication.isPlayingOrWillChangePlaymode || File.Exists("Assets/Scenes/Escape.unity"))return;
        CreateScene();
    }
    [MenuItem("Escape 1829/Create startup scene")]
    public static void CreateScene()
    {
        var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
        new GameObject("Escape from 1829").AddComponent<EscapeGame>();
        EditorSceneManager.SaveScene(scene,"Assets/Scenes/Escape.unity");
        EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene("Assets/Scenes/Escape.unity",true)};
        PlayerSettings.companyName="Chester Night Games";PlayerSettings.productName="Escape from 1829";
        PlayerSettings.defaultScreenWidth=1280;PlayerSettings.defaultScreenHeight=720;
        AssetDatabase.SaveAssets();
    }
    [MenuItem("Escape 1829/Build browser game (WebGL)")]
    public static void WebGL()
    {
        CreateScene(); PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Disabled;
        PlayerSettings.WebGL.decompressionFallback=false;
        PlayerSettings.WebGL.template="APPLICATION:Default";
        var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes=new[]{"Assets/Scenes/Escape.unity"},locationPathName="Builds/WebGL",target=BuildTarget.WebGL,options=BuildOptions.None });
        if(report.summary.result!=UnityEditor.Build.Reporting.BuildResult.Succeeded)throw new System.Exception("WebGL build failed: "+report.summary.result);
    }
}
