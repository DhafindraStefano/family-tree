export const treeStyles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

body, html {
  background: #faf9f7 !important;
  overflow: hidden;
  height: 100%;
}

.ftc-page {
  min-height: 100vh;
  background: #faf9f7;
  font-family: 'DM Sans', sans-serif;
}

.ftc-search-input {
  font-size: 13px;
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
  border-top: 1.5px solid #d6d3d1;
  width: 50%; height: 36px;
}
.family-tree li::after {
  right: auto; left: 50%;
  border-left: 1.5px solid #d6d3d1;
}
.family-tree li:only-child::after,
.family-tree li:only-child::before { display: none; }
.family-tree li:only-child { padding-top: 0; }
.family-tree li:first-child::before,
.family-tree li:last-child::after { border: 0 none; }
.family-tree li:last-child::before {
  border-right: 1.5px solid #d6d3d1;
  border-radius: 0 10px 0 0;
}
.family-tree li:first-child::after {
  border-radius: 10px 0 0 0;
}
.family-tree ul ul::before {
  content: '';
  position: absolute; top: 0; left: 50%;
  border-left: 1.5px solid #d6d3d1;
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
