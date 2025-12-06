# SDM Management System - Implementation Guide

## Overview
The SDM (System Design Model) management system has been fully integrated into the DiagramCanvas component. Users can now:
1. ✅ Create new SDMs with a Plus button
2. ✅ View and switch between SDMs with a List button
3. ✅ Auto-save diagram changes to the database
4. ✅ Load diagram state when switching between SDMs

## Frontend Implementation Complete

### New Files Created

#### 1. `components/SdmManager.js` (240 lines)
React component providing the UI for SDM management:
- **Plus Button**: Opens modal to create new SDM
- **List Button**: Shows all SDMs with count badge
- **Create Modal**: Input field with validation and create/cancel actions
- **List Modal**: Scrollable list of SDMs with current selection highlighted
- **Overlay**: Click-to-close backdrop for modals

**Key Features:**
- Loading states during API calls
- Error handling with console logging
- Modal state management
- Visual feedback for current SDM

#### 2. `services/sdmApi.js` (110 lines)
API service layer for all SDM database operations:

**Available Methods:**
- `getAll()` - Fetch all SDMs
- `getById(id)` - Get specific SDM with elements and connections
- `create(name)` - Create new SDM
- `update(id, name)` - Rename SDM
- `delete(id)` - Remove SDM
- `saveElement(sdmId, element)` - Save single element
- `saveConnection(sdmId, connection)` - Save single connection
- `saveState(sdmId, elements, connections)` - Bulk save entire diagram

### Integration into DiagramCanvas

#### State Management
```javascript
const [currentSdmId, setCurrentSdmId] = useState(null);
```

#### Auto-Save Implementation
The `saveToHistory` callback has been enhanced to automatically save to the database:
```javascript
const saveToHistory = useCallback((newElements, newConnections) => {
  // ... history management
  
  // Auto-save to database if SDM is active
  if (currentSdmId) {
    sdmApi.saveState(currentSdmId, newElements, newConnections).catch(error => {
      console.error('Failed to save SDM state:', error);
    });
  }
}, [historyIndex, currentSdmId]);
```

#### SDM Switching
```javascript
const handleSdmChange = useCallback(async (sdmId) => {
  try {
    const sdmData = await sdmApi.getById(sdmId);
    setCurrentSdmId(sdmId);
    setElements(sdmData.elements || []);
    setConnections(sdmData.connections || []);
    setSelectedElements([]);
    setSelectedConnection(null);
    setHistory([{ elements: sdmData.elements || [], connections: sdmData.connections || [] }]);
    setHistoryIndex(0);
  } catch (error) {
    console.error('Failed to load SDM:', error);
  }
}, []);
```

#### Component Integration
```jsx
<SdmManager
  currentSdmId={currentSdmId}
  onSdmChange={handleSdmChange}
  onSave={handleSave}
/>
```

## Backend Requirements (TODO)

### Database Schema

#### Table: `Sdms`
```sql
CREATE TABLE Sdms (
  Id INT PRIMARY KEY IDENTITY(1,1),
  Name NVARCHAR(200) NOT NULL,
  CreatedAt DATETIME2 DEFAULT GETDATE(),
  UpdatedAt DATETIME2 DEFAULT GETDATE()
);
```

#### Table: `SdmElements`
```sql
CREATE TABLE SdmElements (
  Id INT PRIMARY KEY IDENTITY(1,1),
  SdmId INT NOT NULL FOREIGN KEY REFERENCES Sdms(Id) ON DELETE CASCADE,
  ElementId FLOAT NOT NULL,  -- Element ID from frontend (e.g., 1763601151891.5386)
  Type NVARCHAR(50) NOT NULL,
  X FLOAT NOT NULL,
  Y FLOAT NOT NULL,
  Width FLOAT NOT NULL,
  Height FLOAT NOT NULL,
  Label NVARCHAR(500),
  CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

#### Table: `SdmConnections`
```sql
CREATE TABLE SdmConnections (
  Id INT PRIMARY KEY IDENTITY(1,1),
  SdmId INT NOT NULL FOREIGN KEY REFERENCES Sdms(Id) ON DELETE CASCADE,
  FromElementId FLOAT NOT NULL,
  ToElementId FLOAT NOT NULL,
  Type NVARCHAR(50) DEFAULT 'default',
  CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### Required API Endpoints

#### 1. Get All SDMs
```
GET /api/sdm
Response: [{ id: 1, name: "Main Diagram", createdAt: "...", updatedAt: "..." }]
```

#### 2. Get SDM by ID (with elements and connections)
```
GET /api/sdm/:id
Response: {
  id: 1,
  name: "Main Diagram",
  elements: [
    { id: 1763601151891.5386, type: "rect", x: 100, y: 100, width: 200, height: 100, label: "Component" }
  ],
  connections: [
    { from: 1763601151891.5386, to: 1763601151892.1234, type: "default" }
  ]
}
```

#### 3. Create New SDM
```
POST /api/sdm
Body: { name: "New Diagram" }
Response: { id: 2, name: "New Diagram", createdAt: "...", updatedAt: "..." }
```

#### 4. Update SDM Name
```
PUT /api/sdm/:id
Body: { name: "Renamed Diagram" }
Response: { id: 1, name: "Renamed Diagram", updatedAt: "..." }
```

#### 5. Delete SDM
```
DELETE /api/sdm/:id
Response: 204 No Content
```

#### 6. Save Element to SDM
```
POST /api/sdm/:id/elements
Body: {
  id: 1763601151891.5386,
  type: "rect",
  x: 100,
  y: 100,
  width: 200,
  height: 100,
  label: "Component"
}
Response: 201 Created
```

#### 7. Save Connection to SDM
```
POST /api/sdm/:id/connections
Body: { from: 1763601151891.5386, to: 1763601151892.1234, type: "default" }
Response: 201 Created
```

#### 8. Save Entire SDM State (Bulk Update)
```
PUT /api/sdm/:id/state
Body: {
  elements: [...],
  connections: [...]
}
Response: 200 OK
```

**Note:** This endpoint should replace all elements and connections for the SDM with the provided data.

### Implementation Example (C# ASP.NET Core)

#### Models
```csharp
public class Sdm
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<SdmElement> Elements { get; set; }
    public List<SdmConnection> Connections { get; set; }
}

public class SdmElement
{
    public int Id { get; set; }
    public int SdmId { get; set; }
    public double ElementId { get; set; }  // Float ID from frontend
    public string Type { get; set; }
    public double X { get; set; }
    public double Y { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }
    public string Label { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SdmConnection
{
    public int Id { get; set; }
    public int SdmId { get; set; }
    public double FromElementId { get; set; }
    public double ToElementId { get; set; }
    public string Type { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Controller Stub
```csharp
[ApiController]
[Route("api/[controller]")]
public class SdmController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SdmController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Sdm>>> GetAll()
    {
        return await _context.Sdms.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Sdm>> GetById(int id)
    {
        var sdm = await _context.Sdms
            .Include(s => s.Elements)
            .Include(s => s.Connections)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sdm == null) return NotFound();
        return sdm;
    }

    [HttpPost]
    public async Task<ActionResult<Sdm>> Create([FromBody] CreateSdmDto dto)
    {
        var sdm = new Sdm
        {
            Name = dto.Name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Sdms.Add(sdm);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = sdm.Id }, sdm);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSdmDto dto)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null) return NotFound();

        sdm.Name = dto.Name;
        sdm.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sdm = await _context.Sdms.FindAsync(id);
        if (sdm == null) return NotFound();

        _context.Sdms.Remove(sdm);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/elements")]
    public async Task<IActionResult> SaveElement(int id, [FromBody] SdmElementDto dto)
    {
        // Implementation to save/update element
        return StatusCode(201);
    }

    [HttpPost("{id}/connections")]
    public async Task<IActionResult> SaveConnection(int id, [FromBody] SdmConnectionDto dto)
    {
        // Implementation to save/update connection
        return StatusCode(201);
    }

    [HttpPut("{id}/state")]
    public async Task<IActionResult> SaveState(int id, [FromBody] SdmStateDto dto)
    {
        // Delete existing elements and connections
        var elements = await _context.SdmElements.Where(e => e.SdmId == id).ToListAsync();
        var connections = await _context.SdmConnections.Where(c => c.SdmId == id).ToListAsync();
        _context.SdmElements.RemoveRange(elements);
        _context.SdmConnections.RemoveRange(connections);

        // Add new elements and connections
        // ... implementation

        await _context.SaveChangesAsync();
        return Ok();
    }
}
```

## Testing the Implementation

### 1. Test SDM Creation
1. Open the diagram canvas
2. Click the Plus button in top-left
3. Enter a name like "Test Diagram"
4. Click "Create"
5. Verify the SDM count badge shows "1"

### 2. Test Element Auto-Save
1. Draw a rectangle on the canvas
2. Check browser console for save success/error messages
3. Verify network tab shows POST request to `/api/sdm/{id}/state`

### 3. Test SDM Switching
1. Create another SDM
2. Draw different elements in each
3. Click List button
4. Switch between SDMs
5. Verify elements load correctly for each SDM

### 4. Test Auto-Save During Editing
1. Move an element
2. Resize an element
3. Add connections
4. Verify each action triggers a save (check console/network)

## Current Behavior

### Auto-Save Triggers
The system auto-saves to the database whenever:
- Elements are added, moved, resized, or deleted
- Connections are created or deleted
- Undo/Redo actions are performed
- Any change that calls `saveToHistory()`

### Manual Save
The `handleSave` callback is also available for manual saves if needed in the future.

## Known Limitations

1. **Backend Not Implemented**: All API calls will currently fail until backend endpoints are created
2. **No Initial SDM**: User must create an SDM before drawing
3. **No Default SDM**: Consider adding auto-creation of "Untitled Diagram" on first load
4. **No Error UI**: Errors are logged to console but not shown to user
5. **No Loading Indicators**: During save/load operations (except modal spinners)

## Future Enhancements

1. **Toast Notifications**: Show success/error messages for save operations
2. **Default SDM**: Auto-create initial diagram on first launch
3. **Rename SDM**: Add edit functionality to rename SDMs from list
4. **Search/Filter**: Add search bar for SDM list when many exist
5. **Recent SDMs**: Show most recently used SDMs at top
6. **Export/Import**: Allow JSON export/import of diagrams
7. **Collaboration**: Real-time collaboration features
8. **Version History**: Track versions of each SDM over time

## Next Steps

1. **Backend Implementation** (Priority 1):
   - Create database tables using provided schema
   - Implement API endpoints in `SdmController.cs`
   - Test with Postman or similar tool

2. **Testing** (Priority 2):
   - Test CRUD operations for SDMs
   - Test element and connection persistence
   - Test switching between multiple SDMs

3. **UI Enhancements** (Priority 3):
   - Add toast notifications for feedback
   - Add loading indicators during operations
   - Improve error handling with user-friendly messages

4. **Documentation** (Priority 4):
   - Add API documentation (Swagger)
   - Create user guide for SDM management
   - Document database schema in detail
