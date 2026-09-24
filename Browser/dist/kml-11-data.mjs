// Requested Point placemarks from Research/kml-trees/1829-11.kml; never LookAt.
import {earthToScene} from './earth-registration.mjs';
export const KML_11_POINTS=Object.freeze([
  {
    "name": "Oak21",
    "coordinates": [
      -2.903325559043617,
      53.21301876963101,
      30.63427113241559
    ]
  },
  {
    "name": "Surviving Lamp Post #1",
    "coordinates": [
      -2.903004466142749,
      53.21361738225885,
      16.84998038397929
    ]
  },
  {
    "name": "Surviving Lamp Post #2",
    "coordinates": [
      -2.904759120554876,
      53.21532801387335,
      16.04894710214515
    ]
  },
  {
    "name": "Willow1",
    "coordinates": [
      -2.904728547875698,
      53.22305454563619,
      17.42341167295024
    ]
  },
  {
    "name": "Willow2",
    "coordinates": [
      -2.904749208995463,
      53.22297274652151,
      10.8519667171875
    ]
  },
  {
    "name": "Willow3",
    "coordinates": [
      -2.904749208995463,
      53.22297274652151,
      10.85197093283973
    ]
  },
  {
    "name": "Willow4",
    "coordinates": [
      -2.904723279689001,
      53.22281653571364,
      10.50354384431622
    ]
  },
  {
    "name": "Willow5",
    "coordinates": [
      -2.904748341139785,
      53.22269225529935,
      13.53489634031493
    ]
  },
  {
    "name": "Willow6",
    "coordinates": [
      -2.904709332850647,
      53.22261233254274,
      12.11392515248432
    ]
  },
  {
    "name": "Willow7",
    "coordinates": [
      -2.904709332850647,
      53.22261233254274,
      10.94337644586427
    ]
  },
  {
    "name": "Willow8",
    "coordinates": [
      -2.904662327583438,
      53.22248457023105,
      11.87356205354531
    ]
  },
  {
    "name": "Oak21",
    "coordinates": [
      -2.903725817733399,
      53.21298687893592,
      17.4242081652673
    ]
  }
].map(p=>Object.freeze({...p,coordinates:Object.freeze(p.coordinates)})));
export const LAMP_POSTS=Object.freeze(KML_11_POINTS.filter(p=>p.name.startsWith('Surviving')).map(p=>{const [longitude,latitude,altitude]=p.coordinates,[x,z]=earthToScene(latitude,longitude);return Object.freeze({...p,longitude,latitude,altitude,x,z});}));
