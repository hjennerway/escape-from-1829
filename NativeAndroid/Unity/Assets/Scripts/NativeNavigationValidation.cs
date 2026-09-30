using System.Collections;
using UnityEngine;

public sealed partial class NativePrototypeGame
{
    IEnumerator NavigationSmoke(string directory)
    {
        Home();paused=true;CaptureUI(directory,"title-wide-fixed.png",1560);
        Check(titleShade.wrapMode==TextureWrapMode.Clamp,"Title gradient cannot repeat at either edge");
        foreach(var building in manifest.buildings){var style=FitHeading(buildingHeading,building.name);Check(TextLines(building.name,style,buildingHeading.width).Count*style.fontSize*1.26f<=buildingHeading.height,"Archive heading fits above dates: "+building.name);}
        StartAerial();paused=true;
        for(int period=0;period<manifest.periods.Length;period++){
            SetPeriod(period);
            foreach(var bounds in manifest.periods[period].buildings){
                GoToBuilding(bounds.index);
                Check(view.transform.position.y>=AerialClearance(view.transform.position)-.001f,"Safe aerial location: "+manifest.periods[period].year+" / "+manifest.buildings[bounds.index].name);
                var before=view.transform.position;orbitYaw+=15;UpdateOrbit(0);Check(Vector3.Distance(before,view.transform.position)>1,"Aerial location remains movable");
                // Repeated pinch/drag stress: approach from all sides at the
                // lowest pitch, crossing the bounds of corridors and roofs.
                for(int angle=0;angle<360;angle+=30){orbitYaw=angle;orbitPitch=8;orbitDistance=25;UpdateOrbit(0);Check(view.transform.position.y>=AerialClearance(view.transform.position)-.001f,"Close orbit clears geometry");}
                SelectBuilding(bounds.index);var mesh=selectionFilter.sharedMesh;
                Check(mesh==selectionMeshes[bounds.selectionMesh]&&Mathf.Abs(mesh.bounds.min.y-bounds.minY)<.01f,"Highlight follows historical building base");CloseBuilding();
            }yield return null;
        }
        SetPeriod(6);int corridor=System.Array.FindIndex(manifest.buildings,b=>b.id=="admin-corridor");
        GoToBuilding(corridor);SelectBuilding(corridor);paused=false;lodClock=0;UpdateEstateLOD();CaptureUI(directory,"corridor-aerial-safe.png",1560);
        Check(Mathf.Abs(selectionRenderer.sharedMaterial.GetFloat("_Opacity")-.048f)<.00001f,"Selection opacity reduced by exactly eighty percent");
        StartOutside();GoToBuilding(corridor);SelectBuilding(corridor);lodClock=0;UpdateEstateLOD();CaptureUI(directory,"corridor-on-foot-fixed.png",1560);CloseBuilding();
        // Stand beside the central range with the corridor selected, as in
        // the phone report: the old bounds filter tinted this unrelated wall.
        StartOutside();player=new Vector2(12,33);yaw=0;pitch=0;PositionView();SelectBuilding(corridor);lodClock=0;UpdateEstateLOD();CaptureUI(directory,"near-wall-corridor-selected.png",1560);
        selectionRenderer.enabled=false;Capture(directory,"near-wall-without-selection.png");selectionRenderer.enabled=true;Capture(directory,"near-wall-with-selection.png");CloseBuilding();
        Check(!selectionRenderer.enabled,"Closing archive removes selection geometry");
        foreach(bool aerial in new[]{true,false}){
            Home();paused=true;UpdateLanding(0);var start=view.transform.position;var rotation=view.transform.rotation;float fov=view.fieldOfView;
            HandleTap((aerial?aerialButton:outsideButton).center);paused=true;
            Check(introFlightActive&&view.transform.position==start&&Quaternion.Angle(view.transform.rotation,rotation)<.001f&&view.fieldOfView==fov,"Title touch preserves exact first camera pose");
            Check(HandleTap(locationsButton.center)&&!locationsOpen,"Flight blocks exploration input");
            for(int frame=0;frame<12;frame++)UpdateIntroFlight(.1f);
            Check(introFlightActive&&Vector3.Distance(start,view.transform.position)>5&&Vector3.Distance(view.transform.position,introEndPosition)>5,"Intro flight has a moving midpoint");
            CaptureUI(directory,aerial?"flight-aerial-midpoint.png":"flight-walking-midpoint.png",1560);
            for(int frame=0;frame<13;frame++)UpdateIntroFlight(.1f);
            Check(!introFlightActive&&Vector3.Distance(view.transform.position,introEndPosition)<.01f&&Quaternion.Angle(view.transform.rotation,introEndRotation)<.01f&&Mathf.Abs(view.fieldOfView-introEndFov)<.01f,"Intro flight hands off without camera jump");
            CaptureUI(directory,aerial?"flight-aerial-complete.png":"flight-walking-complete.png",1560);
            if(aerial){var before=view.transform.position;orbitYaw+=10;UpdateOrbit(0);Check(Vector3.Distance(before,view.transform.position)>1,"Orbit works after title flight");}
            else{var before=player;Walk(Vector2.right,.1f,false);Check(Vector2.Distance(before,player)>.1f,"Walking works after title flight");}
            Home();HandleTap((aerial?aerialButton:outsideButton).center);HandleTap(pauseButton.center);Check(!introFlightActive&&Vector3.Distance(view.transform.position,introEndPosition)<.01f,"Skip finishes title flight at destination");
            Home();HandleTap((aerial?aerialButton:outsideButton).center);Home();Check(!introFlightActive&&mode==Mode.Title,"Home cancels flight cleanly");
            yield return null;
        }
        Home();paused=true;
    }
}
