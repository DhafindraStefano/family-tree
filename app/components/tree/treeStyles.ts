export const treeStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --ft-bg: #faf9f7;
  --ft-nav-bg: rgba(250,249,247,0.92);
  --ft-border: #e7e5e4;
  --ft-text-primary: #44403c;
  --ft-text-secondary: #78716c;
  --ft-line: #d6d3d1;
  --ft-card-bg: #fff;
  --ft-canvas-bg: #fdfdfb;
}

.dark-mode {
  --ft-bg: #0d1117;
  --ft-nav-bg: rgba(13,17,23,0.92);
  --ft-border: #30363d;
  --ft-text-primary: #e6edf3;
  --ft-text-secondary: #8b949e;
  --ft-line: #30363d;
  --ft-card-bg: #161b22;
  --ft-canvas-bg: #0d1117;
}

body, html {
  background: var(--ft-bg) !important;
  color: var(--ft-text-primary);
  overflow: hidden;
  height: 100%;
  transition: background 0.3s ease;
}

.ftc-page {
  min-height: 100vh;
  background: var(--ft-bg);
  font-family: 'DM Sans', sans-serif;
  transition: background 0.3s ease;
}

.ftc-search-input {
  font-size: 13px;
  color: var(--ft-text-primary) !important;
}
@media (max-width: 600px) {
  .ftc-search-input {
    font-size: 16px !important;
  }
}

.family-tree {
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding-bottom: 2rem;
}
.family-tree ul {
  padding-top: 36px;
  position: relative;
  display: flex;
  justify-content: center;
  padding-left: 0;
  margin: 0;
}
.family-tree li {
  text-align: center;
  list-style-type: none;
  position: relative;
  padding: 36px 12px 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.family-tree li::before, .family-tree li::after {
  content: '';
  position: absolute; top: 0; right: 50%;
  border-top: 1.5px solid var(--ft-line);
  width: 50%; height: 36px;
}
.family-tree li::after {
  right: auto; left: 50%;
  border-left: 1.5px solid var(--ft-line);
}
.family-tree li:only-child::after,
.family-tree li:only-child::before { display: none; }
.family-tree li:only-child { padding-top: 0; }
.family-tree li:first-child::before,
.family-tree li:last-child::after { border: 0 none; }
.family-tree li:last-child::before {
  border-right: 1.5px solid var(--ft-line);
  border-radius: 0 10px 0 0;
}
.family-tree li:first-child::after {
  border-radius: 10px 0 0 0;
}
.family-tree ul ul::before {
  content: '';
  position: absolute; top: 0; left: 50%;
  border-left: 1.5px solid var(--ft-line);
  width: 0; height: 36px;
  margin-left: -1px;
}

/* Mobile tweaks */
@media (max-width: 600px) {
  .add-btn-label { display: none; }
  .family-tree li { padding: 28px 8px 0 8px; }
  .family-tree ul { padding-top: 28px; }
  .family-tree ul ul::before { height: 28px; }
  .family-tree li::before, .family-tree li::after { height: 28px; }
}
`;
