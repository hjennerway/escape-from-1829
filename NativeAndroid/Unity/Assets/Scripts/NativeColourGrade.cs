using UnityEngine;
[RequireComponent(typeof(Camera))]
public sealed class NativeColourGrade:MonoBehaviour
{
    public Material material;
    void OnRenderImage(RenderTexture source,RenderTexture destination){if(material)Graphics.Blit(source,destination,material);else Graphics.Blit(source,destination);}
    void OnDestroy(){if(material)Destroy(material);}
}
