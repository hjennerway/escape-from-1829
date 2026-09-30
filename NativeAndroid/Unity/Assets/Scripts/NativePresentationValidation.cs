using System.Collections;
using System.IO;
using UnityEngine;
public sealed partial class NativePrototypeGame
{
    IEnumerator CaptureInterface(string directory,string name){yield return null;CaptureUI(directory,name);}
    IEnumerator PresentationSmoke(string directory)
    {
        showTouchPreview=true;Home();paused=true;UpdateLanding(0);yield return null;
        Check(Mathf.Abs(view.transform.position.z+75.8f)<.1f&&view.fieldOfView==46,"Title matches browser front-of-asylum camera");
        Check(trees&&RenderSettings.skybox&&view.clearFlags==CameraClearFlags.Skybox,"Title has trees and cloud sky");
        yield return CaptureInterface(directory,"title-ui.png");
        bool hasWind=false,hasOffsets=false,hasCountryside=false;foreach(var r in estateMeshes){var m=r.sharedMaterial;if(m.IsKeywordEnabled("_LEAF_WIND"))hasWind=true;if(m.GetFloat("_OffsetFactor")<0&&m.GetFloat("_OffsetUnits")<0)hasOffsets=true;if(r.bounds.size.x>5000)hasCountryside=true;}
        Check(hasWind&&hasOffsets&&hasCountryside,"Imported wind, road depth offsets and countryside are present");
        Shader.SetGlobalFloat("_LeafTime",0);Capture(directory,"wind-0.png");Shader.SetGlobalFloat("_LeafTime",4);Capture(directory,"wind-4.png");
        StartAerial();paused=true;orbitTarget=new Vector3(12,5,12);orbitYaw=200;orbitPitch=55;orbitDistance=300;UpdateOrbit(0);lodClock=0;UpdateEstateLOD();yield return null;Capture(directory,"aerial-roads.png");
        paused=false;SelectBuilding(manifest.periods[periodIndex].buildings[0].index);yield return CaptureInterface(directory,"building-side-panel.png");
        Check(!photoExpanded&&buildingPanel.width<1280/3f&&selectionRenderer.enabled,"Building archive leaves most of estate visible with highlight");
        if(photoTexture){HandleTap(openPhotoButton.center);Check(photoExpanded,"Photograph expands only on request");yield return CaptureInterface(directory,"photo-expanded.png");HandleTap(closePictureButton.center);Check(!photoExpanded&&selectedBuilding>=0,"Back returns to compact building panel");}
        CloseBuilding();orbitTarget=new Vector3(190,5,0);orbitDistance=1100;orbitPitch=14;UpdateOrbit(0);Capture(directory,"countryside-horizon.png");paused=true;HandleTap(resolutionButton.center);Check(!lowGraphics,"High detail touch explicitly selects high detail");HandleTap(resolutionButton.center);Check(!lowGraphics,"Selected high detail does not toggle off");yield return CaptureInterface(directory,"settings-high-detail.png");
        HandleTap(saverButton.center);Check(lowGraphics,"Battery saver touch explicitly selects battery saver");yield return CaptureInterface(directory,"settings-battery-saver.png");HandleTap(resolutionButton.center);
        paused=false;StartInside();paused=true;help=true;paused=false;yield return CaptureInterface(directory,"help-ui.png");help=false;paused=true;
        foreach(var caption in new[]{"TORCH: ON","TORCH: OFF","MY POSITION","RESUME","HOLD USE"}){var rect=caption.StartsWith("TORCH")?torchButton:caption=="MY POSITION"?locateButton:caption=="RESUME"?pauseButton:useButton;var style=FitButton(rect,caption);Check(TextWidth(caption,style)<=rect.width-24,"Button caption fits: "+caption);}
        paused=false;elapsed=0;yield return CaptureInterface(directory,"phone-controls-16x9.png");
        CaptureUI(directory,"phone-controls-wide.png",1560);yield return null;showTouchPreview=false;paused=true;
    }
}
