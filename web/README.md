# Summit & Stitch — Scroll World (prototype)

`scroll-world.html` is a fully self-contained prototype of the scroll-driven
clay diorama site: Three.js (r152, inlined) renders a procedural claymation
Colorado island — cabin, clothesline with the four colorway beanies, snowy
peaks, market stall island, two knitting figures — and a damped scroll scrub
drives the camera through eight story beats with HTML sections overlaid.
Open the file in any browser; no build step, no network needed.

`src/shell.html` (markup + CSS) and `src/world.js` (scene + scrub) are the
editable sources; the prototype is those two files with `three.min.js`
inlined between them.

Prototype substitutions vs. the full brief (deliberate, to stay
dependency-free and single-file):

- GSAP ScrollTrigger + Lenis → hand-rolled damped scrub (same drifting feel)
- GLTF clay models → procedural Three.js geometry (rounded lathe/extrude
  primitives, matte clay materials)
- Playfair Display / Crimson Text / Inter → Palatino / Georgia / system sans
  (swap in Google Fonts when hosting)
- Reduced-motion and no-WebGL users get a static editorial fallback page

To grow this into the production Vite + React Three Fiber app, port
`world.js` scene groups into R3F components and swap the scrub for
ScrollTrigger with `scrub: true`.

`../app-mock/app-mock.html` is the interactive phone-frame mockup of the
React Native (Expo) companion app: Shop / Story / Journal / Market tabs,
spring swatch picker, slide-up cart sheet, drop-notification opt-in.
