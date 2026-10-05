// Compatibility entry point for saved links and older integrations.
export {createAnnexe as createNewHospital,ANNEXE as NEW_HOSPITAL,annexeMapPoint as hospitalMapPoint} from './annexe.mjs';
import {ANNEXE_VIEWS} from './annexe.mjs';
export const NEW_HOSPITAL_VIEW=ANNEXE_VIEWS.annexe;
export const NEW_HOSPITAL_PLAN_VIEW=ANNEXE_VIEWS['annexe-plan'];
export const NEW_HOSPITAL_SITE_VIEW=ANNEXE_VIEWS['annexe-site'];
export const NEW_HOSPITAL_GROUND_VIEW=ANNEXE_VIEWS['annexe-ground'];
