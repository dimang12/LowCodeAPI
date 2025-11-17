# SDM (System Design Modeling) Module

## Architecture Overview

This module follows a scalable, modular architecture with clear separation of concerns.

### Directory Structure

```
src/modules/sdm/
├── components/
│   ├── DiagramCanvas.js        # Main canvas component
│   └── ContextMenu.js          # Right-click context menu
├── handlers/
│   ├── ElementDragHandler.js   # Drag & drop logic for elements
│   └── CanvasDrawHandler.js    # Drawing new elements on canvas
├── utils/
│   ├── connectionHelpers.js    # Connection path calculations
│   ├── elementHelpers.js       # Element creation & manipulation
│   └── svgHelpers.js           # SVG setup & zoom utilities
└── README.md                   # This file
```

## Module Responsibilities

### Components (`components/`)
React components that handle UI rendering and state management.

- **DiagramCanvas.js**: Main component orchestrating the diagram
- **ContextMenu.js**: Context menu for element operations

### Handlers (`handlers/`)
Classes that encapsulate complex interaction behaviors.

- **ElementDragHandler**: Manages element dragging, selection, and connection
  - Drag threshold detection
  - Click vs drag distinction
  - Connection creation
  - Multi-select with Ctrl/Cmd

- **CanvasDrawHandler**: Handles drawing new elements
  - Temporary shape preview
  - Size validation
  - Shape type handling

### Utilities (`utils/`)
Pure functions for calculations and helpers.

- **connectionHelpers.js**
  - `createConnectionPath()`: SVG path generation
  - `updateConnectionsDuringDrag()`: Real-time connection updates
  - `validateConnection()`: Connection validation logic

- **elementHelpers.js**
  - `createNewElement()`: Element factory
  - `getElementColor()`: Color management
  - `calculateResize()`: Resize calculations
  - `getResizeHandlePositions()`: Handle positioning

- **svgHelpers.js**
  - `createGridPattern()`: Grid background
  - `createCircleMarker()`: Connection markers
  - `setupZoomBehavior()`: Zoom/pan configuration

## Usage Examples

### Using ElementDragHandler

```javascript
import { ElementDragHandler } from '../handlers/ElementDragHandler';

const dragHandler = new ElementDragHandler({
  selectedToolRef,
  elements,
  connections,
  connecting,
  setDragging,
  setElements,
  setConnections,
  setConnecting,
  setTempConnection,
  setSelectedElements,
  saveToHistory,
  updateConnections,
  mainGroup
});

const dragBehavior = dragHandler.createDragBehavior();
svg.selectAll('.element').call(dragBehavior);
```

### Using Connection Helpers

```javascript
import { createConnectionPath, validateConnection } from '../utils/connectionHelpers';

const pathData = createConnectionPath(fromElement, toElement);
const validation = validateConnection(fromId, toId, connections);

if (validation.valid) {
  // Create connection
}
```

### Using Element Helpers

```javascript
import { createNewElement, calculateResize } from '../utils/elementHelpers';

const newElement = createNewElement('process', 100, 200);
const resized = calculateResize(element, 'se', dx, dy);
```

## Design Principles

### 1. Single Responsibility
Each module has one clear purpose:
- Handlers manage interactions
- Helpers provide calculations
- Components handle rendering

### 2. Pure Functions Where Possible
Utility functions are pure (no side effects) for easier testing and debugging.

### 3. Class-Based for State
Handlers use classes to encapsulate complex stateful behavior.

### 4. Composition Over Inheritance
Components compose handlers and utilities rather than inheriting behavior.

### 5. Clear Dependencies
Each module explicitly imports what it needs, making dependencies transparent.

## Extending the Module

### Adding a New Element Type

1. Update `elementHelpers.js`:
   - Add to `getDefaultLabel()`
   - Add to `getElementColor()`
   - Add to `getShapePoints()` if polygon

2. Update drawing handler to render the new type

### Adding a New Tool

1. Create new handler in `handlers/`
2. Export handler factory function
3. Import and use in `DiagramCanvas.js`

### Adding New Connection Types

1. Update `connectionHelpers.js` with new path algorithm
2. Add validation rules in `validateConnection()`

## Testing Strategy

### Unit Tests
- Test all utility functions with various inputs
- Test handler methods in isolation

### Integration Tests
- Test handler interactions with D3
- Test component state updates

### E2E Tests
- Test user workflows (drag, draw, connect)
- Test keyboard shortcuts

## Performance Considerations

### Avoiding Re-renders
- Handlers update DOM directly during drag (no React re-renders)
- Final state saved to React only on drag end

### Connection Updates
- Only update connections involving dragged element
- Use data attributes for efficient DOM selection

### Memory Management
- Handlers are recreated on effect re-run
- Event listeners properly cleaned up

## Future Improvements

- [ ] Add undo/redo for all operations
- [ ] Implement element grouping
- [ ] Add element alignment tools
- [ ] Support custom element templates
- [ ] Add export to SVG/PNG
- [ ] Implement collaborative editing
- [ ] Add element search/filter
- [ ] Support nested diagrams
