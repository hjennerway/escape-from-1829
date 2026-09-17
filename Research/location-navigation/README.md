# Location dropdown — September 17, 2026

Both aerial and exterior walking menus use the user's original labels and
subsequently identified locations.
The shared `aerial-locations.mjs` sorts the full displayed labels A–Z, ignoring
case, with the numbered 1829 entries first. It sorts on load and automatically
re-sorts when entries are added or renamed, so markup order does not matter.
The Centre, East wing, West wing and Basement entries use the existing exterior
views of those parts of 1829; this change does not add ward interiors.

The user's `1829-wards.png` identifies Barmere as the blue-circled long eastern
side range (x=89.2, z=-14). The red-circled rear cross range (x=76.2, z=-38)
is shared by Redesmere and Saughall. These named destinations supersede the
older menu's Redesmere photo destination, which looked at the Barmere side.
The old photo URL remains available.

In `hale-huxley-wards.png`, yellow identifies Hale/Daresbury at the Grafton end
and purple identifies Huxley/Dunham in the long cross range beside the tower.
Their aerial and walking views follow the model's ward-placement transform.

`Browser/dist/location-views.mjs` contains the named view aliases and the newly
identified destinations. Separate ward URLs preserve the selected menu entry
even where two wards share the same building. Garages and Mortuary are separate
options, and Mortuary's Walk here link retains that destination.

The later yellow outline names the L-shaped service building **Stores**: the
south cross-gabled range and long eastern return beside the water tower, opposite
Estates. Its aerial and walking destinations follow those ranges' placed bounds.
Choose **Stores** in either Locations menu, or use `?view=stores`; the aerial
view also provides **Walk here**. The building remains in the Historic layout.
