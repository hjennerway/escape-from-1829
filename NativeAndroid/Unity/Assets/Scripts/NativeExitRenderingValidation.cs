using System;
using System.Collections;
using System.IO;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    struct InteriorPixels {public float brightness,warmth,dark;}
    InteriorPixels MeasureInterior()
    {
        var target=new RenderTexture(640,360,24,RenderTextureFormat.ARGB32);
        var previous=RenderTexture.active;var old=view.targetTexture;view.targetTexture=target;view.Render();RenderTexture.active=target;
        var image=new Texture2D(640,360,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,640,360),0,0);image.Apply();
        var pixels=image.GetPixels32();double red=0,blue=0,luminance=0;int dark=0;
        foreach(var p in pixels){red+=p.r;blue+=p.b;float l=.2126f*p.r+.7152f*p.g+.0722f*p.b;luminance+=l;if(l<60)dark++;}
        var result=new InteriorPixels{brightness=(float)(luminance/pixels.Length),warmth=(float)(red/Math.Max(1,blue)),dark=(float)dark/pixels.Length};
        view.targetTexture=old;RenderTexture.active=previous;target.Release();Destroy(target);Destroy(image);return result;
    }
    IEnumerator ExitRenderingSmoke(string directory)
    {
        // D8 is the landing in the owner's report. Exercise stick input and
        // movement after the real transition, with both graphics settings.
        foreach(bool saver in new[]{false,true})foreach(bool foliage in new[]{false,true})foreach(int fps in new[]{30,60}){
            StartInside();paused=true;NewEscapeScenario(Array.FindIndex(manifest.escape.variants,v=>v.exitId=="D8"));
            trees=foliage;SetGraphics(saver);serviceKey=true;SyncEscapeScenario();floor=0;layout=floors[0];
            var exit=Array.Find(layout.exits,e=>e.id=="D8");player=XZ(exit.inside);playerY=layout.elevation;UseDoor(exit,0);
            var landing=player;Check(OutsideClearAt(player,playerY),"D8 departure is clear: saver="+saver+", trees="+foliage+", fps="+fps);
            Check(jumpIndex==null&&scenarioJumps==null,"First walking departure does not decode either detailed jump index");
            SetMoveStick(Vector2.up*stickTravel);
            for(int tick=0;tick<fps/2;tick++)Walk(stickVector,1f/fps,sprintHeld);
            Check(Vector2.Distance(player,landing)>1&&OutsideClearAt(player,playerY),"D8 stick walks away after exit: saver="+saver+", trees="+foliage+", fps="+fps);
            SetMoveStick(Vector2.zero);player=landing;playerY=exit.destination.y;PositionView();lodClock=0;UpdateEstateLOD();
            if(foliage&&fps==60){yield return null;Capture(directory,"d8-departure-"+(saver?"saver":"detail")+".png");
                yaw+=.015f;PositionView();yield return null;Capture(directory,"d8-departure-turn-"+(saver?"saver":"detail")+".png");}
            UseDoor(exit,0);Check(Indoors&&floor==0,"D8 remains usable for return after walking");
        }
        trees=true;SetGraphics(false);
        for(int level=0;level<4;level++){
            StartInside();paused=true;floor=level;layout=floors[level];var room=Array.Find(layout.rooms,r=>r.id==(level==2?"B1":level==3?"R41":"R23"));
            player=XZ(room.label);playerY=layout.elevation;ShowFloor();yaw=Mathf.PI/2;pitch=0;PositionView();
            // Compare both shipped endpoints and the halfway adjustment at
            // the same pose; settings alone cannot prove readable GPU output.
            var legacyFill=lightingMode==LightingMode.Day?Hex(0x9aafb4):lightingMode==LightingMode.Dusk?Hex(0x7d9da0)*.7f:Hex(0x394357)*.8f;
            SetInteriorAmbient(legacyFill);view.backgroundColor=RenderSettings.fogColor=Hex(0x343731);RenderSettings.fogDensity=.018f;
            colourGrade.material.SetFloat("_Exposure",1);torch.color=new Color(1,.94f,.8f);torch.intensity=1.2f;
            foreach(var l in lightPool){l.color=Color.white;l.range=9;l.intensity=.4f;}lightClock=0;UpdateInteriorLights();yield return null;
            var legacy=MeasureInterior();Capture(directory,"interior-legacy-"+level+".png");
            SetInteriorAmbient(new Color(.075f,.052f,.032f));view.backgroundColor=RenderSettings.fogColor=Hex(0x29231b);RenderSettings.fogDensity=.024f;
            colourGrade.material.SetFloat("_Exposure",.82f);torch.color=new Color(1,.79f,.52f);torch.intensity=.85f;
            foreach(var l in lightPool){l.color=new Color(1,.68f,.38f);l.range=7;l.intensity=.23f;}lightClock=0;UpdateInteriorLights();yield return null;
            var dark=MeasureInterior();Capture(directory,"interior-dark-"+level+".png");
            SetLighting(true);lightClock=0;UpdateInteriorLights();yield return null;
            var midpoint=MeasureInterior();Capture(directory,"interior-midpoint-"+level+".png");
            float fraction=(midpoint.brightness-dark.brightness)/(legacy.brightness-dark.brightness);
            Check(fraction>.35f&&fraction<.65f,"Interior GPU brightness is near halfway on floor "+level+": dark="+dark.brightness+", midpoint="+midpoint.brightness+", legacy="+legacy.brightness+", fraction="+fraction);
            Check(midpoint.warmth>legacy.warmth&&midpoint.warmth<dark.warmth,"Interior warmth lies between shipped builds on floor "+level+": "+legacy.warmth+" < "+midpoint.warmth+" < "+dark.warmth);
            Check(midpoint.dark>legacy.dark&&midpoint.dark<dark.dark,"Interior shadow coverage lies between shipped builds on floor "+level+": "+legacy.dark+" < "+midpoint.dark+" < "+dark.dark);
        }
        File.WriteAllText(Path.Combine(directory,"exit-rendering-passed.txt"),"D8 actual stick movement at 30/60 FPS, both graphics/tree settings, lazy jump indices, round trips and four-floor GPU halfway-lighting comparisons passed.");
    }
}
