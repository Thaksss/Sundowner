# Sundowner

Run locally with `npm.cmd run dev`. Validate with `npm.cmd run typecheck`, `npm.cmd run check:mission`, and `npm.cmd run build`.

## Telemetry modes

Demo mode uses illustrative values and enables scenario and decision controls. Real telemetry mode never falls back to demo readings. It is an imported observation viewer, not a live device connection. Import JSON smaller than 64 KB through the console:

```json
{
  "source": "Instrument or dataset name",
  "timestamp": "2020-01-01T00:00:00Z",
  "radiationDoseMsv": 156,
  "reserves": [88, 81, 92, 86]
}
```

The example above is synthetic. Replace it with your source observations. Reserve order is musculoskeletal, cognitive, cardiovascular, immune. These are application model percentages, not raw physiological sensor readings. Imports remain local in memory and reset on reload. The application validates shape and ranges, not provenance or clinical accuracy. A real live feed requires a defined device/service API and authentication contract; no endpoint or credentials have been invented.

## Anatomy and interaction

Drag horizontally on the 3D stage to rotate; vertical touch gestures scroll the document. Model and hotspots share one transformed parent. Anatomy view uses the supplied CC BY 4.0 heart and skeleton models, with procedural anatomy while assets load. Their placement is approximate and not anatomically registered to the suit. Attribution, source links, license links and modifications appear in Sources and public/model-credits.txt. The same systems are accessible using keyboard focusable cards below the stage. Selecting a hotspot zooms the original stage camera and reveals a delayed inline information card. There is no modal, duplicate Canvas or scroll lock. Escape and Full body view close inspection and return the camera.

## Performance and accessibility

Scenes pause rendering outside the viewport and when the document is hidden. Mobile uses capped pixel ratio and fewer stars; geometry is memoized and the model is loaded lazily. Horizontal rotation uses delta-based damping, with vertical gesture cancellation. Reduced motion disables floating, pulse and solar particle animations. Frame rate depends on device/GPU; 60 fps is a target, not a guarantee. Rendering failures retain usable HTML telemetry cards.

TypeScript, production build and 21 store/telemetry assertions pass. The local HTTP preview returns 200. Visual checks across physical devices and viewport sizes remain unverified because the browser automation host is unavailable.

## Manual observations

In Real telemetry, choose Enter values. Provide a source, local observation date/time, cumulative radiation dose in mSv, and four reserve model percentages (0–100). Every field is required; blank numeric inputs are not treated as zero. Apply observation validates the snapshot and updates the body view and cards. Draft edits do not change the displayed observation until submitted. Future timestamps and invalid ranges are rejected. Import JSON remains available as an alternative and populates the editable form after validation. Neither entry method creates a live device connection or persistent storage.

## Visual experience

The model stage is large and unframed. Imported anatomy only loads when revealed. On desktop the information card sits beside the zoomed model; on mobile it follows the same Canvas in document flow. Page text and labels have been enlarged. Ember mosaic light, glass surfaces and staggered scroll reveals are inspired by the supplied Mosaic Prompt Template; motion is implemented using the existing Framer Motion and Web Animations APIs, with reduced-motion support. The original template's app generator and pricing demo are not part of the mission app.

## Light theme and framed experiences

The Sun/Moon button in the navigation switches dark/light themes and saves only that display preference to localStorage. Health observations still remain in session memory only. Light mode uses ivory/slate/copper and preserves natural model colors. Detective and Time Warp use semantic HTML prismatic frames inspired by the supplied Warp Carousel reference, rather than a canvas-only carousel. Pointer tilt, rotating rings, signal waves and rim glow respect reduced motion. The reaction cue itself has no moving rings while waiting or responding. Time Warp can play through the illustrative path and pauses its updates when the document is hidden.

`npm.cmd run check:anatomy` checks the supplied GLB geometry and verifies that the transformed heart bounding box lies inside the normalized rib cage volume. This is a geometric fit check, not clinical anatomical registration. A browser visual review is still needed for exact material appearance and alignment.
