# Hospital Shop beside Redesmere

The user supplied img1.jpg, img1-annotated.png and img1-loc.png. Red identifies the existing ivy-covered Redesmere range. Blue identifies a white single-storey Hospital Shop block; green identifies its lower, flat-roofed brick connection. Annotation colours and arrows are location guides only.

Browser/dist/laundry.mjs places the long block along the estate's north/south axis, east of the garden path and in front of the Redesmere-to-Main/admin range. Its footprint is x=102–116.6, z=28–56.8. The narrower link occupies x=102–108.6 and runs from the existing connector building's actual front wall to the Hospital Shop's rear wall. The existing ivy range and edge chimney retain their geometry.

The photograph informs the off-white rendered walls, seven high multi-pane west-facing windows, plain lower panels, rainwater fittings and small roof cowls. The roof is fully hipped as explicitly requested. The corridor has brick walls and a level felt roof with coping. The hidden east elevation repeats the window rhythm; the road-facing end is plain. Placement, heights, depth and concealed elevations are visual estimates from the marked view, not surveyed measurements.

The building follows Historic visibility in the aerial layout and is included in the browser exterior and walking collisions. Open aerial.html?view=laundry, ?view=laundry-photo or ?view=laundry-plan; the Hospital Shop location also links to a ground-level walk. Unity and Blender exports are unchanged.

Validation: node Browser/test-laundry.mjs checks the actual roof slopes, flat corridor roof, building contacts, exposed window geometry, garden-path clearance and Historic/Modern visibility/collisions. Browser screenshots are saved under Browser/artifacts/laundry-*.png.

## Garden lamp placement (29 September 2026)

The owner's circled-lamp/red-X screenshot moves the existing slender steel lamp
from x=102, z=39 to x=98.75, z=39, on the lawn beyond the shop's wall-side path.
The post, arm and head move together by 3.25 scene metres; their height and
bearing are retained. The destination is a visual estimate registered against
the shop roof and original lamp, not a surveyed position. The shared browser
builder in `east-photo-detail.mjs` supplies this placement before batching and
collision extraction. This is separate from the concrete roadside lamps.
