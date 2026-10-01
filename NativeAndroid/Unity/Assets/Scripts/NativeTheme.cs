using System.Collections.Generic;
using UnityEngine;
public sealed partial class NativePrototypeGame
{
    public Texture2D lightingIcons,locationIcon;
    readonly Dictionary<Font,Dictionary<char,CharacterInfo>> fontGlyphs=new Dictionary<Font,Dictionary<char,CharacterInfo>>();
    Texture2D surfaceTexture,hoverTexture,selectedTexture,panelShadow,titleShade,daySurface,duskSurface,nightSurface,movementSurface;
    GUIStyle serif,eyebrow,primaryButton;bool showTouchPreview;
    Dictionary<char,CharacterInfo> Glyphs(Font font){if(!fontGlyphs.TryGetValue(font,out var glyphs)){glyphs=new Dictionary<char,CharacterInfo>();foreach(var g in font.characterInfo)glyphs[(char)g.index]=g;fontGlyphs[font]=glyphs;}return glyphs;}
    float TextWidth(string value,GUIStyle style){float width=0;var font=style.font?style.font:bodyFont;var glyphs=Glyphs(font);foreach(char c in value)if(glyphs.TryGetValue(c,out var g))width+=g.advance;return width*style.fontSize/font.fontSize;}
    List<string> TextLines(string value,GUIStyle style,float width)
    {
        var lines=new List<string>();foreach(string paragraph in value.Split('\n')){
            if(!style.wordWrap){lines.Add(paragraph);continue;}string line="";foreach(string word in paragraph.Split(' ')){string next=line.Length==0?word:line+" "+word;if(line.Length>0&&TextWidth(next,style)>width){lines.Add(line);line=word;}else line=next;}lines.Add(line);
        }return lines;
    }
    GUIStyle FitHeading(Rect area,string value){var style=new GUIStyle(heading){fontSize=23};while(style.fontSize>14&&TextLines(value,style,area.width).Count*style.fontSize*1.26f>area.height)style.fontSize--;return style;}
    void Label(Rect area,string value,GUIStyle style)
    {
        if(string.IsNullOrEmpty(value))return;
        var font=style.font?style.font:bodyFont;var glyphs=Glyphs(font);float size=(float)style.fontSize/font.fontSize,lineHeight=style.fontSize*1.26f;
        var lines=TextLines(value,style,area.width);
        float top=area.y;if(style.alignment==TextAnchor.MiddleCenter||style.alignment==TextAnchor.MiddleLeft)top+=(area.height-lines.Count*lineHeight)/2;
        var tint=capturingUI?Color.white:GUI.color;if(!capturingUI)GUI.color=style.normal.textColor;
        foreach(string line in lines){float x=area.x;if(style.alignment==TextAnchor.MiddleCenter||style.alignment==TextAnchor.UpperCenter)x+=(area.width-TextWidth(line,style))/2;
            float baseline=top+style.fontSize*.96f;
            foreach(char c in line)if(glyphs.TryGetValue(c,out var g)){
                if(c!=' '){var rect=new Rect(x+g.minX*size,baseline-g.maxY*size,(g.maxX-g.minX)*size,(g.maxY-g.minY)*size);var uv=Rect.MinMaxRect(g.uvBottomLeft.x,g.uvBottomLeft.y,g.uvTopRight.x,g.uvTopRight.y);if(capturingUI)DrawCaptureTexture(rect,font.material.mainTexture,uv,style.normal.textColor);else GUI.DrawTextureWithTexCoords(rect,font.material.mainTexture,uv,true);}
                x+=g.advance*size;
            }top+=lineHeight;
        }if(!capturingUI)GUI.color=tint;
    }
    Texture2D Solid(Color color){var t=new Texture2D(1,1);t.SetPixel(0,0,color);t.Apply(false,true);return t;}
    const int surfaceSize=32,cornerRadius=6;
    Texture2D RoundedSurface(Color fill,Color border)
    {
        var image=new Texture2D(surfaceSize,surfaceSize,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
        for(int y=0;y<surfaceSize;y++)for(int x=0;x<surfaceSize;x++){
            float dx=Mathf.Max(Mathf.Abs(x+.5f-surfaceSize/2f)-(surfaceSize/2f-cornerRadius),0);
            float dy=Mathf.Max(Mathf.Abs(y+.5f-surfaceSize/2f)-(surfaceSize/2f-cornerRadius),0);
            float distance=Mathf.Sqrt(dx*dx+dy*dy)-cornerRadius;
            var color=Color.Lerp(fill,border,Mathf.Clamp01(distance+1.5f));color.a*=Mathf.Clamp01(.5f-distance);image.SetPixel(x,y,color);
        }image.Apply(false,true);return image;
    }
    void Surface(Rect rect,Texture2D image)
    {
        float edge=Mathf.Min(cornerRadius,Mathf.Min(rect.width,rect.height)/2),uvEdge=(float)cornerRadius/surfaceSize;
        for(int y=0;y<3;y++)for(int x=0;x<3;x++){
            var area=new Rect(x==0?rect.x:x==1?rect.x+edge:rect.xMax-edge,y==0?rect.y:y==1?rect.y+edge:rect.yMax-edge,x==1?rect.width-2*edge:edge,y==1?rect.height-2*edge:edge);
            var tex=new Rect(x==0?0:x==1?uvEdge:1-uvEdge,y==0?1-uvEdge:y==1?uvEdge:0,x==1?1-2*uvEdge:uvEdge,y==1?1-2*uvEdge:uvEdge);
            if(capturingUI)DrawCaptureTexture(area,image,tex,Color.white);else GUI.DrawTextureWithTexCoords(area,image,tex,true);
        }
    }
    bool ButtonSurface(Rect rect,bool selected=false,string tooltip="")
    {
        bool pressed=!capturingUI&&!Application.isMobilePlatform&&GUI.Button(rect,new GUIContent("",tooltip),GUIStyle.none);
        bool hover=!capturingUI&&!Application.isMobilePlatform&&rect.Contains(Event.current.mousePosition);
        Surface(rect,selected?selectedTexture:hover?hoverTexture:surfaceTexture);return pressed;
    }
    void Panel(Rect rect){if(!panelShadow)panelShadow=RoundedSurface(new Color(0,0,0,.22f),new Color(0,0,0,.22f));Surface(new Rect(rect.x+5,rect.y+7,rect.width,rect.height),panelShadow);Surface(rect,surfaceTexture);}
    void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);}
    GUIStyle FitButton(Rect rect,string caption,bool selected=false){var s=new GUIStyle(button){fontSize=18};while(s.fontSize>12&&TextWidth(caption,s)>rect.width-24)s.fontSize--;s.normal.textColor=selected?Hex(0x182016):Hex(0xe6e4cf);return s;}
    bool Choice(Rect rect,string caption,bool selected){return Button(rect,(selected?"● ":"○ ")+caption,selected);}
    void DrawTimeOfDay()
    {
        if(TimeOfDayButton(dayButton,LightingMode.Day))SetTimeOfDay(LightingMode.Day);
        if(TimeOfDayButton(duskButton,LightingMode.Dusk))SetTimeOfDay(LightingMode.Dusk);
        if(TimeOfDayButton(nightButton,LightingMode.Night))SetTimeOfDay(LightingMode.Night);
    }
    bool TimeOfDayButton(Rect rect,LightingMode value)
    {
        bool selected=lightingMode==value,pressed=false;
        if(!capturingUI&&!Application.isMobilePlatform)pressed=GUI.Button(rect,new GUIContent("",value.ToString()),GUIStyle.none);
        Color foreground=selected?Hex(value==LightingMode.Day?0x26331du:value==LightingMode.Dusk?0x342f29u:0xffe4afu):new Color(.894f,.91f,.859f,.6f);
        if(!daySurface){daySurface=RoundedSurface(Hex(0xd4dfb9),Hex(0xd4dfb9));duskSurface=RoundedSurface(Hex(0xe7bb80),Hex(0xe7bb80));nightSurface=RoundedSurface(Hex(0x293e60),Hex(0x293e60));}
        Surface(rect,selected?(value==LightingMode.Day?daySurface:value==LightingMode.Dusk?duskSurface:nightSurface):surfaceTexture);
        var icon=new Rect(rect.center.x-13,rect.center.y-13,26,26);var uv=new Rect((int)value/3f,0,1/3f,1);
        if(capturingUI)DrawCaptureTexture(icon,lightingIcons,uv,foreground);
        else{var previous=GUI.color;GUI.color=foreground;GUI.DrawTextureWithTexCoords(icon,lightingIcons,uv,true);GUI.color=previous;}
        return pressed;
    }
    bool LocationButton()
    {
        bool pressed=ButtonSurface(locateButton,false,"Show my location");var icon=new Rect(locateButton.center.x-13,locateButton.center.y-13,26,26);
        Color color=locatingDevice?new Color(.894f,.91f,.859f,.4f):Hex(0xe4e8db);
        if(capturingUI)DrawCaptureTexture(icon,locationIcon,new Rect(0,0,1,1),color);
        else{var previous=GUI.color;GUI.color=color;GUI.DrawTexture(icon,locationIcon);GUI.color=previous;}
        return pressed;
    }
    void DrawTitle()
    {
        if(!titleShade){titleShade=new Texture2D(256,1){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};for(int x=0;x<256;x++)titleShade.SetPixel(x,0,new Color(.025f,.047f,.03f,Mathf.Lerp(.80f,0,Mathf.SmoothStep(0,1,x/255f))));titleShade.Apply(false,true);}
        DrawImage(new Rect(interfaceViewport.x,interfaceViewport.y,950-interfaceViewport.x,interfaceViewport.height),titleShade);
        Label(new Rect(62,34,250,36),"1829",new GUIStyle(heading){fontSize=28});
        Label(new Rect(62,76,500,25),"CHESHIRE COUNTY ASYLUM",new GUIStyle(eyebrow){fontSize=12});
        Label(new Rect(108,172,620,114),"ESCAPE",new GUIStyle(title){fontSize=94,alignment=TextAnchor.UpperLeft});
        Label(new Rect(108,272,690,114),"FROM 1829.",new GUIStyle(title){fontSize=94,alignment=TextAnchor.UpperLeft});
        Label(new Rect(110,398,760,44),"Explore the asylum or find a way out before they find you.",new GUIStyle(serif){fontSize=18});
        if(Button(insideButton,"ASYLUM ESCAPE   ↗"))StartArrival();
        if(Button(outsideButton,"EXPLORE ON FOOT     →"))BeginIntroFlight(false);
        if(Button(aerialButton,"AERIAL VIEW   ↗",true))BeginIntroFlight(true);
        Label(new Rect(108,645,740,35),"TWO FLOORS  ·  FOURTEEN ROUTES  ·  FIVE OPEN EXITS",new GUIStyle(small){fontSize=13});
    }
}
