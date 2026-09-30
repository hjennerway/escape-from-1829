using System.Collections.Generic;
using UnityEngine;
public sealed partial class NativePrototypeGame
{
    readonly Dictionary<Font,Dictionary<char,CharacterInfo>> fontGlyphs=new Dictionary<Font,Dictionary<char,CharacterInfo>>();
    Texture2D surfaceTexture,hoverTexture,selectedTexture,emptyTexture,titleShade;
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
    void Panel(Rect rect){Fill(new Rect(rect.x+5,rect.y+7,rect.width,rect.height),new Color(0,0,0,.22f));Fill(rect,ink);Border(rect,new Color(.74f,.8f,.6f,.4f));}
    void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);}
    GUIStyle FitButton(Rect rect,string caption,bool selected=false){var s=new GUIStyle(button){fontSize=18};while(s.fontSize>12&&TextWidth(caption,s)>rect.width-24)s.fontSize--;s.normal.textColor=selected?Hex(0x182016):Hex(0xe6e4cf);return s;}
    bool Choice(Rect rect,string caption,bool selected){return Button(rect,(selected?"● ":"○ ")+caption,selected);}
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
