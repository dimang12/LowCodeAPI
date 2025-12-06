# SDM Management Data Flow

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         React Components                         │
│                                                                  │
│  ┌────────────────┐              ┌──────────────────────┐        │
│  │  SdmManager    │              │   DiagramCanvas      │        │
│  │                │              │                      │        │
│  │  - Create UI   │◄────props────┤  - Elements          │        │
│  │  - List UI     │              │  - Connections       │        │
│  │  - Modals      │              │  - Selection         │        │
│  └────────┬───────┘              │  - History           │        │
│           │                      └──────────┬───────────┘        │
│           │                                 │                    │
└───────────┼─────────────────────────────────┼────────────────────┘
            │                                 │
            │ API Calls                       │ Auto-save
            ▼                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                        Service Layer                              │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     sdmApi.js                              │  │
│  │                                                            │  │
│  │  getAll() ────────────────► GET /api/sdm                  │  │
│  │  getById(id) ─────────────► GET /api/sdm/:id              │  │
│  │  create(name) ────────────► POST /api/sdm                 │  │
│  │  update(id, name) ────────► PUT /api/sdm/:id              │  │
│  │  delete(id) ──────────────► DELETE /api/sdm/:id           │  │
│  │  saveElement(id, elem) ───► POST /api/sdm/:id/elements    │  │
│  │  saveConnection(id, conn) ► POST /api/sdm/:id/connections │  │
│  │  saveState(id, e, c) ─────► PUT /api/sdm/:id/state        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                    │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Backend API (TODO)                           │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   SdmController.cs                         │  │
│  │                                                            │  │
│  │  [GET] /api/sdm                                           │  │
│  │  [GET] /api/sdm/:id                                       │  │
│  │  [POST] /api/sdm                                          │  │
│  │  [PUT] /api/sdm/:id                                       │  │
│  │  [DELETE] /api/sdm/:id                                    │  │
│  │  [POST] /api/sdm/:id/elements                             │  │
│  │  [POST] /api/sdm/:id/connections                          │  │
│  │  [PUT] /api/sdm/:id/state                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                    │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            │ Entity Framework
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Database (TODO)                           │
│                                                                    │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  Sdms          │  │  SdmElements     │  │  SdmConnections │ │
│  │                │  │                  │  │                 │ │
│  │  Id            │  │  Id              │  │  Id             │ │
│  │  Name          │  │  SdmId ─────────┐│  │  SdmId ────────┐│ │
│  │  CreatedAt     │  │  ElementId      ││  │  FromElementId ││ │
│  │  UpdatedAt     │  │  Type           ││  │  ToElementId   ││ │
│  └────────┬───────┘  │  X, Y           ││  │  Type          ││ │
│           │          │  Width, Height  ││  │  CreatedAt     ││ │
│           │          │  Label          ││  └────────────────┘│ │
│           │          │  CreatedAt      ││                     │ │
│           │          └─────────────────┘│                     │ │
│           └────────────────────────────►│                     │ │
│                                          └─────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Scenarios

### Scenario 1: Creating a New SDM

```
User Action: Click [+] button
│
├─► SdmManager.handleCreate()
│   │
│   ├─► setState({ isCreating: true })
│   │
│   ├─► sdmApi.create(name)
│   │   │
│   │   ├─► POST /api/sdm
│   │   │   Body: { name: "New Diagram" }
│   │   │
│   │   └─► Response: { id: 1, name: "New Diagram", ... }
│   │
│   ├─► onSdmChange(newSdm.id)
│   │   │
│   │   └─► DiagramCanvas.handleSdmChange(1)
│   │       │
│   │       ├─► setCurrentSdmId(1)
│   │       ├─► setElements([])
│   │       ├─► setConnections([])
│   │       └─► Clear canvas
│   │
│   └─► setState({ isCreating: false, showCreateModal: false })
│
└─► UI updates: Badge shows [≡ 1]
```

### Scenario 2: Drawing an Element (Auto-Save)

```
User Action: Draw rectangle on canvas
│
├─► DiagramCanvas.handleDraw()
│   │
│   ├─► const newElement = { id: timestamp, type: 'rect', x, y, width, height }
│   │
│   ├─► setElements([...elements, newElement])
│   │
│   └─► saveToHistory(newElements, connections)
│       │
│       ├─► Update history state
│       │
│       └─► if (currentSdmId) {
│           │
│           └─► sdmApi.saveState(currentSdmId, newElements, connections)
│               │
│               ├─► PUT /api/sdm/1/state
│               │   Body: {
│               │     elements: [{ id: ..., type: 'rect', ... }],
│               │     connections: []
│               │   }
│               │
│               └─► Backend: Delete old data, insert new data
│                   │
│                   └─► Database: SdmElements table updated
```

### Scenario 3: Switching Between SDMs

```
User Action: Click SDM from list
│
├─► SdmManager.handleSdmClick(2)
│   │
│   ├─► onSdmChange(2)
│   │   │
│   │   └─► DiagramCanvas.handleSdmChange(2)
│   │       │
│   │       ├─► setState({ loading: true })
│   │       │
│   │       ├─► sdmApi.getById(2)
│   │       │   │
│   │       │   ├─► GET /api/sdm/2
│   │       │   │
│   │       │   └─► Response: {
│   │       │       │   id: 2,
│   │       │       │   name: "Backend Architecture",
│   │       │       │   elements: [{ id: ..., type: 'circle', ... }],
│   │       │       │   connections: [{ from: ..., to: ... }]
│   │       │       └─► }
│   │       │
│   │       ├─► setCurrentSdmId(2)
│   │       ├─► setElements(sdmData.elements)
│   │       ├─► setConnections(sdmData.connections)
│   │       ├─► Clear selection
│   │       ├─► Reset history
│   │       │
│   │       └─► setState({ loading: false })
│   │
│   └─► setState({ showList: false })
│
└─► Canvas redraws with new data
```

### Scenario 4: Moving Elements (Auto-Save)

```
User Action: Drag element to new position
│
├─► DiagramCanvas.handleDrag()
│   │
│   ├─► Update element position
│   │
│   ├─► Update connected lines
│   │
│   └─► On drag end:
│       │
│       └─► saveToHistory(updatedElements, connections)
│           │
│           └─► Auto-save triggered
│               │
│               └─► sdmApi.saveState(currentSdmId, updatedElements, connections)
│                   │
│                   └─► PUT /api/sdm/1/state
│                       │
│                       └─► Database updated
```

## State Management

### Component State Flow

```
DiagramCanvas State:
├─► elements: Array<Element>
├─► connections: Array<Connection>
├─► selectedElements: Array<number>
├─► selectedConnection: Object
├─► currentSdmId: number | null
├─► history: Array<{ elements, connections }>
└─► historyIndex: number

SdmManager State:
├─► sdms: Array<Sdm>
├─► loading: boolean
├─► showList: boolean
├─► showCreateModal: boolean
├─► isCreating: boolean
└─► newSdmName: string
```

### Data Types

```typescript
interface Sdm {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface SdmWithData extends Sdm {
  elements: Element[];
  connections: Connection[];
}

interface Element {
  id: number;  // Actually float (timestamp)
  type: 'rect' | 'circle' | 'ellipse';
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

interface Connection {
  from: number;  // Element ID
  to: number;    // Element ID
  type: 'default' | string;
}
```

## Error Handling

### Frontend Error Flow

```
API Call Fails
│
├─► sdmApi catches error
│   │
│   ├─► Log error to console
│   │
│   └─► Re-throw error
│
├─► Component catches error
│   │
│   ├─► Log error to console
│   │
│   ├─► Reset loading state
│   │
│   └─► (Future) Show toast notification
│
└─► User sees: (Currently) Console error only
            (Future) Toast message
```

### Backend Error Responses

```
400 Bad Request
├─► Invalid input data
└─► { error: "Validation failed", details: [...] }

404 Not Found
├─► SDM not found
└─► { error: "SDM with id X not found" }

500 Internal Server Error
├─► Database error
└─► { error: "Internal server error" }
```

## Performance Considerations

### Optimization Strategies

1. **Debounced Auto-Save**
   - Current: Saves on every change
   - Improvement: Debounce saves by 500ms
   - Benefit: Reduces API calls during rapid changes

2. **Bulk Operations**
   - Current: Uses saveState for full updates
   - Keep: Good for undo/redo scenarios
   - Alternative: Individual element/connection saves for single changes

3. **Caching**
   - Current: No caching
   - Improvement: Cache SDM list and current SDM data
   - Benefit: Faster switching between SDMs

4. **Optimistic Updates**
   - Current: Updates state first, saves async
   - Keep: Good UX, immediate feedback
   - Caution: Handle save failures gracefully

## Testing Checklist

### Frontend Tests

- [ ] Create new SDM with valid name
- [ ] Create SDM with empty name (validation)
- [ ] Create SDM while offline (error handling)
- [ ] View empty SDM list
- [ ] View SDM list with multiple items
- [ ] Switch between SDMs
- [ ] Switch to same SDM (no-op)
- [ ] Auto-save after drawing element
- [ ] Auto-save after moving element
- [ ] Auto-save after deleting element
- [ ] Auto-save after undo/redo
- [ ] Close modals with X button
- [ ] Close modals with overlay click
- [ ] Cancel SDM creation

### Backend Tests

- [ ] GET /api/sdm returns all SDMs
- [ ] GET /api/sdm/:id returns specific SDM
- [ ] GET /api/sdm/:id with elements and connections
- [ ] POST /api/sdm creates new SDM
- [ ] PUT /api/sdm/:id updates SDM name
- [ ] DELETE /api/sdm/:id removes SDM
- [ ] PUT /api/sdm/:id/state saves full diagram
- [ ] PUT /api/sdm/:id/state replaces existing data
- [ ] Cascade delete (deleting SDM removes elements/connections)
- [ ] Handle invalid SDM IDs
- [ ] Handle malformed request bodies

### Integration Tests

- [ ] Create SDM → Draw elements → Refresh page → Elements persist
- [ ] Switch SDM → Elements change correctly
- [ ] Multiple browser tabs → Changes sync (if implemented)
- [ ] Network failure → Retry mechanism (if implemented)

## Future Enhancements

### Short Term
1. Toast notifications for success/error
2. Loading indicators during operations
3. Debounced auto-save
4. Default SDM on first load

### Medium Term
1. Rename SDM functionality
2. Duplicate SDM
3. Export/Import SDM as JSON
4. Search/filter SDM list
5. Sort SDM list (date, name)

### Long Term
1. Real-time collaboration
2. Version history
3. Comments and annotations
4. Team sharing and permissions
5. Templates and presets
