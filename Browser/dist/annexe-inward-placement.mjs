import {placeAnnexeFront} from './annexe-placement.mjs';
// Red guide: about 1.7 carriageway widths toward the 1829 buildings.
// The annexe, entrance and frontage move together in the same plan frame.
export const ANNEXE_INWARD_DISTANCE=10;
const {rotation}=placeAnnexeFront(0);
export const ANNEXE_INWARD_SHIFT=Object.freeze([Math.sin(rotation)*ANNEXE_INWARD_DISTANCE,Math.cos(rotation)*ANNEXE_INWARD_DISTANCE]);
export const moveAnnexeInward=([x,z])=>[x+ANNEXE_INWARD_SHIFT[0],z+ANNEXE_INWARD_SHIFT[1]];
