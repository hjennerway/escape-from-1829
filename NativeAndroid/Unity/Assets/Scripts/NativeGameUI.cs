using System;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    GUIStyle text,small,heading,title,button,centered,label;Texture2D pixel;
    readonly Color ink=new Color(.078f,.125f,.094f,.95f),mint=new Color(.741f,.8f,.596f),amber=new Color(.94f,.71f,.38f);
    Rect safe;float uiScale;int stickFinger=-1,lookFinger=-1,listFinger=-1;Vector2 stickOrigin,touchDown,listDown;float lookMovement,listMovement;
    readonly Rect insideButton=new Rect(567,452,210,56),outsideButton=new Rect(333,452,220,56),aerialButton=new Rect(109,452,210,56);
    readonly Rect pauseButton=new Rect(1154,28,100,44),mapButton=new Rect(1036,28,106,44),helpButton=new Rect(924,28,100,44);
    readonly Rect useButton=new Rect(1080,570,168,90),torchButton=new Rect(950,595,116,66),sprintButton=new Rect(268,594,116,66),crouchButton=new Rect(398,594,120,66);
    readonly Rect resumeButton=new Rect(345,262,590,56),homeButton=new Rect(345,331,590,56),fpsButton=new Rect(345,514,285,48),resolutionButton=new Rect(345,447,285,50),saverButton=new Rect(650,447,285,50),soundButton=new Rect(650,514,285,48),detailsButton=new Rect(345,579,285,48);
    readonly Rect sensitivitySlider=new Rect(650,621,285,24),yearSlider=new Rect(460,650,350,28),prevYearButton=new Rect(392,636,58,48),nextYearButton=new Rect(820,636,58,48);
    const float explorationInset=28,explorationSquare=52;
    Rect safeViewport=new Rect(0,0,1280,720);
    Rect explorationHeader=>new Rect(safeViewport.x+explorationInset,safeViewport.y+explorationInset,440,104);
    Rect locationsButton=>new Rect(explorationHeader.xMax+28,explorationHeader.y,182,44);
    Rect viewButton=>new Rect(locationsButton.xMax+14,locationsButton.y,122,44);
    Rect locateButton=>new Rect(explorationHeader.x,explorationHeader.yMax+28,explorationSquare,explorationSquare);
    Rect treeButton=>new Rect(explorationHeader.x,locateButton.yMax+10,130,48);
    Rect dayButton=>new Rect(explorationHeader.x,treeButton.yMax+10,explorationSquare,explorationSquare);
    Rect duskButton=>new Rect(dayButton.x,dayButton.yMax+10,explorationSquare,explorationSquare);
    Rect nightButton=>new Rect(dayButton.x,duskButton.yMax+10,explorationSquare,explorationSquare);
    readonly Rect closePictureButton=new Rect(1106,90,116,44),prevPhotoButton=new Rect(292,624,116,48),nextPhotoButton=new Rect(864,624,116,48),zoomOutButton=new Rect(999,624,68,48),zoomInButton=new Rect(1076,624,68,48);
    readonly Rect photoArea=new Rect(292,165,856,405),retryButton=new Rect(650,580,285,50),resultHomeButton=new Rect(345,580,285,50);
    readonly Rect helpResumeButton=new Rect(345,586,590,60),locationsViewport=new Rect(250,170,920,440);
    readonly Rect buildingPanel=new Rect(22,142,370,516),buildingHeading=new Rect(38,204,338,60),closeBuildingButton=new Rect(330,156,46,42),sidePhotoArea=new Rect(38,310,338,187),sidePrevButton=new Rect(38,554,96,44),sideNextButton=new Rect(280,554,96,44),openPhotoButton=new Rect(38,607,338,36);
    Rect interfaceViewport=new Rect(0,0,1280,720);
    bool photoExpanded;
    bool Exploring=>mode==Mode.Outside||mode==Mode.Aerial;
    void SetUIScale(){safe=Screen.safeArea;uiScale=Mathf.Min(safe.width/1280,safe.height/720);if(uiScale<=0)uiScale=1;safeViewport=new Rect((1280-safe.width/uiScale)/2,(720-safe.height/uiScale)/2,safe.width/uiScale,safe.height/uiScale);}
    Vector2 UIPosition(Vector2 p)=>new Vector2((p.x-safe.x-(safe.width-1280*uiScale)/2)/uiScale,(Screen.height-p.y-(Screen.height-safe.yMax)-(safe.height-720*uiScale)/2)/uiScale);
    bool PointerOverControls(Vector2 p)=>photoExpanded||(selectedBuilding>=0&&buildingPanel.Contains(p))
        ||mode==Mode.Inside&&p.y<130
        ||mode==Mode.Inside&&(useButton.Contains(p)||torchButton.Contains(p)||crouchButton.Contains(p))
        ||(mode==Mode.Inside||mode==Mode.Outside)&&sprintButton.Contains(p)
        ||Exploring&&(explorationHeader.Contains(p)||locationsButton.Contains(p)||viewButton.Contains(p)
            ||new Rect(382,586,510,110).Contains(p)||locateButton.Contains(p)||treeButton.Contains(p)
            ||dayButton.Contains(p)||duskButton.Contains(p)||nightButton.Contains(p));
    void TouchInput()
    {
        sprintHeld=useHeld=false;
        if(introFlightActive){foreach(var touch in Input.touches)if(touch.phase==TouchPhase.Began)HandleTap(UIPosition(touch.position));return;}
        if(photoExpanded&&Input.touchCount==2){var a=Input.GetTouch(0);var b=Input.GetTouch(1);float before=Vector2.Distance(a.position-a.deltaPosition,b.position-b.deltaPosition);if(before>0)photoZoom=Mathf.Clamp(photoZoom*Vector2.Distance(a.position,b.position)/before,1,5);}
        foreach(var touch in Input.touches){
            var p=UIPosition(touch.position);
            if(locationsOpen&&selectedBuilding<0&&LocationTouch(touch.fingerId,p,touch.deltaPosition.y/uiScale,touch.phase))continue;
            if(touch.phase==TouchPhase.Ended||touch.phase==TouchPhase.Canceled){
                if(touch.fingerId==stickFinger){stickFinger=-1;stickVector=Vector2.zero;}
                if(touch.fingerId==lookFinger){if(touch.phase==TouchPhase.Ended&&lookMovement<7&&(mode==Mode.Aerial||mode==Mode.Outside))PickBuilding(touch.position);lookFinger=-1;}continue;
            }
            if(touch.phase==TouchPhase.Began){
                if(HandleTap(p))continue;
                if(!paused&&!map&&!help&&(mode==Mode.Outside||mode==Mode.Inside)&&p.x<440&&p.y>340&&!sprintButton.Contains(p)&&!(mode==Mode.Inside&&crouchButton.Contains(p))&&stickFinger<0){stickFinger=touch.fingerId;stickOrigin=p;}
                else if(!paused&&!map&&!help&&lookFinger<0&&!PointerOverControls(p)){lookFinger=touch.fingerId;touchDown=p;lookMovement=0;}
            }
            if(photoExpanded){if(photoArea.Contains(p)&&Input.touchCount==1&&touch.phase==TouchPhase.Moved)photoPan+=new Vector2(touch.deltaPosition.x,-touch.deltaPosition.y)/uiScale;continue;}
            if(selectedBuilding>=0&&buildingPanel.Contains(p))continue;
            if(paused){if(sensitivitySlider.Contains(p))SetSensitivity(p);continue;}if(help||map||locationsOpen)continue;
            if((mode==Mode.Outside||mode==Mode.Aerial)&&selectedBuilding<0&&yearSlider.Contains(p)){SetPeriod(Mathf.RoundToInt((p.x-yearSlider.x)/yearSlider.width*12));continue;}
            if(touch.fingerId==stickFinger)stickVector=Vector2.ClampMagnitude(new Vector2(p.x-stickOrigin.x,stickOrigin.y-p.y)/70,1);
            if(touch.fingerId==lookFinger&&touch.phase==TouchPhase.Moved){lookMovement+=touch.deltaPosition.magnitude/uiScale;if(mode==Mode.Aerial&&Input.touchCount==1){orbitYaw+=touch.deltaPosition.x/uiScale*.22f;orbitPitch=Mathf.Clamp(orbitPitch-touch.deltaPosition.y/uiScale*.18f,8,86);}else if(mode==Mode.Outside||mode==Mode.Inside){yaw-=touch.deltaPosition.x/uiScale*.003f*sensitivity;pitch=Mathf.Clamp(pitch+touch.deltaPosition.y/uiScale*.003f*sensitivity,-1.25f,1.25f);}}
            if((mode==Mode.Inside||mode==Mode.Outside)&&sprintButton.Contains(p))sprintHeld=true;if(mode==Mode.Inside&&useButton.Contains(p))useHeld=true;
        }
    }
    void SetSensitivity(Vector2 p){sensitivity=Mathf.Lerp(.4f,3,(p.x-sensitivitySlider.x)/sensitivitySlider.width);PlayerPrefs.SetFloat("sensitivity",sensitivity);}
    bool HandleTap(Vector2 p)
    {
        if(introFlightActive){if(pauseButton.Contains(p))FinishIntroFlight();return true;}
        if(mode==Mode.Title){if(insideButton.Contains(p)){StartArrival();return true;}if(outsideButton.Contains(p)){BeginIntroFlight(false);return true;}if(aerialButton.Contains(p)){BeginIntroFlight(true);return true;}return false;}
        if(mode==Mode.Arrival||mode==Mode.Escape){if(pauseButton.Contains(p)){if(mode==Mode.Arrival)StartInside();else mode=Mode.Escaped;return true;}return false;}
        if(mode==Mode.Caught||mode==Mode.Escaped){if(retryButton.Contains(p)){StartArrival();return true;}if(resultHomeButton.Contains(p)){Home();return true;}return false;}
        if(help){if(closePictureButton.Contains(p)||helpResumeButton.Contains(p)){help=false;LockMouse();return true;}return false;}
        if(mode==Mode.Inside&&pauseButton.Contains(p)){TogglePause();return true;}
        if(paused){
            if(resumeButton.Contains(p)){TogglePause();return true;}if(homeButton.Contains(p)){Home();return true;}
            if(fpsButton.Contains(p)){ChangeFPS();return true;}if(resolutionButton.Contains(p)){SetGraphics(false);return true;}if(saverButton.Contains(p)){SetGraphics(true);return true;}
            if(soundButton.Contains(p)){audioOn=!audioOn;PlayerPrefs.SetInt("audio",audioOn?1:0);return true;}if(detailsButton.Contains(p)){diagnostics=!diagnostics;return true;}
            if(sensitivitySlider.Contains(p)){SetSensitivity(p);return true;}return false;
        }
        if(selectedBuilding>=0){
            if((photoExpanded?closePictureButton:closeBuildingButton).Contains(p)){if(photoExpanded)photoExpanded=false;else CloseBuilding();return true;}
            if((photoExpanded?prevPhotoButton:sidePrevButton).Contains(p)){ChangePhoto(-1);return true;}if((photoExpanded?nextPhotoButton:sideNextButton).Contains(p)){ChangePhoto(1);return true;}
            if(photoExpanded&&zoomOutButton.Contains(p)){photoZoom=Mathf.Max(1,photoZoom/1.4f);return true;}if(photoExpanded&&zoomInButton.Contains(p)){photoZoom=Mathf.Min(5,photoZoom*1.4f);return true;}
            if(!photoExpanded&&(sidePhotoArea.Contains(p)||openPhotoButton.Contains(p))&&photoTexture){photoExpanded=true;return true;}
            return photoExpanded||buildingPanel.Contains(p);
        }
        if(locationsOpen){if(closePictureButton.Contains(p)){locationsOpen=false;return true;}return false;}
        if(mode==Mode.Inside){
            if(helpButton.Contains(p)){help=true;UnlockMouse();return true;}if(mapButton.Contains(p)){map=!map;stickVector=Vector2.zero;if(map)UnlockMouse();else LockMouse();return true;}
            if(torchButton.Contains(p)){torch.enabled=!torch.enabled;return true;}if(crouchButton.Contains(p)){crouchToggle=!crouchToggle;return true;}
        }
        if(mode==Mode.Outside||mode==Mode.Aerial){
            if(locationsButton.Contains(p)){locationsOpen=true;UnlockMouse();return true;}if(viewButton.Contains(p)){if(mode==Mode.Outside)StartAerial();else StartOutside();return true;}
            if(treeButton.Contains(p)){trees=!trees;RefreshEstateVisibility();return true;}
            if(dayButton.Contains(p)){SetTimeOfDay(LightingMode.Day);return true;}if(duskButton.Contains(p)){SetTimeOfDay(LightingMode.Dusk);return true;}if(nightButton.Contains(p)){SetTimeOfDay(LightingMode.Night);return true;}
            if(locateButton.Contains(p)){BeginDeviceLocation();return true;}
            if(prevYearButton.Contains(p)){SetPeriod(periodIndex-1);return true;}if(nextYearButton.Contains(p)){SetPeriod(periodIndex+1);return true;}
        }return false;
    }
    bool LocationTouch(int id,Vector2 p,float deltaY,TouchPhase phase)
    {
        if(phase==TouchPhase.Began&&locationsViewport.Contains(p)){listFinger=id;listDown=p;listMovement=0;return true;}if(id!=listFinger)return false;
        var visible=manifest.periods[periodIndex].buildings;
        if(phase==TouchPhase.Moved){listMovement+=(p-listDown).magnitude;listDown=p;locationsScroll.y=Mathf.Clamp(locationsScroll.y+deltaY,0,Mathf.Max(0,visible.Length*58-440));}
        if(phase==TouchPhase.Ended||phase==TouchPhase.Canceled){listFinger=-1;if(phase==TouchPhase.Ended&&listMovement<7&&locationsViewport.Contains(p)){int row=Mathf.FloorToInt((p.y-locationsViewport.y+locationsScroll.y)/58);if(row>=0&&row<visible.Length){int index=visible[row].index;GoToBuilding(index);SelectBuilding(index);}}}return true;
    }
    void ChangeFPS(){fpsCap=fpsCap==60?30:60;Application.targetFrameRate=fpsCap;PlayerPrefs.SetInt("fps",fpsCap);}
    void ChangeGraphics(){SetGraphics(!lowGraphics);}
    void SetGraphics(bool saver){lowGraphics=saver;PlayerPrefs.SetInt("graphics",lowGraphics?1:0);ApplyGraphics();}
    void ApplyGraphics(){ConfigureShadows();QualitySettings.antiAliasing=lowGraphics?0:4;QualitySettings.pixelLightCount=lowGraphics?1:3;if(Application.isMobilePlatform){float factor=Mathf.Min(1,(lowGraphics?1280f:1920f)/Mathf.Max(Display.main.systemWidth,Display.main.systemHeight));Screen.SetResolution(Mathf.RoundToInt(Display.main.systemWidth*factor),Mathf.RoundToInt(Display.main.systemHeight*factor),true);}}
    void Styles()
    {
        if(text!=null)return;surfaceTexture=RoundedSurface(ink,new Color(.74f,.8f,.6f,.4f));hoverTexture=RoundedSurface(new Color(.14f,.19f,.14f,.98f),mint);selectedTexture=RoundedSurface(mint,mint);
        text=new GUIStyle(){font=bodyFont,fontSize=22,wordWrap=true,alignment=TextAnchor.UpperLeft};text.normal.textColor=Hex(0xe6e4cf);
        small=new GUIStyle(text){fontSize=17};small.normal.textColor=Hex(0xb8c2ac);heading=new GUIStyle(text){font=displayFont,fontSize=27};
        title=new GUIStyle(heading){fontSize=54,alignment=TextAnchor.MiddleCenter};serif=new GUIStyle(text){font=displayFont};eyebrow=new GUIStyle(text){font=buttonFont,fontSize=16};eyebrow.normal.textColor=mint;
        centered=new GUIStyle(text){alignment=TextAnchor.MiddleCenter};label=new GUIStyle(small){alignment=TextAnchor.MiddleCenter};
        button=new GUIStyle(){font=buttonFont,fontSize=18,wordWrap=false,alignment=TextAnchor.MiddleCenter,padding=new RectOffset(12,12,8,8)};
        button.normal.background=surfaceTexture;button.hover.background=hoverTexture;button.active.background=selectedTexture;button.focused.background=hoverTexture;button.normal.textColor=Hex(0xe6e4cf);

    }
    void Fill(Rect rect,Color color){if(capturingUI){DrawCaptureTexture(rect,pixel,new Rect(0,0,1,1),color);return;}var previous=GUI.color;GUI.color=color;GUI.DrawTexture(rect,pixel);GUI.color=previous;}
    bool Button(Rect rect,string caption,bool selected=false){var style=FitButton(rect,caption,selected);bool pressed=ButtonSurface(rect,selected);Label(rect,caption,style);return pressed;}
    void OnGUI()
    {
        if(!initialized||!pixel)return;Styles();SetUIScale();var before=GUI.matrix;GUI.matrix=Matrix4x4.TRS(new Vector3(safe.x+(safe.width-1280*uiScale)/2,Screen.height-safe.yMax+(safe.height-720*uiScale)/2,0),Quaternion.identity,new Vector3(uiScale,uiScale,1));
        interfaceViewport=new Rect(-GUI.matrix.m03/uiScale,-GUI.matrix.m13/uiScale,Screen.width/uiScale,Screen.height/uiScale);
        DrawInterface();GUI.matrix=before;
    }
    void DrawInterface()
    {
        if(introFlightActive){Panel(new Rect(345,610,590,62));Label(new Rect(355,622,570,40),mode==Mode.Aerial?"AERIAL VIEW":"EXPLORE ON FOOT",centered);if(Button(pauseButton,"SKIP"))FinishIntroFlight();}
        else if(mode==Mode.Title)DrawTitle();
        else if(mode==Mode.Arrival||mode==Mode.Escape){Panel(new Rect(345,600,590,70));Label(new Rect(355,611,570,55),mode==Mode.Arrival?"THE 1829 BUILDING · CHESTER":"OUTSIDE. AT LAST.",centered);if(Button(pauseButton,"SKIP")){if(mode==Mode.Arrival)StartInside();else mode=Mode.Escaped;}}
        else if(mode==Mode.Caught||mode==Mode.Escaped){Panel(new Rect(280,85,720,585));Label(new Rect(320,118,640,77),mode==Mode.Escaped?"You escaped":"Captured",title);Label(new Rect(325,220,630,320),status,new GUIStyle(serif){fontSize=21});if(Button(resultHomeButton,"BACK TO TITLE"))Home();if(Button(retryButton,"TRY AGAIN",true))StartArrival();}
        else{
            var header=Exploring?explorationHeader:new Rect(22,22,440,104);
            Panel(header);Label(new Rect(header.x+18,header.y+11,410,34),mode==Mode.Inside?(floor==0?"Ground floor":"Upper floor"):mode==Mode.Aerial?"Aerial exploration":"Explore on foot",heading);
            int exits=0;foreach(int i in activeExits)if(i/7==floor)exits++;Label(new Rect(header.x+18,header.y+50,410,40),mode==Mode.Inside?exits+" exits this floor · "+TimeLabel(elapsed):manifest.periods[periodIndex].year+" · "+manifest.periods[periodIndex].title,small);
            Label(Exploring?new Rect(viewButton.xMax+9,viewButton.y,105,40):new Rect(817,33,105,40),Mathf.RoundToInt(displayedFPS)+" FPS",small);
            if(mode==Mode.Inside){if(Button(helpButton,"HELP")){help=true;UnlockMouse();}if(Button(mapButton,map?"CLOSE":"MAP")){map=!map;if(map)UnlockMouse();else LockMouse();}if(Button(pauseButton,paused?"RESUME":"PAUSE"))TogglePause();}
            if(paused)DrawPause();else if(help)DrawHelp();else if(selectedBuilding>=0)DrawBuilding();else if(locationsOpen)DrawLocations();else if(map)DrawMap();else{
                if(mode==Mode.Outside||mode==Mode.Aerial)DrawExplore();
                if(mode==Mode.Inside){DrawFloorPlan(new Rect(24,142,225,180),floor,false);Fill(new Rect(26,334,220,27),ink);Label(new Rect(34,338,205,24),"YOU · GHOST · SECURITY",new GUIStyle(small){fontSize=13,wordWrap=false});Fill(new Rect(25,372,220,7),new Color(.2f,.25f,.2f));Fill(new Rect(25,372,220*stamina,7),mint);Label(new Rect(25,389,220,30),crouching?"CROUCHING · QUIET":sprinting?"SPRINTING · LOUD":"STAMINA",small);if(elapsed<5||spotted){Panel(new Rect(440,137,405,40));Label(new Rect(450,142,385,30),elapsed<5?"FIVE-SECOND HEAD START":"YOU'VE BEEN SPOTTED",label);}}
                if(mode!=Mode.Aerial){Fill(new Rect(638,355,4,10),mint);Fill(new Rect(635,358,10,4),mint);if(mode==Mode.Inside){if(prompt!=""){Panel(new Rect(320,474,640,62));Label(new Rect(336,486,608,40),prompt,centered);}if(hold>0)Fill(new Rect(400,544,480*Mathf.Clamp01(hold/.5f),5),mint);}DrawMovement();}
                if(diagnostics)DrawDiagnostics();
            }
            if(viewingArt!=null){Panel(new Rect(130,70,1020,580));var item=manifest.art[viewingArt.index];if(!item.imageOnly)Label(new Rect(165,90,950,50),item.title,centered);if(artworkTexture)DrawImage(new Rect(170,145,940,440),artworkTexture,ScaleMode.ScaleToFit);Label(new Rect(165,606,950,30),"RELEASE USE TO RETURN",label);}
        }
    }
    string TimeLabel(float t)=>Mathf.FloorToInt(t/60).ToString("00")+":"+(Mathf.FloorToInt(t)%60).ToString("00");
    void DrawPause(){Panel(new Rect(300,144,680,538));Label(new Rect(345,177,590,65),"Paused",title);if(Button(resumeButton,"RESUME",true))TogglePause();if(Button(homeButton,"BACK TO TITLE"))Home();Label(new Rect(345,407,590,30),"PICTURE QUALITY · selected option is highlighted",eyebrow);if(Choice(resolutionButton,"HIGH DETAIL",!lowGraphics))SetGraphics(false);if(Choice(saverButton,"BATTERY SAVER",lowGraphics))SetGraphics(true);if(Button(fpsButton,"FPS LIMIT: "+fpsCap))ChangeFPS();if(Button(soundButton,"SOUND: "+(audioOn?"ON":"OFF"),audioOn)){audioOn=!audioOn;PlayerPrefs.SetInt("audio",audioOn?1:0);}if(Button(detailsButton,"PERFORMANCE INFO: "+(diagnostics?"ON":"OFF"),diagnostics))diagnostics=!diagnostics;Label(new Rect(650,580,285,30),"Look sensitivity · "+sensitivity.ToString("F1"),small);float previous=sensitivity;sensitivity=Slider(sensitivitySlider,sensitivity,.4f,3);if(previous!=sensitivity)PlayerPrefs.SetFloat("sensitivity",sensitivity);}
    void DrawHelp(){Panel(new Rect(270,90,740,580));Label(new Rect(310,120,660,64),"Keep moving. Stay quiet.",heading);Label(new Rect(310,208,660,350),"Left stick: move. Drag the right side: look. Hold RUN to sprint; CROUCH makes you harder to spot.\n\nSecurity pursues on sight. The Deva ghost senses you through walls. Aim your torch at it to slow it down.\n\nHold USE at either staircase to change floors, at an open exit to escape, or beside wall artwork to inspect it. Enemies pause while USE is held.\n\nFive of fourteen exits open each time the app loads. You have a five-second head start.",text);if(Button(helpResumeButton,"RESUME",true)){help=false;LockMouse();}}
    void DrawMovement(){if(Application.isMobilePlatform||Input.touchCount>0||showTouchPreview){var origin=stickFinger>=0?stickOrigin:new Vector2(138,578);if(!movementSurface)movementSurface=RoundedSurface(new Color(.12f,.19f,.18f,.68f),new Color(.12f,.19f,.18f,.68f));Surface(new Rect(origin.x-68,origin.y-68,136,136),movementSurface);Surface(new Rect(origin.x+stickVector.x*45-20,origin.y-stickVector.y*45-20,40,40),selectedTexture);Label(new Rect(58,663,160,25),"MOVE",label);Button(sprintButton,"RUN");if(mode==Mode.Inside){Button(useButton,"HOLD USE");if(Button(crouchButton,crouchToggle?"STAND":"CROUCH",crouchToggle))crouchToggle=!crouchToggle;}}else Label(new Rect(28,685,930,28),mode==Mode.Inside?"WASD move · mouse look · Shift run · C crouch · E use · F torch · Tab map · H help · Esc pause":"WASD move · mouse look · Shift run · Esc title",small);if(mode==Mode.Inside&&Button(torchButton,torch.enabled?"TORCH: ON":"TORCH: OFF",torch.enabled))torch.enabled=!torch.enabled;}
    void DrawExplore()
    {
        if(Button(locationsButton,"LOCATIONS")){locationsOpen=true;UnlockMouse();}
        if(Button(viewButton,mode==Mode.Outside?"AERIAL":"WALK")){if(mode==Mode.Outside)StartAerial();else StartOutside();}
        if(Button(treeButton,trees?"TREES: ON":"TREES: OFF",trees)){trees=!trees;RefreshEstateVisibility();}
        DrawTimeOfDay();if(LocationButton())BeginDeviceLocation();
        Panel(new Rect(382,586,510,110));Label(new Rect(399,595,477,38),manifest.periods[periodIndex].year+" · "+manifest.periods[periodIndex].title,label);
        if(Button(prevYearButton,"‹"))SetPeriod(periodIndex-1);if(Button(nextYearButton,"›"))SetPeriod(periodIndex+1);
        if(Application.isMobilePlatform)Slider(yearSlider,periodIndex,0,12);else{int year=Mathf.RoundToInt(Slider(yearSlider,periodIndex,0,12));if(year!=periodIndex)SetPeriod(year);}
        if(locationMessage!="")Label(new Rect(locateButton.xMax+12,locateButton.y,370,76),locationMessage,new GUIStyle(small){fontSize=15});
        if(mode==Mode.Aerial){
            var area=new Rect(explorationHeader.x,safeViewport.yMax-24,safeViewport.width-56,22);
            string guide=Application.isMobilePlatform||showTouchPreview?"One finger: orbit · Two fingers: move · Pinch: zoom · Tap a building: photographs · Back: title":"Drag: orbit · Shift + drag: move · Scroll: zoom · Click a building: photographs · Esc: title";
            var guideStyle=new GUIStyle(small){fontSize=13};var shadow=new GUIStyle(guideStyle);shadow.normal.textColor=new Color(0,0,0,.85f);
            Label(new Rect(area.x+1,area.y+1,area.width,area.height),guide,shadow);Label(area,guide,guideStyle);
        }
    }
    void DrawFloorPlan(Rect area,int selected,bool names)
    {
        Surface(area,surfaceTexture);var plan=floors[selected];float cell=Mathf.Min((area.width-12)/plan.width,(area.height-12)/plan.height),left=area.x+(area.width-plan.width*cell)/2,top=area.y+(area.height-plan.height*cell)/2;
        for(int z=0;z<plan.height;z++)for(int x=0;x<plan.width;x++)if(plan.cells[z*plan.width+x]==1)Fill(new Rect(left+x*cell,top+z*cell,Mathf.Max(1,cell-.8f),Mathf.Max(1,cell-.8f)),new Color(.29f,.36f,.34f));
        foreach(var s in plan.stairs){Fill(new Rect(left+s.x*cell-2,top+s.z*cell-2,cell+3,cell+3),amber);if(names)Label(new Rect(left+s.x*cell-8,top+s.z*cell-8,24,25),selected==0?"U":"D",small);}
        for(int i=0;i<plan.exits.Length;i++)if(activeExits.Contains(selected*7+i)){var e=plan.exits[i];Fill(new Rect(left+e.x*cell-2,top+e.z*cell-2,cell+3,cell+3),mint);}
        if(floor==selected)Fill(new Rect(left+player.x/plan.cellSize*cell-3,top+player.y/plan.cellSize*cell-3,6,6),Color.white);
        foreach(var e in enemies)if(e.floor==selected)Fill(new Rect(left+e.position.x/plan.cellSize*cell-3,top+e.position.y/plan.cellSize*cell-3,6,6),e.type==2?new Color(.4f,.8f,.7f):amber);
    }
    void DrawMap(){Panel(new Rect(285,142,710,520));Label(new Rect(310,162,660,42),mode==Mode.Inside?(floor==0?"Ground floor · game routes":"Upper floor · game routes"):"Estate · "+manifest.periods[periodIndex].year,heading);if(mode==Mode.Inside){DrawFloorPlan(new Rect(372,218,536,380),floor,true);Label(new Rect(310,615,660,31),"WHITE: YOU · GREEN: EXITS · AMBER: STAIRS / SECURITY",label);}else{Label(new Rect(315,227,650,80),manifest.periods[periodIndex].description,text);float scale=.55f;foreach(var b in manifest.periods[periodIndex].buildings)Fill(new Rect(380+(b.minX+140)*scale,375+(b.minZ+255)*scale,Mathf.Max(2,(b.maxX-b.minX)*scale),Mathf.Max(2,(b.maxZ-b.minZ)*scale)),mint);Label(new Rect(310,615,660,30),"Open LOCATIONS to visit a building and its photographs.",label);}}
    void DrawLocations(){Panel(new Rect(210,80,1020,610));Label(new Rect(250,104,760,55),"Locations · "+manifest.periods[periodIndex].year,heading);if(Button(closePictureButton,"CLOSE"))locationsOpen=false;var visible=manifest.periods[periodIndex].buildings;locationsScroll=GUI.BeginScrollView(locationsViewport,locationsScroll,new Rect(0,0,880,visible.Length*58));for(int i=0;i<visible.Length;i++){int index=visible[i].index;var rect=new Rect(5,i*58,870,48);if(Button(rect,manifest.buildings[index].name)){GoToBuilding(index);SelectBuilding(index);}}GUI.EndScrollView();Label(new Rect(250,625,900,32),locationMessage,small);}
    void DrawBuilding()
    {
        var b=manifest.buildings[selectedBuilding];var photos=BuildingPhotos();
        if(!photoExpanded){
            Panel(buildingPanel);Label(new Rect(38,163,285,32),"BUILDING ARCHIVE",eyebrow);if(Button(closeBuildingButton,"×")){CloseBuilding();return;}Label(buildingHeading,b.name,FitHeading(buildingHeading,b.name));Label(new Rect(38,270,338,35),BuildingDates(),new GUIStyle(small){fontSize=12});
            if(photoTexture){DrawImage(sidePhotoArea,photoTexture,ScaleMode.ScaleToFit);if(!capturingUI&&!Application.isMobilePlatform&&GUI.Button(sidePhotoArea,GUIContent.none,GUIStyle.none))photoExpanded=true;Label(new Rect(38,501,338,45),photos[photoIndex].caption,new GUIStyle(small){fontSize=14});}else Label(sidePhotoArea,"No photographs of this building have been added yet.",centered);
            if(photos.Count>0){if(Button(sidePrevButton,"PREVIOUS"))ChangePhoto(-1);if(Button(sideNextButton,"NEXT"))ChangePhoto(1);Label(new Rect(145,559,124,30),(photoIndex+1)+" / "+photos.Count,label);if(Button(openPhotoButton,"OPEN PHOTOGRAPH  ↗"))photoExpanded=true;}return;
        }
        Panel(new Rect(250,72,980,620));Label(new Rect(285,92,800,65),b.name,heading);Label(new Rect(292,139,856,24),BuildingDates(),small);if(Button(closePictureButton,"BACK"))photoExpanded=false;
        if(photoTexture){DrawArchivePhoto();Label(new Rect(292,580,856,36),photos[photoIndex].caption,label);}
        if(Button(prevPhotoButton,"PREVIOUS"))ChangePhoto(-1);if(Button(nextPhotoButton,"NEXT"))ChangePhoto(1);if(Button(zoomOutButton,"−"))photoZoom=Mathf.Max(1,photoZoom/1.4f);if(Button(zoomInButton,"+"))photoZoom=Mathf.Min(5,photoZoom*1.4f);Label(new Rect(423,635,423,31),(photoIndex+1)+" / "+photos.Count+" · pinch to zoom",label);
    }
    void DrawDiagnostics(){var a=timings.ToArray();Array.Sort(a);float p95=a.Length==0?0:a[Mathf.Min(a.Length-1,Mathf.FloorToInt(a.Length*.95f))]*1000;Panel(new Rect(830,135,415,145));Label(new Rect(848,148,380,125),"Frame: "+(smoothedFrame*1000).ToString("F1")+" ms · p95: "+p95.ToString("F1")+" ms\n"+SystemInfo.graphicsDeviceName+"\n"+manifest.sourceHash.Substring(0,12)+"\n"+(mode==Mode.Inside?"Two-floor interior":"Historical estate · dynamic building detail"),small);}
}
