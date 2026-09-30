using UnityEngine;

public sealed partial class NativePrototypeGame
{
    bool introFlightActive;float introFlightTime,introStartFov,introEndFov;
    Vector3 introStartPosition,introEndPosition,introStartAim,introEndAim;
    Quaternion introStartRotation,introEndRotation;
    const float introFlightDuration=2.4f;
    void BeginIntroFlight(bool aerial)
    {
        if(introFlightActive||mode!=Mode.Title)return;
        introStartPosition=view.transform.position;introStartRotation=view.transform.rotation;introStartFov=view.fieldOfView;
        introStartAim=new Vector3(0,10,-19.8f);
        if(aerial)StartAerial();else StartOutside();
        introEndPosition=view.transform.position;introEndRotation=view.transform.rotation;introEndFov=view.fieldOfView;
        introEndAim=aerial?orbitTarget:introEndPosition+view.transform.forward*20;
        introFlightTime=0;introFlightActive=true;UnlockMouse();SampleIntroFlight(0);
    }
    void SampleIntroFlight(float fraction)
    {
        float t=Mathf.SmoothStep(0,1,fraction);
        SetAtmosphere(false,1-t,false);
        var position=Vector3.Lerp(introStartPosition,introEndPosition,t);
        if(mode==Mode.Aerial)position+=Vector3.up*(Mathf.Sin(t*Mathf.PI)*60);
        view.transform.position=position;
        if(fraction<=0)view.transform.rotation=introStartRotation;
        else if(fraction>=1)view.transform.rotation=introEndRotation;
        else view.transform.LookAt(Vector3.Lerp(introStartAim,introEndAim,t));
        view.fieldOfView=Mathf.Lerp(introStartFov,introEndFov,t);
    }
    void UpdateIntroFlight(float dt)
    {
        introFlightTime+=Mathf.Clamp(dt,0,.1f);float t=Mathf.Clamp01(introFlightTime/introFlightDuration);
        SampleIntroFlight(t);if(t>=1)FinishIntroFlight();
    }
    void FinishIntroFlight()
    {
        if(!introFlightActive)return;SampleIntroFlight(1);introFlightActive=false;paused=false;
        stickVector=Vector2.zero;stickFinger=lookFinger=listFinger=-1;useHeld=sprintHeld=false;aerialDragging=false;
        if(mode==Mode.Aerial){UpdateOrbit(0);UnlockMouse();}else{PositionView();LockMouse();}
    }
}
