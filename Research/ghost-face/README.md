# Ghost face: Hollow Eyes

The owner selected design 02 from five face mockups on 9 October 2026.
[Approved concept](hollow-eyes-approved.png) is an AI-generated design reference,
not a screenshot or a texture used by the game.

The face should remain human, with a narrow continuous jaw, pronounced
cheekbones, hollow cheeks, a slender nose and thin, closed grey lips. Two empty
black sockets follow the shape of human eyelids. There are no eyeballs, pupils,
eye glow, exposed skull or gore. Retain the existing hair, head tilt, neck,
shroud and animation.

`Browser/dist/asylum-ghost.mjs` sculpts the features into a single head mesh.
Eye sockets are concave, with raised lids and brows; the cheek hollows and nose
are part of that same surface. A generated 512-square diffuse shading map
preserves smooth socket and lip edges without requiring a denser mesh. Its
matte material avoids specular highlights inside the empty sockets under the
torch. The concept image is not loaded at runtime.

Use `Browser/test-asylum-ghost-browser.mjs` to inspect the real corridor with
the torch on and off, close approach and phone framing. Its additional face
portrait uses a narrower field of view at 1.3 metres to inspect the geometry
without placing the torch almost against the face. This diagnostic camera
does not change the player's camera or gameplay. A second portrait turns the
head slightly with the torch off to show socket and cheek depth.

Runtime character geometry is outside the compiled estate/interior assets.
This design is implemented in the browser game; Unity/Android and Blender
exports require separate work.
