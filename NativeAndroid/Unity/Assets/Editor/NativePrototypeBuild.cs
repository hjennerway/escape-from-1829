using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Security.Cryptography;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;

// A deliberately bounded importer for our exporter, not a general glTF loader.
// Assets are converted and saved in the editor; no JSON/GLB decoding on phones.
public static class NativePrototypeBuild
{
    const string Source = "Assets/NativePrototype/Generated";
    const string Baked = "Assets/NativePrototype/Baked";
    const string ScenePath = "Assets/Scenes/NativePrototype.unity";
    [Serializable] class Root { public Accessor[] accessors; public View[] bufferViews; public MeshDef[] meshes; public MaterialDef[] materials; public TextureDef[] textures; public ImageDef[] images; public NodeDef[] nodes; public int scene; public SceneDef[] scenes; }
    [Serializable] class Accessor { public int bufferView; public int byteOffset; public int componentType; public int count; public string type; public bool normalized; }
    [Serializable] class View { public int buffer; public int byteOffset; public int byteLength; public int byteStride; }
    [Serializable] class MeshDef { public string name; public Primitive[] primitives; }
    [Serializable] class Primitive { public Attributes attributes; public int indices = -1; public int material = -1; public int mode = 4; }
    [Serializable] class Attributes { public int POSITION = -1; public int NORMAL = -1; public int TEXCOORD_0 = -1; public int TEXCOORD_1=-1; }
    [Serializable] class SceneDef { public int[] nodes; }
    [Serializable] class NodeDef { public string name; public int mesh = -1; public int[] children; public float[] translation; public float[] rotation; public float[] scale; public float[] matrix; public NodeExtras extras; }
    [Serializable] class NodeExtras { public bool preciseSurface; }
    [Serializable] class SurfaceExtras { public float offsetFactor,offsetUnits;public bool grass,wind,ceiling,mural; }
    [Serializable] class MaterialExtras { public SurfaceExtras nativeSurface; }
    [Serializable] class MaterialDef { public string name; public Pbr pbrMetallicRoughness; public float[] emissiveFactor; public TextureInfo emissiveTexture; public MaterialExtensions extensions; public bool doubleSided; public string alphaMode; public float alphaCutoff = .5f; public MaterialExtras extras; }
    [Serializable] class MaterialExtensions { public Bump EXT_materials_bump; public Unlit KHR_materials_unlit; public EmissiveStrength KHR_materials_emissive_strength; }
    [Serializable] class Bump { public TextureInfo bumpTexture; public float bumpFactor=1; }
    [Serializable] class Unlit { }
    [Serializable] class EmissiveStrength { public float emissiveStrength=1; }
    [Serializable] class Pbr { public float[] baseColorFactor; public TextureInfo baseColorTexture; public float metallicFactor = 1; public float roughnessFactor = 1; }
    [Serializable] class TextureInfo { public int index; public int texCoord; public TextureExtensions extensions; }
    [Serializable] class TextureExtensions { public TextureTransform KHR_texture_transform; }
    [Serializable] class TextureTransform { public float[] scale,offset; public float rotation; }
    [Serializable] class TextureDef { public int source;public string name; }
    [Serializable] class ImageDef { public int bufferView = -1; public string mimeType; public string uri; }
    [Serializable] class ImportStats { public string name; public int meshes; public long triangles; public int textures; }
    [Serializable] class Report { public string sourceHash, importSignature; public ImportStats[] assets; public string engine; }

    [MenuItem("Escape 1829/Native prototype/Prepare scene")]
    public static void Prepare()
    {
        AssetDatabase.Refresh();
        var surfaceShader=Shader.Find("Escape1829/NativeSurface");
        if(!surfaceShader||ShaderUtil.ShaderHasError(surfaceShader))throw new Exception("Native surface shader must compile before importing materials.");
        if (!File.Exists(Source + "/manifest.json")) throw new Exception("Run node NativeAndroid/tools/export-port.mjs first.");
        Directory.CreateDirectory(Baked); Directory.CreateDirectory("Assets/Scenes");
        const string notices = "Assets/StreamingAssets/Licenses";
        Directory.CreateDirectory(notices);
        foreach (string file in new[] { "GPL-3.0.txt", "THREE-LICENSE.txt", "EZ-TREE-LICENSE.txt", "TREE-TEXTURES-LICENSE.txt" })
            File.Copy(Source + "/" + file, notices + "/" + file, true);
        AssetDatabase.Refresh();
        foreach (string path in Directory.GetFiles("Assets/Resources/Archive", "*.png"))
        {
            var image = (TextureImporter)AssetImporter.GetAtPath(path.Replace('\\','/'));
            image.maxTextureSize=2048;image.mipmapEnabled=true;image.isReadable=false;
            image.textureCompression=TextureImporterCompression.Compressed;image.wrapMode=TextureWrapMode.Clamp;
            image.SaveAndReimport();
        }
        var stats = new List<ImportStats>();
        string importSignature = ImportSignature();
        Report previous = File.Exists("../artifacts/unity-import.json") ? JsonUtility.FromJson<Report>(File.ReadAllText("../artifacts/unity-import.json")) : null;
        bool cached = previous != null && previous.importSignature == importSignature && previous.engine == Application.unityVersion;
        var outdoor = cached ? AssetDatabase.LoadAssetAtPath<GameObject>(Baked + "/outdoor/outdoor.prefab") : null;
        var indoor = cached ? AssetDatabase.LoadAssetAtPath<GameObject>(Baked + "/indoor/indoor.prefab") : null;
        var guard = cached ? AssetDatabase.LoadAssetAtPath<GameObject>(Baked + "/guard/guard.prefab") : null;
        var selection = cached ? AssetDatabase.LoadAssetAtPath<GameObject>(Baked + "/selection/selection.prefab") : null;
        if (outdoor && indoor && guard && selection) stats.AddRange(previous.assets);
        else { outdoor = Import("outdoor", stats); indoor = Import("indoor", stats); guard = Import("guard", stats); selection = Import("selection",stats); }
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var game = new GameObject("Escape from 1829").AddComponent<NativePrototypeGame>();
        game.outdoorPrefab = outdoor; game.indoorPrefab = indoor; game.guardPrefab = guard;
        var filters=selection.GetComponentsInChildren<MeshFilter>(true);game.selectionMeshes=new Mesh[filters.Length];
        foreach(var filter in filters)game.selectionMeshes[int.Parse(filter.transform.parent.name.Substring(10))]=filter.sharedMesh;
        game.selectionShader=Shader.Find("Escape1829/BuildingSelection");
        game.layoutText = AssetDatabase.LoadAssetAtPath<TextAsset>(Source + "/layout.json");
        game.manifestText = AssetDatabase.LoadAssetAtPath<TextAsset>(Source + "/manifest.json");
        game.collisionText = AssetDatabase.LoadAssetAtPath<TextAsset>(Source + "/jump-collision.bytes");
        game.worldFont=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        game.bodyFont=NativePresentationBuild.LoadFont("arial");game.buttonFont=NativePresentationBuild.LoadFont("arial-bold");game.displayFont=NativePresentationBuild.LoadFont("georgia");game.italicFont=NativePresentationBuild.LoadFont("georgia-italic");
        game.lightingIcons=NativePresentationBuild.LoadLightingIcons();
        game.locationIcon=NativePresentationBuild.LoadLocationIcon();game.deviceLocationShader=Shader.Find("Escape1829/DeviceLocation");
        game.skyShader=Shader.Find("Escape1829/CloudSky");game.gradeShader=Shader.Find("Escape1829/ColourGrade");
        game.uiCaptureShader=Shader.Find("Escape1829/UICapture");
        if (!game.layoutText || !game.manifestText || !game.collisionText) throw new Exception("Exported navigation data could not import.");
        game.outdoorTriangles = stats[0].triangles; game.indoorTriangles = stats[1].triangles;
        game.outdoorBatches = stats[0].meshes; game.indoorBatches = stats[1].meshes;
        EditorSceneManager.SaveScene(scene, ScenePath);
        PlayerSettings.companyName = "Chester Night Games";
        PlayerSettings.productName = "Escape from 1829";
        PlayerSettings.bundleVersion="0.8.0";PlayerSettings.Android.bundleVersionCode=8;
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "org.hjennerway.escape1829.prototype");
        PlayerSettings.defaultScreenWidth = 1280; PlayerSettings.defaultScreenHeight = 720;
        PlayerSettings.defaultIsNativeResolution = false;
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
        PlayerSettings.colorSpace = ColorSpace.Linear;
        PlayerSettings.runInBackground = false;
        PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;
        PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevel36;
        PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
        PlayerSettings.SetGraphicsAPIs(BuildTarget.Android, new[] { GraphicsDeviceType.OpenGLES3 });
        QualitySettings.antiAliasing = 2; QualitySettings.vSyncCount = 0;
        QualitySettings.pixelLightCount = 1; QualitySettings.shadows = ShadowQuality.Disable;
        QualitySettings.lodBias = 1; QualitySettings.shadowDistance = 35;
        var shader = Shader.Find("Escape1829/NativeSurface");
        if (!shader) throw new Exception("Native surface shader missing.");
        var collection = new ShaderVariantCollection();
        collection.Add(new ShaderVariantCollection.ShaderVariant(shader, PassType.ForwardBase));
        SaveAsset(collection, Baked + "/runtime-shaders.shadervariants");
        AssetDatabase.SaveAssets();
        var manifest = JsonUtility.FromJson<NativePrototypeGame.Manifest>(game.manifestText.text);
        Directory.CreateDirectory("../artifacts");
        File.WriteAllText("../artifacts/unity-import.json", JsonUtility.ToJson(new Report { sourceHash = manifest.sourceHash, importSignature = importSignature, assets = stats.ToArray(), engine = Application.unityVersion }, true));
        Validate(game, stats);
        Debug.Log("NATIVE_PROTOTYPE_PREPARED " + Application.unityVersion);
    }
    static string ImportSignature()
    {
        var signature = new StringBuilder();
        using (var hash = SHA256.Create())
        {
            foreach (string file in new[] { Source + "/outdoor.glb", Source + "/indoor.glb", Source + "/guard.glb", Source + "/selection.glb", "Assets/Editor/NativePrototypeBuild.cs", "Assets/Shaders/NativeSurface.shader" })
            {
                using (var stream = File.OpenRead(file)) signature.Append(BitConverter.ToString(hash.ComputeHash(stream)));
            }
            return BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(signature.ToString())));
        }
    }

    static GameObject Import(string name, List<ImportStats> stats)
    {
        var bytes = File.ReadAllBytes(Source + "/" + name + ".glb");
        if (BitConverter.ToUInt32(bytes, 0) != 0x46546C67 || BitConverter.ToUInt32(bytes, 4) != 2 || BitConverter.ToUInt32(bytes, 8) != bytes.Length) throw new Exception("Invalid GLB header: " + name);
        int jsonLength = BitConverter.ToInt32(bytes, 12);
        if (BitConverter.ToUInt32(bytes, 16) != 0x4E4F534A) throw new Exception("GLB JSON chunk missing.");
        string json=Encoding.UTF8.GetString(bytes,20,jsonLength);
        var root = JsonUtility.FromJson<Root>(json);
        // JsonUtility creates empty nested classes for omitted JSON fields.
        // glTF uses absence for optional textures/extensions and mesh-less nodes.
        // Restore those nulls using structural property presence, never defaults.
        var rawMaterials=ArrayValues(Property(json,"materials"));
        for(int i=0;i<root.materials.Length;i++){
            var m=root.materials[i];string raw=rawMaterials[i],pbr=Property(raw,"pbrMetallicRoughness"),extensions=Property(raw,"extensions");
            if(pbr==null)m.pbrMetallicRoughness=null;else if(Property(pbr,"baseColorTexture")==null)m.pbrMetallicRoughness.baseColorTexture=null;
            if(Property(raw,"emissiveTexture")==null)m.emissiveTexture=null;
            if(extensions==null)m.extensions=null;else{
                if(Property(extensions,"KHR_materials_unlit")==null)m.extensions.KHR_materials_unlit=null;
                if(Property(extensions,"KHR_materials_emissive_strength")==null)m.extensions.KHR_materials_emissive_strength=null;
                if(Property(extensions,"EXT_materials_bump")==null)m.extensions.EXT_materials_bump=null;
            }
        }
        var rawNodes=ArrayValues(Property(json,"nodes"));for(int i=0;i<root.nodes.Length;i++)if(Property(rawNodes[i],"mesh")==null)root.nodes[i].mesh=-1;
        int binaryHeader = 20 + jsonLength;
        if (BitConverter.ToUInt32(bytes, binaryHeader + 4) != 0x004E4942) throw new Exception("GLB binary chunk missing.");
        int start = binaryHeader + 8;
        string folder = Baked + "/" + name;
        Directory.CreateDirectory(folder); AssetDatabase.Refresh();
        var textures = new Texture2D[root.images == null ? 0 : root.images.Length];
        for (int i = 0; i < textures.Length; i++)
        {
            var image = root.images[i];
            if (image.bufferView < 0 || image.uri != null) throw new Exception("Only embedded textures are supported.");
            var view = root.bufferViews[image.bufferView];
            var pixels = new byte[view.byteLength]; Buffer.BlockCopy(bytes, start + view.byteOffset, pixels, 0, pixels.Length);
            string texturePath = folder + "/texture-" + i + ".png";
            File.WriteAllBytes(texturePath, pixels); AssetDatabase.ImportAsset(texturePath);
            var importer = (TextureImporter)AssetImporter.GetAtPath(texturePath);
            importer.wrapMode = TextureWrapMode.Repeat; importer.mipmapEnabled = true;
            bool linear=false;foreach(var texture in root.textures)if(texture.source==i&&texture.name!=null&&(texture.name.StartsWith("Estate ")||texture.name.StartsWith("Distant window glass mask")))linear=true;
            importer.sRGBTexture=!linear;importer.anisoLevel=8;
            foreach(var m in root.materials)if(m.alphaMode=="MASK"&&m.pbrMetallicRoughness?.baseColorTexture!=null&&root.textures[m.pbrMetallicRoughness.baseColorTexture.index].source==i){importer.alphaIsTransparency=true;importer.mipMapsPreserveCoverage=true;importer.alphaTestReferenceValue=m.alphaCutoff;}
            importer.maxTextureSize = 1024; importer.textureCompression = TextureImporterCompression.Compressed;
            importer.SaveAndReimport(); textures[i] = AssetDatabase.LoadAssetAtPath<Texture2D>(texturePath);
        }
        Texture2D Texture(TextureInfo info) => info == null ? null : textures[root.textures[info.index].source];
        void TransformTexture(Material material,string property,TextureInfo info)
        {
            var t=info?.extensions?.KHR_texture_transform;if(t==null)return;
            if(Math.Abs(t.rotation)>.00001f)throw new Exception("Rotated texture transform unsupported.");
            var scale=t.scale==null?Vector2.one:new Vector2(t.scale[0],t.scale[1]);
            var offset=t.offset==null?Vector2.zero:new Vector2(t.offset[0],t.offset[1]);
            material.SetTextureScale(property,scale);material.SetTextureOffset(property,new Vector2(offset.x,1-scale.y-offset.y));
        }
        var materials = new Material[root.materials.Length];
        var assetStats = new ImportStats { name = name, textures = textures.Length };
        var meshSets = new Mesh[root.meshes.Length][];
        AssetDatabase.StartAssetEditing();try {
        for (int i = 0; i < materials.Length; i++)
        {
            var definition = root.materials[i]; var pbr = definition.pbrMetallicRoughness;
            var material = new Material(Shader.Find("Escape1829/NativeSurface")); material.name = definition.name ?? name + " material " + i;
            var surface=definition.extras?.nativeSurface;
            if(surface!=null){material.SetFloat("_OffsetFactor",surface.offsetFactor);material.SetFloat("_OffsetUnits",surface.offsetUnits);material.SetFloat("_Grass",surface.grass?1:0);material.SetFloat("_Ceiling",surface.ceiling?1:0);material.SetFloat("_Mural",surface.mural?1:0);if(surface.mural)material.SetTexture("_MuralMap",Resources.Load<Texture2D>("Archive/art_grindley-basement-mural"));if(surface.wind)material.EnableKeyword("_LEAF_WIND");}
            if (pbr != null)
            {
                // glTF factors are linear; Unity Color properties are supplied
                // as sRGB and converted to linear on the GPU.
                var c = pbr.baseColorFactor; material.color = c == null ? Color.white : new Color(c[0], c[1], c[2], c[3]).gamma;
                material.mainTexture = Texture(pbr.baseColorTexture);
                TransformTexture(material,"_MainTex",pbr.baseColorTexture);
                material.SetFloat("_Metallic", pbr.metallicFactor);
                material.SetFloat("_Glossiness", 1 - pbr.roughnessFactor);
            }
            if (definition.emissiveFactor != null)
            {
                var e = definition.emissiveFactor;float strength=definition.extensions?.KHR_materials_emissive_strength?.emissiveStrength??1; material.SetColor("_EmissionColor", (new Color(e[0], e[1], e[2])*strength).gamma);
                material.SetTexture("_EmissionMap", Texture(definition.emissiveTexture)); material.EnableKeyword("_EMISSION");
                TransformTexture(material,"_EmissionMap",definition.emissiveTexture);
            }
            if(definition.emissiveTexture!=null){material.SetTexture("_EmissionMap",Texture(definition.emissiveTexture));TransformTexture(material,"_EmissionMap",definition.emissiveTexture);}
            if(definition.extensions?.KHR_materials_unlit!=null)material.SetFloat("_Unlit",1);
            var bump=definition.extensions?.EXT_materials_bump;if(bump!=null){material.SetTexture("_BumpMap",Texture(bump.bumpTexture));material.SetFloat("_BumpScale",bump.bumpFactor);TransformTexture(material,"_BumpMap",bump.bumpTexture);material.EnableKeyword("_BUMP");}
            if (definition.doubleSided) material.SetInt("_Cull", (int)CullMode.Off);
            if (definition.alphaMode == "MASK")
            {
                material.SetFloat("_Mode", 1); material.SetFloat("_Cutoff", definition.alphaCutoff);
                material.EnableKeyword("_ALPHATEST_ON"); material.renderQueue = 2450;
            }
            else if (definition.alphaMode == "BLEND")
            {
                material.SetFloat("_Mode", 3); material.SetInt("_SrcBlend", (int)BlendMode.SrcAlpha);
                material.SetInt("_DstBlend", (int)BlendMode.OneMinusSrcAlpha); material.SetInt("_ZWrite", 0);
                material.renderQueue = 3000;
            }
            string path = folder + "/material-" + i + ".mat";
            materials[i] = (Material)SaveAsset(material, path);
        }
        for (int i = 0; i < root.meshes.Length; i++)
        {
            meshSets[i] = new Mesh[root.meshes[i].primitives.Length];
            for (int j = 0; j < meshSets[i].Length; j++)
            {
                var primitive = root.meshes[i].primitives[j];
                if (primitive.mode != 4) throw new Exception("Only triangle meshes are supported.");
                var position = Floats(root, bytes, start, primitive.attributes.POSITION, 3);
                var normal = Floats(root, bytes, start, primitive.attributes.NORMAL, 3);
                var uv = Floats(root, bytes, start, primitive.attributes.TEXCOORD_0, 2);
                float[] wind=name=="guard"||name=="selection"?null:Floats(root,bytes,start,primitive.attributes.TEXCOORD_1,2);
                var vertices = new Vector3[position.Length / 3]; var normals = new Vector3[vertices.Length]; var uvs = new Vector2[vertices.Length];
                for (int n = 0; n < vertices.Length; n++)
                {
                    vertices[n] = new Vector3(position[n * 3], position[n * 3 + 1], -position[n * 3 + 2]);
                    normals[n] = new Vector3(normal[n * 3], normal[n * 3 + 1], -normal[n * 3 + 2]);
                    // Unity PNG import and glTF image coordinates have opposite V axes.
                    uvs[n] = new Vector2(uv[n * 2], 1 - uv[n * 2 + 1]);
                }
                int[] indices;
                if (primitive.indices < 0) { indices = new int[vertices.Length]; for (int k = 0; k < indices.Length; k++) indices[k] = k; }
                else indices = Indices(root, bytes, start, primitive.indices);
                if (indices.Length % 3 != 0) throw new Exception("Invalid triangle index count.");
                for (int k = 0; k < indices.Length; k += 3) { int t = indices[k + 1]; indices[k + 1] = indices[k + 2]; indices[k + 2] = t; }
                var mesh = new Mesh { name = root.meshes[i].name ?? name + " mesh " + i, indexFormat = vertices.Length > 65535 ? IndexFormat.UInt32 : IndexFormat.UInt16 };
                mesh.vertices = vertices; mesh.normals = normals; mesh.uv = uvs; mesh.triangles = indices;
                if(wind!=null){var weights=new Vector2[vertices.Length];for(int w=0;w<weights.Length;w++)weights[w]=new Vector2(wind[w*2],wind[w*2+1]);mesh.uv2=weights;}
                mesh.RecalculateBounds();if(materials[primitive.material].IsKeywordEnabled("_BUMP"))mesh.RecalculateTangents();
                bool precise=name=="indoor";foreach(var node in root.nodes)if(node.mesh==i&&node.extras!=null&&node.extras.preciseSurface)precise=true;
                MeshUtility.SetMeshCompression(mesh,precise?ModelImporterMeshCompression.Off:ModelImporterMeshCompression.Low);
                string path = folder + "/mesh-" + i + "-" + j + ".asset";
                meshSets[i][j] = (Mesh)SaveAsset(mesh, path); assetStats.meshes++; assetStats.triangles += indices.Length / 3;
            }
        }
        } finally { AssetDatabase.StopAssetEditing(); }
        var parent = new GameObject(name); var objects = new GameObject[root.nodes.Length];
        for (int i = 0; i < objects.Length; i++)
        {
            var definition = root.nodes[i]; var obj = objects[i] = new GameObject(definition.name ?? "Node " + i); obj.transform.SetParent(parent.transform);
            if (definition.matrix != null) throw new Exception("Exporter must bake transforms; matrix nodes are unsupported.");
            if (definition.translation != null) obj.transform.localPosition = new Vector3(definition.translation[0], definition.translation[1], -definition.translation[2]);
            if (definition.rotation != null) obj.transform.localRotation = new Quaternion(-definition.rotation[0], -definition.rotation[1], definition.rotation[2], definition.rotation[3]);
            if (definition.scale != null) obj.transform.localScale = new Vector3(definition.scale[0], definition.scale[1], definition.scale[2]);
            if (definition.mesh < 0) continue;
            var primitives = root.meshes[definition.mesh].primitives;
            for (int j = 0; j < primitives.Length; j++)
            {
                var part = new GameObject("Surface " + j); part.transform.SetParent(obj.transform, false);
                part.AddComponent<MeshFilter>().sharedMesh = meshSets[definition.mesh][j];
                var renderer = part.AddComponent<MeshRenderer>(); renderer.sharedMaterial = materials[primitives[j].material];
                renderer.shadowCastingMode = name == "indoor" ? ShadowCastingMode.Off : ShadowCastingMode.On; renderer.receiveShadows = true;
            }
        }
        for (int i = 0; i < objects.Length; i++) if (root.nodes[i].children != null) foreach (int child in root.nodes[i].children) objects[child].transform.SetParent(objects[i].transform, false);
        string prefabPath = folder + "/" + name + ".prefab";
        var prefab = PrefabUtility.SaveAsPrefabAsset(parent, prefabPath); UnityEngine.Object.DestroyImmediate(parent);
        stats.Add(assetStats); return prefab;
    }

    static UnityEngine.Object SaveAsset(UnityEngine.Object asset, string path)
    {
        var existing = AssetDatabase.LoadAssetAtPath<UnityEngine.Object>(path);
        if (existing) { EditorUtility.CopySerialized(asset, existing); UnityEngine.Object.DestroyImmediate(asset);return existing; }
        AssetDatabase.CreateAsset(asset, path);return asset;
    }
    static int ValueEnd(string json,int start)
    {
        bool quoted=false,escaped=false;int depth=0;
        for(int i=start;i<json.Length;i++){
            char c=json[i];if(quoted){if(escaped)escaped=false;else if(c=='\\')escaped=true;else if(c=='"'){quoted=false;if(depth==0)return i+1;}continue;}
            if(c=='"'){quoted=true;continue;}if(c=='{'||c=='[')depth++;
            else if(c=='}'||c==']'){if(depth==0)return i;if(--depth==0)return i+1;}
            else if(c==','&&depth==0)return i;
        }return json.Length;
    }
    static string Property(string json,string key)
    {
        if(json==null)return null;int i=1;
        while(i<json.Length){while(i<json.Length&&(char.IsWhiteSpace(json[i])||json[i]==','))i++;if(i>=json.Length||json[i]=='}')return null;
            int end=ValueEnd(json,i);string name=json.Substring(i+1,end-i-2);i=end;while(i<json.Length&&(char.IsWhiteSpace(json[i])||json[i]==':'))i++;
            int valueEnd=ValueEnd(json,i);if(name==key)return json.Substring(i,valueEnd-i);i=valueEnd;
        }return null;
    }
    static List<string> ArrayValues(string json)
    {
        var values=new List<string>();if(json==null)return values;int i=1;
        while(i<json.Length){while(i<json.Length&&(char.IsWhiteSpace(json[i])||json[i]==','))i++;if(i>=json.Length||json[i]==']')break;int end=ValueEnd(json,i);values.Add(json.Substring(i,end-i));i=end;}return values;
    }
    static float[] Floats(Root root, byte[] bytes, int binaryStart, int index, int width)
    {
        if (index < 0) throw new Exception("Required mesh attribute missing.");
        var accessor = root.accessors[index]; var view = root.bufferViews[accessor.bufferView];
        if (accessor.componentType != 5126 || accessor.type != "VEC" + width || accessor.normalized) throw new Exception("Exporter must emit float mesh attributes.");
        var values = new float[accessor.count * width]; int stride = view.byteStride == 0 ? width * 4 : view.byteStride;
        for (int i = 0; i < accessor.count; i++) for (int j = 0; j < width; j++) values[i * width + j] = BitConverter.ToSingle(bytes, binaryStart + view.byteOffset + accessor.byteOffset + i * stride + j * 4);
        return values;
    }
    static int[] Indices(Root root, byte[] bytes, int start, int index)
    {
        var accessor = root.accessors[index]; var view = root.bufferViews[accessor.bufferView]; var values = new int[accessor.count];
        int size = accessor.componentType == 5125 ? 4 : accessor.componentType == 5123 ? 2 : accessor.componentType == 5121 ? 1 : 0;
        if (size == 0) throw new Exception("Unsupported mesh index type.");
        for (int i = 0; i < values.Length; i++) { int offset = start + view.byteOffset + accessor.byteOffset + i * size; values[i] = size == 4 ? (int)BitConverter.ToUInt32(bytes, offset) : size == 2 ? BitConverter.ToUInt16(bytes, offset) : bytes[offset]; }
        return values;
    }

    static void Validate(NativePrototypeGame game, List<ImportStats> stats)
    {
        var floors=NativePrototypeGame.MakeFloors(JsonUtility.FromJson<NativePrototypeGame.Navigation>(game.layoutText.text));var layout=floors[0];
        if (layout.cells.Length != layout.width * layout.height || floors.Length!=4) throw new Exception("Unexpected escape layout.");
        var manifest = JsonUtility.FromJson<NativePrototypeGame.Manifest>(game.manifestText.text);
        if (manifest.schema!=3||manifest.periods.Length!=13||stats[0].triangles != manifest.outdoor.triangles || stats[1].triangles != manifest.indoor.triangles) throw new Exception("Native geometry or historical periods differ from exported source.");
        if (!NativePrototypeGame.IndoorClear(layout, layout.spawn.x * layout.cellSize, layout.spawn.z * layout.cellSize)) throw new Exception("Player spawn blocked.");
        int exits=0;for(int f=0;f<floors.Length;f++)foreach (var exit in floors[f].exits)
        {
            exits++;var route = NativePrototypeGame.RouteBetweenFloors(floors, new Vector2(layout.spawn.x * layout.cellSize, layout.spawn.z * layout.cellSize),0, new Vector2(exit.inside.x,exit.inside.z),f);
            if (route.Count == 0) throw new Exception("Escape exit unreachable: " + exit.name);
        }
        if (!NativePrototypeGame.OutdoorClear(manifest, 0, 40)) throw new Exception("Outdoor spawn blocked.");
        if (NativePrototypeGame.OutdoorClear(manifest, manifest.playBounds.maxX + 1, 40)) throw new Exception("Outdoor boundary must block movement.");
        if(exits!=23)throw new Exception("Expected all 23 reviewed outside-door connections.");
        Debug.Log("NATIVE_VALIDATION_PASS geometry counts, 13 periods, four levels, 23 reachable doors and exterior collision bounds");
    }

    [MenuItem("Escape 1829/Native prototype/Build Windows preview")]
    public static void Windows()
    {
        Prepare(); Build(BuildTarget.StandaloneWindows64, "../out/windows/Escape1829Prototype.exe");
    }
    [MenuItem("Escape 1829/Native prototype/Build Android APK")]
    public static void Android()
    {
        if (!BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.Android, BuildTarget.Android)) throw new Exception("Install Unity Hub Android Build Support, SDK/NDK Tools and OpenJDK.");
        Prepare(); EditorUserBuildSettings.buildAppBundle = false;
        EditorUserBuildSettings.androidBuildSystem = AndroidBuildSystem.Gradle;
        Build(BuildTarget.Android, "../out/escape-1829-native.apk");
    }
    static void Build(BuildTarget target, string output)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(output));
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes = new[] { ScenePath }, target = target, locationPathName = output, options = BuildOptions.None });
        if (report.summary.result != BuildResult.Succeeded) throw new Exception("Native build failed: " + report.summary.result);
        Debug.Log("NATIVE_BUILD_SUCCESS " + Path.GetFullPath(output) + " " + report.summary.totalSize);
    }
}
