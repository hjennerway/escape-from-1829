using System.IO;
using UnityEngine;
public sealed partial class NativePrototypeGame
{
    public Shader uiCaptureShader;
    bool capturingUI;Material captureMaterial;
    // The same atlas glyphs, panels and fitted captions are also drawn into an
    // offscreen target for repeatable visual checks when the player is hidden.
    void DrawCaptureTexture(Rect rect,Texture image,Rect uv,Color tint){captureMaterial.SetVector("_CaptureTint",new Vector4(tint.linear.r,tint.linear.g,tint.linear.b,tint.a));Graphics.DrawTexture(rect,image,uv,0,0,0,0,Color.white,captureMaterial);}
    void DrawImage(Rect rect,Texture image,ScaleMode mode=ScaleMode.StretchToFill)
    {
        if(!image)return;if(mode==ScaleMode.ScaleToFit){float scale=Mathf.Min(rect.width/image.width,rect.height/image.height);rect=new Rect(rect.center.x-image.width*scale/2,rect.center.y-image.height*scale/2,image.width*scale,image.height*scale);}
        if(capturingUI)DrawCaptureTexture(rect,image,new Rect(0,0,1,1),Color.white);else GUI.DrawTexture(rect,image,ScaleMode.StretchToFill);
    }
    void DrawArchivePhoto()
    {
        if(!photoTexture)return;float factor=Mathf.Min(photoArea.width/photoTexture.width,photoArea.height/photoTexture.height)*photoZoom;var size=new Vector2(photoTexture.width*factor,photoTexture.height*factor);
        var rect=new Rect(photoArea.center-size/2+photoPan,size);var clipped=Rect.MinMaxRect(Mathf.Max(rect.x,photoArea.x),Mathf.Max(rect.y,photoArea.y),Mathf.Min(rect.xMax,photoArea.xMax),Mathf.Min(rect.yMax,photoArea.yMax));
        if(clipped.width<=0||clipped.height<=0)return;var uv=new Rect((clipped.x-rect.x)/rect.width,1-(clipped.yMax-rect.y)/rect.height,clipped.width/rect.width,clipped.height/rect.height);
        if(capturingUI)DrawCaptureTexture(clipped,photoTexture,uv,Color.white);else GUI.DrawTextureWithTexCoords(clipped,photoTexture,uv);
    }
    float Slider(Rect rect,float value,float min,float max)
    {
        Fill(new Rect(rect.x,rect.center.y-2,rect.width,4),new Color(.4f,.46f,.36f,.8f));float x=rect.x+Mathf.InverseLerp(min,max,value)*rect.width;Fill(new Rect(x-7,rect.center.y-10,14,20),mint);
        if(!capturingUI&&!Application.isMobilePlatform&&Input.GetMouseButton(0)){var p=UIPosition(Input.mousePosition);if(rect.Contains(p))value=Mathf.Lerp(min,max,(p.x-rect.x)/rect.width);}return value;
    }
    void CaptureUI(string directory,string name,int width=1280)
    {
        Styles();if(!captureMaterial)captureMaterial=new Material(uiCaptureShader);
        var target=new RenderTexture(width,720,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB);var previous=RenderTexture.active;var old=view.targetTexture;float oldAspect=view.aspect;view.targetTexture=target;view.aspect=width/720f;UpdateDeviceLocationMarker();view.Render();RenderTexture.active=target;
        GL.PushMatrix();GL.LoadPixelMatrix(0,width,720,0);GL.MultMatrix(Matrix4x4.Translate(new Vector3((width-1280)/2,0,0)));bool oldSrgb=GL.sRGBWrite;GL.sRGBWrite=true;capturingUI=true;
        var previousViewport=interfaceViewport;var previousSafe=safeViewport;interfaceViewport=safeViewport=new Rect((1280-width)/2,0,width,720);
        try{DrawInterface();}finally{interfaceViewport=previousViewport;safeViewport=previousSafe;capturingUI=false;GL.sRGBWrite=oldSrgb;GL.PopMatrix();}
        var image=new Texture2D(width,720,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,width,720),0,0);image.Apply();File.WriteAllBytes(Path.Combine(directory,name),image.EncodeToPNG());
        view.targetTexture=old;view.aspect=oldAspect;RenderTexture.active=previous;target.Release();Destroy(target);Destroy(image);Check(true,"Interface rendered with live controls: "+name);
    }
}
