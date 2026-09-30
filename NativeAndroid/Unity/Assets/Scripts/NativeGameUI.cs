using System;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    GUIStyle text,small,heading,title,button,centered,label;Texture2D pixel;
    readonly Color ink=new Color(.035f,.052f,.052f,.96f),mint=new Color(.57f,.88f,.73f),amber=new Color(.94f,.71f,.38f);
    Rect safe;float uiScale;int stickFinger=-1,lookFinger=-1;Vector2 stickOrigin,touchDown;float lookMovement;
    readonly Rect insideButton=new Rect(345,330,590,60),outsideButton=new Rect(345,408,590,60),aerialButton=new Rect(345,486,590,60);
    readonly Rect pauseButton=new Rect(1154,28,100,44),mapButton=new Rect(1036,28,106,44),helpButton=new Rect(924,28,100,44);
    readonly Rect useButton=new Rect(1080,570,168,90),torchButton=new Rect(950,595,116,66),sprintButton=new Rect(268,594,116,66),crouchButton=new Rect(398,594,120,66);
    readonly Rect resumeButton=new Rect(345,350,590,60),homeButton=new Rect(345,423,590,60),fpsButton=new Rect(345,508,285,48),resolutionButton=new Rect(650,508,285,48),soundButton=new Rect(345,570,285,48),detailsButton=new Rect(650,570,285,48);
    readonly Rect sensitivitySlider=new Rect(560,640,375,24),yearSlider=new Rect(460,650,350,28),prevYearButton=new Rect(392,636,58,48),nextYearButton=new Rect(820,636,58,48);
    readonly Rect locationsButton=new Rect(490,28,182,44),viewButton=new Rect(686,28,122,44),treeButton=new Rect(24,206,130,43),dayButton=new Rect(24,258,130,43),locateButton=new Rect(24,154,130,43);
    readonly Rect closePictureButton=new Rect(1106,90,116,44),prevPhotoButton=new Rect(292,624,116,48),nextPhotoButton=new Rect(864,624,116,48),zoomOutButton=new Rect(999,624,68,48),zoomInButton=new Rect(1076,624,68,48);
    readonly Rect photoArea=new Rect(292,165,856,405),retryButton=new Rect(650,580,285,50),resultHomeButton=new Rect(345,580,285,50);
    readonly Rect helpResumeButton=new Rect(345,586,590,60),locationsViewport=new Rect(250,170,920,440);
    int listFinger=-1;Vector2 listDown;float listMovement;
    void SetUIScale(){safe=Screen.safeArea;uiScale=Mathf.Min(safe.width/1280,safe.height/720);if(uiScale<=0)uiScale=1;}
    Vector2 UIPosition(Vector2 p)=>new Vector2((p.x-safe.x-(safe.width-1280*uiScale)/2)/uiScale,(Screen.height-p.y-(Screen.height-safe.yMax)-(safe.height-720*uiScale)/2)/uiScale);
    bool PointerOverControls(Vector2 p)=>p.y<130||useButton.Contains(p)||torchButton.Contains(p)||sprintButton.Contains(p)||crouchButton.Contains(p)||new Rect(380,625,515,80).Contains(p)||p.x<175&&p.y<310;
    void TouchInput()
    {
        sprintHeld=useHeld=false;
        if(selectedBuilding>=0&&Input.touchCount==2){var a=Input.GetTouch(0);var b=Input.GetTouch(1);float before=Vector2.Distance(a.position-a.deltaPosition,b.position-b.deltaPosition);if(before>0)photoZoom=Mathf.Clamp(photoZoom*Vector2.Distance(a.position,b.position)/before,1,5);}
        foreach(var touch in Input.touches){
            var p=UIPosition(touch.position);
            if(locationsOpen&&selectedBuilding<0&&LocationTouch(touch.fingerId,p,touch.deltaPosition.y/uiScale,touch.phase))continue;
            if(touch.phase==TouchPhase.Ended||touch.phase==TouchPhase.Canceled){if(touch.fingerId==stickFinger){stickFinger=-1;stickVector=Vector2.zero;}if(touch.fingerId==lookFinger){if(lookMovement<7&&(mode==Mode.Aerial||mode==Mode.Outside)&&selectedBuilding<0)PickBuilding(touch.position);lookFinger=-1;}continue;}
            if(touch.phase==TouchPhase.Began){if(HandleTap(p))continue;if(selectedBuilding>=0)continue;
                if(!paused&&!map&&!help&&(mode==Mode.Outside||mode==Mode.Inside)&&p.x<440&&p.y>340&&!sprintButton.Contains(p)&&!crouchButton.Contains(p)&&stickFinger<0){stickFinger=touch.fingerId;stickOrigin=p;}
                else if(!paused&&!map&&!help&&lookFinger<0&&!PointerOverControls(p)){lookFinger=touch.fingerId;touchDown=p;lookMovement=0;}
            }
            if(selectedBuilding>=0){if(photoArea.Contains(p)&&Input.touchCount==1&&touch.phase==TouchPhase.Moved)photoPan+=new Vector2(touch.deltaPosition.x,-touch.deltaPosition.y)/uiScale;continue;}
            if(paused){if(sensitivitySlider.Contains(p)){sensitivity=Mathf.Lerp(.4f,3,(p.x-sensitivitySlider.x)/sensitivitySlider.width);PlayerPrefs.SetFloat("sensitivity",sensitivity);}continue;}if(help||map||locationsOpen)continue;
            if((mode==Mode.Outside||mode==Mode.Aerial)&&yearSlider.Contains(p)){SetPeriod(Mathf.RoundToInt((p.x-yearSlider.x)/yearSlider.width*12));continue;}
            if(touch.fingerId==stickFinger)stickVector=Vector2.ClampMagnitude(new Vector2(p.x-stickOrigin.x,stickOrigin.y-p.y)/70,1);
            if(touch.fingerId==lookFinger&&touch.phase==TouchPhase.Moved){lookMovement+=touch.deltaPosition.magnitude/uiScale;if(mode==Mode.Aerial&&Input.touchCount==1){orbitYaw+=touch.deltaPosition.x/uiScale*.22f;orbitPitch=Mathf.Clamp(orbitPitch-touch.deltaPosition.y/uiScale*.18f,8,86);}else if(mode==Mode.Outside||mode==Mode.Inside){yaw-=touch.deltaPosition.x/uiScale*.003f*sensitivity;pitch=Mathf.Clamp(pitch+touch.deltaPosition.y/uiScale*.003f*sensitivity,-1.25f,1.25f);}}
            if(sprintButton.Contains(p))sprintHeld=true;if(useButton.Contains(p))useHeld=true;
        }
    }
    bool HandleTap(Vector2 p)
    {
        if(selectedBuilding>=0){if(closePictureButton.Contains(p)){CloseBuilding();return true;}if(prevPhotoButton.Contains(p)){ChangePhoto(-1);return true;}if(nextPhotoButton.Contains(p)){ChangePhoto(1);return true;}if(zoomOutButton.Contains(p)){photoZoom=Mathf.Max(1,photoZoom/1.4f);return true;}if(zoomInButton.Contains(p)){photoZoom=Mathf.Min(5,photoZoom*1.4f);return true;}return false;}
        if(mode==Mode.Title){if(insideButton.Contains(p)){StartArrival();return true;}if(outsideButton.Contains(p)){StartOutside();return true;}if(aerialButton.Contains(p)){StartAerial();return true;}return false;}
        if(mode==Mode.Arrival||mode==Mode.Escape){if(pauseButton.Contains(p)){if(mode==Mode.Arrival)StartInside();else mode=Mode.Escaped;return true;}return false;}
        if(mode==Mode.Caught||mode==Mode.Escaped){if(retryButton.Contains(p)){StartArrival();return true;}if(resultHomeButton.Contains(p)){Home();return true;}return false;}
        if(help){if(closePictureButton.Contains(p)||helpResumeButton.Contains(p)){help=false;LockMouse();return true;}return false;}
        if(pauseButton.Contains(p)){TogglePause();return true;}
        if(paused){if(resumeButton.Contains(p)){TogglePause();return true;}if(homeButton.Contains(p)){Home();return true;}if(fpsButton.Contains(p)){ChangeFPS();return true;}if(resolutionButton.Contains(p)){ChangeGraphics();return true;}if(soundButton.Contains(p)){audioOn=!audioOn;PlayerPrefs.SetInt("audio",audioOn?1:0);return true;}if(detailsButton.Contains(p)){diagnostics=!diagnostics;return true;}if(sensitivitySlider.Contains(p)){sensitivity=Mathf.Lerp(.4f,3,(p.x-sensitivitySlider.x)/sensitivitySlider.width);PlayerPrefs.SetFloat("sensitivity",sensitivity);return true;}return false;}
        if(locationsOpen){if(closePictureButton.Contains(p)){locationsOpen=false;return true;}return false;}
        if(helpButton.Contains(p)){help=true;UnlockMouse();return true;}if(mapButton.Contains(p)){map=!map;stickVector=Vector2.zero;return true;}if(torchButton.Contains(p)){torch.enabled=!torch.enabled;return true;}if(crouchButton.Contains(p)&&mode==Mode.Inside){crouchToggle=!crouchToggle;return true;}
        if(mode==Mode.Outside||mode==Mode.Aerial){if(locationsButton.Contains(p)){locationsOpen=true;UnlockMouse();return true;}if(viewButton.Contains(p)){if(mode==Mode.Outside)StartAerial();else StartOutside();return true;}if(treeButton.Contains(p)){trees=!trees;RefreshEstateVisibility();return true;}if(dayButton.Contains(p)){night=!night;SetLighting(false);return true;}if(locateButton.Contains(p)){StartCoroutine(LocateDevice());return true;}if(prevYearButton.Contains(p)){SetPeriod(periodIndex-1);return true;}if(nextYearButton.Contains(p)){SetPeriod(periodIndex+1);return true;}}
        return false;
    }
    void ChangeFPS(){fpsCap=fpsCap==60?30:60;Application.targetFrameRate=fpsCap;PlayerPrefs.SetInt("fps",fpsCap);}
    bool LocationTouch(int id,Vector2 p,float deltaY,TouchPhase phase)
    {
        if(phase==TouchPhase.Began&&locationsViewport.Contains(p)){listFinger=id;listDown=p;listMovement=0;return true;}
        if(id!=listFinger)return false;
        var visible=manifest.periods[periodIndex].buildings;
        if(phase==TouchPhase.Moved){listMovement+=(p-listDown).magnitude;listDown=p;locationsScroll.y=Mathf.Clamp(locationsScroll.y+deltaY,0,Mathf.Max(0,visible.Length*58-440));}
        if(phase==TouchPhase.Ended||phase==TouchPhase.Canceled){listFinger=-1;if(phase==TouchPhase.Ended&&listMovement<7&&locationsViewport.Contains(p)){int row=Mathf.FloorToInt((p.y-locationsViewport.y+locationsScroll.y)/58);if(row>=0&&row<visible.Length){int index=visible[row].index;GoToBuilding(index);SelectBuilding(index);}}}
        return true;
    }
    void ChangeGraphics(){lowGraphics=!lowGraphics;PlayerPrefs.SetInt("graphics",lowGraphics?1:0);ApplyGraphics();}
    void ApplyGraphics(){QualitySettings.antiAliasing=lowGraphics?0:2;QualitySettings.pixelLightCount=lowGraphics?1:3;float factor=Mathf.Min(1,(lowGraphics?1280f:1920f)/Mathf.Max(Display.main.systemWidth,Display.main.systemHeight));Screen.SetResolution(Mathf.RoundToInt(Display.main.systemWidth*factor),Mathf.RoundToInt(Display.main.systemHeight*factor),true);}
    void Styles(){if(text!=null)return;text=new GUIStyle(GUI.skin.label){fontSize=22,wordWrap=true};text.normal.textColor=Color.white;small=new GUIStyle(text){fontSize=17};small.normal.textColor=new Color(.74f,.81f,.79f);heading=new GUIStyle(text){fontSize=25,fontStyle=FontStyle.Bold};heading.normal.textColor=mint;title=new GUIStyle(text){fontSize=54,fontStyle=FontStyle.Bold,alignment=TextAnchor.MiddleCenter};centered=new GUIStyle(text){alignment=TextAnchor.MiddleCenter};label=new GUIStyle(small){alignment=TextAnchor.MiddleCenter};button=new GUIStyle(GUI.skin.button){fontSize=22,fontStyle=FontStyle.Bold,alignment=TextAnchor.MiddleCenter};}
    void Fill(Rect rect,Color color){var previous=GUI.color;GUI.color=color;GUI.DrawTexture(rect,pixel);GUI.color=previous;}
    bool Button(Rect rect,string caption){if(Application.isMobilePlatform){GUI.Box(rect,caption,button);return false;}return GUI.Button(rect,caption,button);}
    void OnGUI()
    {
        if(!initialized||!pixel)return;Styles();SetUIScale();var before=GUI.matrix;GUI.matrix=Matrix4x4.TRS(new Vector3(safe.x+(safe.width-1280*uiScale)/2,Screen.height-safe.yMax+(safe.height-720*uiScale)/2,0),Quaternion.identity,new Vector3(uiScale,uiScale,1));
        if(mode==Mode.Title){Fill(new Rect(300,90,680,540),ink);GUI.Label(new Rect(345,115,590,35),"CHESTER COUNTY ASYLUM",new GUIStyle(heading){alignment=TextAnchor.MiddleCenter});GUI.Label(new Rect(325,176,630,80),"ESCAPE FROM 1829",title);GUI.Label(new Rect(345,265,590,45),"Explore the grounds or escape before they find you.",centered);if(Button(insideButton,"ASYLUM ESCAPE"))StartArrival();if(Button(outsideButton,"EXPLORE ON FOOT"))StartOutside();if(Button(aerialButton,"AERIAL EXPLORATION"))StartAerial();GUI.Label(new Rect(345,563,590,44),"Two floors · fourteen possible routes · five open exits",label);}
        else if(mode==Mode.Arrival||mode==Mode.Escape){Fill(new Rect(345,600,590,70),ink);GUI.Label(new Rect(355,611,570,55),mode==Mode.Arrival?"THE 1829 BUILDING · CHESTER":"OUTSIDE. AT LAST.",centered);if(Button(pauseButton,"SKIP")){if(mode==Mode.Arrival)StartInside();else mode=Mode.Escaped;}}
        else if(mode==Mode.Caught||mode==Mode.Escaped){Fill(new Rect(280,85,720,585),ink);GUI.Label(new Rect(320,118,640,77),mode==Mode.Escaped?"YOU ESCAPED":"CAPTURED",title);GUI.Label(new Rect(325,220,630,320),status,new GUIStyle(text){fontSize=21});if(Button(resultHomeButton,"BACK TO TITLE"))Home();if(Button(retryButton,"TRY AGAIN"))StartArrival();}
        else{
            Fill(new Rect(22,22,440,104),ink);GUI.Label(new Rect(40,33,410,34),mode==Mode.Inside?(floor==0?"GROUND FLOOR":"UPPER FLOOR"):mode==Mode.Aerial?"AERIAL EXPLORATION":"EXPLORE ON FOOT",heading);
            int exits=0;foreach(int i in activeExits)if(i/7==floor)exits++;GUI.Label(new Rect(40,72,410,40),mode==Mode.Inside?exits+" exits this floor · "+TimeLabel(elapsed):manifest.periods[periodIndex].year+" · "+manifest.periods[periodIndex].title,small);
            GUI.Label(new Rect(817,33,105,40),Mathf.RoundToInt(displayedFPS)+" FPS",small);
            if(Button(helpButton,"HELP")){help=true;UnlockMouse();}if(Button(mapButton,map?"CLOSE":"MAP")){map=!map;if(map)UnlockMouse();else LockMouse();}if(Button(pauseButton,paused?"RESUME":"PAUSE"))TogglePause();
            if(paused)DrawPause();else if(help)DrawHelp();else if(selectedBuilding>=0)DrawBuilding();else if(locationsOpen)DrawLocations();else if(map)DrawMap();else{
                if(mode==Mode.Outside||mode==Mode.Aerial){DrawExplore();}
                if(mode==Mode.Inside){DrawFloorPlan(new Rect(24,142,225,180),floor,false);Fill(new Rect(26,334,220,27),ink);GUI.Label(new Rect(34,338,205,24),"YOU · GHOST · SECURITY",small);Fill(new Rect(25,372,220,7),new Color(.2f,.25f,.2f));Fill(new Rect(25,372,220*stamina,7),mint);GUI.Label(new Rect(25,389,220,30),crouching?"CROUCHING · QUIET":sprinting?"SPRINTING · LOUD":"STAMINA",small);if(elapsed<5||spotted){Fill(new Rect(440,137,405,40),ink);GUI.Label(new Rect(450,142,385,30),elapsed<5?"FIVE-SECOND HEAD START":"YOU'VE BEEN SPOTTED",label);}}
                if(mode!=Mode.Aerial){Fill(new Rect(638,355,4,10),mint);Fill(new Rect(635,358,10,4),mint);if(prompt!=""){Fill(new Rect(320,474,640,62),ink);GUI.Label(new Rect(336,486,608,40),prompt,centered);}if(hold>0)Fill(new Rect(400,544,480*Mathf.Clamp01(hold/.5f),5),mint);DrawMovement();}
                if(diagnostics)DrawDiagnostics();
            }
            if(viewingArt!=null){Fill(new Rect(130,70,1020,580),ink);var item=manifest.art[viewingArt.index];if(!item.imageOnly)GUI.Label(new Rect(165,90,950,50),item.title,centered);if(artworkTexture)GUI.DrawTexture(new Rect(170,145,940,440),artworkTexture,ScaleMode.ScaleToFit);GUI.Label(new Rect(165,606,950,30),"RELEASE USE TO RETURN",label);}
        }
        GUI.matrix=before;
    }
    string TimeLabel(float t)=>Mathf.FloorToInt(t/60).ToString("00")+":"+(Mathf.FloorToInt(t)%60).ToString("00");
    void DrawPause(){Fill(new Rect(300,190,680,500),ink);GUI.Label(new Rect(325,220,630,70),"PAUSED",title);if(Button(resumeButton,"RESUME"))TogglePause();if(Button(homeButton,"BACK TO TITLE"))Home();if(Button(fpsButton,fpsCap+" FPS LIMIT"))ChangeFPS();if(Button(resolutionButton,lowGraphics?"BATTERY SAVER":"HIGH DETAIL"))ChangeGraphics();if(Button(soundButton,audioOn?"SOUND ON":"SOUND OFF")){audioOn=!audioOn;PlayerPrefs.SetInt("audio",audioOn?1:0);}if(Button(detailsButton,diagnostics?"DETAILS ON":"DETAILS OFF"))diagnostics=!diagnostics;GUI.Label(new Rect(345,629,205,30),"Look sensitivity",small);float previous=sensitivity;if(Application.isMobilePlatform)GUI.HorizontalSlider(sensitivitySlider,sensitivity,.4f,3);else sensitivity=GUI.HorizontalSlider(sensitivitySlider,sensitivity,.4f,3);if(previous!=sensitivity)PlayerPrefs.SetFloat("sensitivity",sensitivity);}
    void DrawHelp(){Fill(new Rect(270,90,740,580),ink);GUI.Label(new Rect(310,120,660,64),"KEEP MOVING. STAY QUIET.",heading);GUI.Label(new Rect(310,208,660,350),"Left stick: move. Drag the right side: look. Hold RUN to sprint; CROUCH makes you harder to spot.\n\nSecurity pursues on sight. The Deva ghost senses you through walls. Aim your torch at it to slow it down.\n\nHold USE at either staircase to change floors, at an open exit to escape, or beside wall artwork to inspect it. Enemies pause while USE is held.\n\nFive of fourteen exits open each time the app loads. You have a five-second head start.",text);if(Button(helpResumeButton,"RESUME")){help=false;LockMouse();}}
    void DrawMovement(){if(Application.isMobilePlatform||Input.touchCount>0){var origin=stickFinger>=0?stickOrigin:new Vector2(138,578);Fill(new Rect(origin.x-68,origin.y-68,136,136),new Color(.12f,.19f,.18f,.68f));Fill(new Rect(origin.x+stickVector.x*45-20,origin.y-stickVector.y*45-20,40,40),mint);GUI.Label(new Rect(82,668,160,25),"MOVE",label);Button(sprintButton,"RUN");Button(useButton,"HOLD USE");if(mode==Mode.Inside&&Button(crouchButton,crouchToggle?"STAND":"CROUCH"))crouchToggle=!crouchToggle;}else GUI.Label(new Rect(28,685,930,28),"WASD move · mouse look · Shift run · C crouch · E use · F torch · Tab map · H help · Esc pause",small);if(Button(torchButton,torch.enabled?"TORCH ON":"TORCH OFF"))torch.enabled=!torch.enabled;}
    void DrawExplore(){if(Button(locationsButton,"LOCATIONS")){locationsOpen=true;UnlockMouse();}if(Button(viewButton,mode==Mode.Outside?"AERIAL":"WALK")){if(mode==Mode.Outside)StartAerial();else StartOutside();}if(Button(treeButton,trees?"TREES ON":"TREES OFF")){trees=!trees;RefreshEstateVisibility();}if(Button(dayButton,night?"NIGHT":"DAY")){night=!night;SetLighting(false);}if(Button(locateButton,"MY POSITION"))StartCoroutine(LocateDevice());Fill(new Rect(382,586,510,110),ink);GUI.Label(new Rect(399,595,477,38),manifest.periods[periodIndex].year+" · "+manifest.periods[periodIndex].title,label);if(Button(prevYearButton,"‹"))SetPeriod(periodIndex-1);if(Button(nextYearButton,"›"))SetPeriod(periodIndex+1);if(Application.isMobilePlatform)GUI.HorizontalSlider(yearSlider,periodIndex,0,12);else{int year=Mathf.RoundToInt(GUI.HorizontalSlider(yearSlider,periodIndex,0,12));if(year!=periodIndex)SetPeriod(year);}if(locationMessage!="")GUI.Label(new Rect(175,156,470,55),locationMessage,small);}
    void DrawFloorPlan(Rect area,int selected,bool names)
    {
        Fill(area,ink);var plan=floors[selected];float cell=Mathf.Min((area.width-12)/plan.width,(area.height-12)/plan.height),left=area.x+(area.width-plan.width*cell)/2,top=area.y+(area.height-plan.height*cell)/2;
        for(int z=0;z<plan.height;z++)for(int x=0;x<plan.width;x++)if(plan.cells[z*plan.width+x]==1)Fill(new Rect(left+x*cell,top+z*cell,Mathf.Max(1,cell-.8f),Mathf.Max(1,cell-.8f)),new Color(.29f,.36f,.34f));
        foreach(var s in plan.stairs){Fill(new Rect(left+s.x*cell-2,top+s.z*cell-2,cell+3,cell+3),amber);if(names)GUI.Label(new Rect(left+s.x*cell-8,top+s.z*cell-8,24,25),selected==0?"U":"D",small);}
        for(int i=0;i<plan.exits.Length;i++)if(activeExits.Contains(selected*7+i)){var e=plan.exits[i];Fill(new Rect(left+e.x*cell-2,top+e.z*cell-2,cell+3,cell+3),mint);}
        if(floor==selected)Fill(new Rect(left+player.x/plan.cellSize*cell-3,top+player.y/plan.cellSize*cell-3,6,6),Color.white);
        foreach(var e in enemies)if(e.floor==selected)Fill(new Rect(left+e.position.x/plan.cellSize*cell-3,top+e.position.y/plan.cellSize*cell-3,6,6),e.type==2?new Color(.4f,.8f,.7f):amber);
    }
    void DrawMap(){Fill(new Rect(285,142,710,520),ink);GUI.Label(new Rect(310,162,660,42),mode==Mode.Inside?(floor==0?"GROUND FLOOR · GAME ROUTES":"UPPER FLOOR · GAME ROUTES"):"ESTATE · "+manifest.periods[periodIndex].year,heading);if(mode==Mode.Inside){DrawFloorPlan(new Rect(372,218,536,380),floor,true);GUI.Label(new Rect(310,615,660,31),"WHITE: YOU · GREEN: EXITS · AMBER: STAIRS / SECURITY",label);}else{GUI.Label(new Rect(315,227,650,80),manifest.periods[periodIndex].description,text);float scale=.55f;foreach(var b in manifest.periods[periodIndex].buildings)Fill(new Rect(380+(b.minX+140)*scale,375+(b.minZ+255)*scale,Mathf.Max(2,(b.maxX-b.minX)*scale),Mathf.Max(2,(b.maxZ-b.minZ)*scale)),mint);GUI.Label(new Rect(310,615,660,30),"Open LOCATIONS to visit a building and its photographs.",label);}}
    void DrawLocations(){Fill(new Rect(210,80,1020,610),ink);GUI.Label(new Rect(250,104,760,55),"LOCATIONS · "+manifest.periods[periodIndex].year,heading);if(Button(closePictureButton,"CLOSE"))locationsOpen=false;var visible=manifest.periods[periodIndex].buildings;var viewport=new Rect(250,170,920,440);locationsScroll=GUI.BeginScrollView(viewport,locationsScroll,new Rect(0,0,880,visible.Length*58));for(int i=0;i<visible.Length;i++){int index=visible[i].index;var rect=new Rect(5,i*58,870,48);if(GUI.Button(rect,manifest.buildings[index].name,button)){GoToBuilding(index);SelectBuilding(index);}}GUI.EndScrollView();GUI.Label(new Rect(250,625,900,32),locationMessage,small);}
    void DrawBuilding(){Fill(new Rect(250,72,980,620),ink);var b=manifest.buildings[selectedBuilding];GUI.Label(new Rect(285,92,800,65),b.name,heading);GUI.Label(new Rect(292,139,856,24),BuildingDates(),small);if(Button(closePictureButton,"CLOSE"))CloseBuilding();var photos=BuildingPhotos();if(photoTexture){GUI.BeginGroup(photoArea);float factor=Mathf.Min(photoArea.width/photoTexture.width,photoArea.height/photoTexture.height)*photoZoom;var size=new Vector2(photoTexture.width*factor,photoTexture.height*factor);GUI.DrawTexture(new Rect((photoArea.width-size.x)/2+photoPan.x,(photoArea.height-size.y)/2+photoPan.y,size.x,size.y),photoTexture,ScaleMode.StretchToFill);GUI.EndGroup();GUI.Label(new Rect(292,580,856,36),photos[photoIndex].caption,label);}else GUI.Label(new Rect(300,260,850,80),"No photographs of this building have been added yet.",centered);if(Button(prevPhotoButton,"PREVIOUS"))ChangePhoto(-1);if(Button(nextPhotoButton,"NEXT"))ChangePhoto(1);if(Button(zoomOutButton,"−"))photoZoom=Mathf.Max(1,photoZoom/1.4f);if(Button(zoomInButton,"+"))photoZoom=Mathf.Min(5,photoZoom*1.4f);GUI.Label(new Rect(423,635,423,31),photos.Count>0?(photoIndex+1)+" / "+photos.Count+" · pinch to zoom":"",label);}
    void DrawDiagnostics(){var a=timings.ToArray();Array.Sort(a);float p95=a.Length==0?0:a[Mathf.Min(a.Length-1,Mathf.FloorToInt(a.Length*.95f))]*1000;Fill(new Rect(830,135,415,145),ink);GUI.Label(new Rect(848,148,380,125),"Frame: "+(smoothedFrame*1000).ToString("F1")+" ms · p95: "+p95.ToString("F1")+" ms\n"+SystemInfo.graphicsDeviceName+"\n"+manifest.sourceHash.Substring(0,12)+"\n"+(mode==Mode.Inside?"Two-floor interior":"Historical estate · dynamic building detail"),small);}
}

