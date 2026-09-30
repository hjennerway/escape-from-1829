using System;
using UnityEngine;

// The same displacement-driven two-bone solve used by the browser guard.
public sealed class NativeGuardPose
{
    readonly Transform pelvis,upper,head,keys;
    readonly Transform[] hip=new Transform[2],knee=new Transform[2],ankle=new Transform[2],shoulder=new Transform[2],elbow=new Transform[2];
    float phase,amount,pace;
    public NativeGuardPose(GameObject model)
    {
        Transform Find(string name){foreach(var t in model.GetComponentsInChildren<Transform>(true))if(t.name==name)return t;throw new Exception("Guard joint missing: "+name);}
        pelvis=Find("Pelvis");upper=Find("Upper body");head=Find("Head");keys=Find("Key ring");
        for(int i=0;i<2;i++){string side=i==0?"Left":"Right";hip[i]=Find(side+" hip");knee[i]=Find(side+" knee");ankle[i]=Find(side+" ankle");shoulder[i]=Find(side+" shoulder");elbow[i]=Find(side+" elbow");}Reset();
    }
    public void Reset(){phase=amount=pace=0;Pose();}
    public void Update(float distance,float dt){if(dt<=0)return;float speed=Mathf.Max(0,distance)/dt;phase=(phase+Mathf.Max(0,distance)*Mathf.PI*2/1.65f)%(Mathf.PI*2);float blend=1-Mathf.Exp(-dt*12);amount+=(speed>.01f?1-amount:-amount)*blend;pace+=(Mathf.Clamp01((speed-2.4f)/1.45f)-pace)*blend;if(speed<=.01f&&amount<.001f)amount=0;Pose();}
    static void RotateX(Transform t,float radians){var e=t.localEulerAngles;e.x=-radians*Mathf.Rad2Deg;t.localEulerAngles=e;}
    void Pose()
    {
        float height=.97f-amount*(.068f+.018f*pace)+Mathf.Cos(phase*2)*.009f*amount;var p=pelvis.localPosition;p.y=height;pelvis.localPosition=p;
        upper.localRotation=Quaternion.Euler(-(.025f+.055f*pace)*amount*Mathf.Rad2Deg,-Mathf.Sin(phase)*.045f*amount*Mathf.Rad2Deg,0);head.localRotation=Quaternion.Euler(0,Mathf.Sin(phase)*.0225f*amount*Mathf.Rad2Deg,0);RotateX(keys,Mathf.Sin(phase+.5f)*.16f*amount);
        for(int i=0;i<2;i++){float cycle=Mathf.Repeat(phase/(Mathf.PI*2)+i*.5f,1),swing=Mathf.Max(0,(cycle-.58f)/.42f),stride=(.29f+.025f*pace)*amount;
            float z=cycle<.58f?stride*(1-2*cycle/.58f):-stride*Mathf.Cos(Mathf.PI*swing);float y=.14f+Mathf.Pow(Mathf.Sin(Mathf.PI*swing),2)*(.115f+.04f*pace)*amount;
            float down=height-y,distance=Mathf.Min(.83f,Mathf.Sqrt(down*down+z*z));float bend=Mathf.Acos(Mathf.Clamp((distance*distance-.43f*.43f-.4f*.4f)/(2*.43f*.4f),-1,1));float angle=Mathf.Atan2(-z,down)-Mathf.Atan2(.4f*Mathf.Sin(bend),.43f+.4f*Mathf.Cos(bend));
            RotateX(hip[i],angle);RotateX(knee[i],bend);RotateX(ankle[i],-angle-bend);RotateX(shoulder[i],z*1.1f);RotateX(elbow[i],-.13f-(.11f+.18f*pace)*amount);
        }
    }
}
