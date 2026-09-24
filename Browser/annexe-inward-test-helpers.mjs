// Explicitly deferred in the September 24 red-line request: the far-left
// Larkton entrance room crosses this small part of the fixed outer road.
export const deferredAnnexeOverlap=(road,[x,z])=>road==='Northern Parsons Lane connection'&&x>=434&&x<=445&&z>=-86&&z<=-77;
