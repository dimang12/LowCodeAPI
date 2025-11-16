import React from 'react';

const PagesModule = () => (
  <div className="module module-pages">
    <aside className="module-sidebar">
      <h2>Page Templates</h2>
      <ul>
        <li>Landing</li>
        <li>Forms</li>
        <li>Dashboards</li>
        <li>Knowledge base</li>
      </ul>
    </aside>
    <section className="module-canvas">
      <header>
        <h1>Page Builder</h1>
        <p>Drag sections onto the canvas and configure interactive widgets.</p>
      </header>
      <div className="canvas-preview">
        <div className="canvas-row">
          <div className="canvas-block">Hero banner</div>
          <div className="canvas-block">Quick links</div>
        </div>
        <div className="canvas-row">
          <div className="canvas-block">Data table</div>
          <div className="canvas-block">Activity feed</div>
        </div>
      </div>
    </section>
  </div>
);

export default PagesModule;

