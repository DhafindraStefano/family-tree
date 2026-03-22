# Keluarga Ikadam - Family Tree Builder

An elegant, highly interactive, client-side family tree building application. Designed with modern React/Next.js, this app provides a beautifully styled, dynamic tree layout mapping out multiple generations using pure flexbox CSS styling natively combined with powerful canvas panning/zooming capabilities.

## ✨ Key Features & Capabilities

- **Interactive Canvas Navigation:** Navigate massive ancestry trees effortlessly utilizing `react-zoom-pan-pinch` architecture. Full support for drag-to-pan, mouse-wheel zooming, and instant `Center Tree` tracking.
- **Quick-Add Prototyping:** Hover over any existing family member to reveal rapid contextual insertion points (`+ Sibling`, `+ Spouse`, `+ Descendant`). Clicking these triggers smart-linked modals, automatically binding generational heights and biological constraints instantly.
- **Native Polygamy & Multi-Spouse Support:** Dynamically rendering distinct maternal/paternal branches organically. Spouses are intelligently grouped via structural horizontal dashes spanning their primary partner seamlessly tying specific children to exact maternal bonds safely decoupling generic sub-trees natively avoiding duplicate layout clusters!
- **Image Upload & Live Camera Capture:** Give a face to the name! The edit modal includes full client-side HTML5 Canvas resizing automatically downscaling avatars seamlessly alongside integrated `navigator.mediaDevices` streams grabbing photos from your webcam entirely locally directly inside the viewport!
- **Advanced Sibling & Spouse Reordering:** Adjust the specific birth-order index or timeline marriage sequences identically! Native index splicing dynamically reflows the flex-tree drawing hierarchy to match identical lateral layout specifications perfectly!
- **Smart Global Search:** Featuring an expandable `Top Nav` search text-input that performs substring aliases, last name, and first name searches natively indexing your tree logic. Selecting any dropdown hit instantly triggers a custom transform component zooming straight over to focus/highlight that specific profile footprint securely across the canvas viewport!
- **Zero-Backend LocalStorage Persistence:** Keeps things blazing fast! All layout arrays, profile avatars, aliasing data, and relation logic is persistently auto-saved client-side via uncompressed `localStorage`. Simply refresh or restart the app without losing bounds!

---

### 🎨 Design Palette & UI

Constructed matching gorgeous elegant serif typographic standards (`Playfair Display`, `DM Sans`), integrating automated generational warm-natural palettes mapping the CSS structural borders intelligently ensuring different tiers of ancestors carry distinctly beautiful cohesive coloring automatically separating parents from descendants gracefully!

### 🔧 Tech Stack

- React 18 / Next.js
- TypeScript strictly typing relation mapping (Gender, Generation, Recursive Computed Families)
- `react-zoom-pan-pinch`
- HTML5 Canvas & MediaDevices Stream API

### 🚀 Getting Started

1. Clone repo, install dependencies with `npm install`.
2. Execute `npm run dev`.
3. Open `http://localhost:3000` to start charting out the lineage!
