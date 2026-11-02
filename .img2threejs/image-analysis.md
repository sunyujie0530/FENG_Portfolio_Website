# Image analysis — light-blue campus backpack

Reference: `.img2threejs/reference.png`. Single front view, camera slightly above the object, facing +Z toward the front pocket. Locker door behind is background, not part of the subject.

## Layer 1 — Identification

Observed: a soft-sided school backpack, open at the top, stuffed with stationery. Work type: backpack. Broad class: soft goods / bag. primaryDomain: object. Confidence: 0.9.

## Layer 2 — Form and silhouette

Bounding volume is a rounded cuboid, taller than it is deep, bilateral symmetry about the medial plane. Front face is a broad panel. Top is open with contents rising above the rim. A narrow strap hangs below the body on the medial line. Aspect: height of the shell is about 1.15× its width; depth is about 0.4× width. Shape language is geometric with rounded corners, not organic.

## Layer 3 — Decomposition

Macro:
- shell (main compartment)
- front pocket
- hanging strap
- contents (books, calculator, pen) sitting in the openings

Meso:
- top rim / open mouth
- front zipper track (black, diagonal across the pocket mouth)
- black rectangular patch on the lower front panel
- yellow board, orange board, red spine rising from the main mouth
- pink calculator and green pen in the front pocket

Micro:
- zipper teeth as a thin dark band
- calculator body as a small rounded rectangle
- pen as a thin cylinder

## Layer 4 — Spatial relationships

- front pocket overlaps the lower front of the shell (overlap, flush at the sides)
- zipper is embedded along the pocket mouth
- black patch is flush on the lower front of the pocket
- strap is attached under the shell and hangs down (butt)
- yellow and orange boards are inside the main mouth, protruding up
- red spine is inside the mouth, lateral of the yellow board
- calculator and green pen are inside the front pocket, protruding forward

## Layer 5 — Materials

- Shell and pocket: dielectric fabric, albedo vivid light blue, roughness about 0.55, metalness 0. Pocket is a slightly darker blue than the shell.
- Zipper, patch, strap: dielectric, albedo near black, roughness about 0.7.
- Contents: opaque paper/plastic, high saturation, roughness about 0.45.

## Layer 6 — Color

- Shell: vivid cyan-blue, mid-high value.
- Pocket: same hue, lower value.
- Mouth interior: darker blue, occluded.
- Contents: yellow, orange, red, pink, green. No gradient on the shell.

## Layer 7 — Identity features

- Open top with yellow, orange, and a thin red spine sticking out
- Diagonal black zipper on the front pocket
- Pink calculator and green pen in the pocket
- Black hanging strap centered under the bag
- Small black rectangle on the lower front

## Layer 8 — Uncertainty

- Back panel, shoulder straps, and side gussets are hidden.
- Interior of the main compartment is occluded by the contents.
- Exact zipper hardware (pull tab) is uncertain at this resolution.
- The single view cannot confirm depth of the books. Those depths are approximate.
