# Equal flanks around the west-end entrance

The owner's [green/blue annotation](marked-reference.png), supplied on
4 October 2026, requests 35% for each green flank and 30% for the middle
door section, with the overall width retained. These are exact proportions
of the existing model, measured along the facade rather than in perspective.

The outer-end limits remain z=5 and z=20.5, for a total of 15.5 model units.
The section boundaries are z=10.425 and z=15.075: the flanks are 5.425 units
each and the shallow centre pier is 4.65 units. The door axis moves from
z=14.3 to the midpoint, z=12.75. This supersedes the retained entrance axis
and pier width in the earlier proportion and rear-corner notes.

`Browser/dist/west-refinement.mjs` derives the pier width and doorway axis
from the shared outer limits. Central windows, door, white base, bands,
cornice, pipe and entrance path follow the centred pier. The two narrow
upper sashes retain their dimensions and fit the wider left flank. The
right flank remains blank. The outside D2 destination follows the door in
both shared plan copies; its interior anchor retains its definition.

Evidence and saved original source are in
[Browser/artifacts/west-end-sections](../../../Browser/artifacts/west-end-sections/).
The physical section regression, exposed glazing, courses, door trim/support,
walking, basement access and roof contacts pass. Source and compiled desktop
and phone views were visually reviewed. Compiled rendering, full detail,
fallbacks and every timeline stop pass. The full browser suite reaches the
existing Jarman whole-estate snapshot mismatch, which also occurs with the
saved original facade; its protected expectation is retained.

Browser sources and the local compiled aerial model are updated. Unity,
Blender and packaged application exports are not regenerated.
