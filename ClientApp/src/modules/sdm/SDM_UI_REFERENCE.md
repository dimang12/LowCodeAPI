# SDM Manager UI Reference

## Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌────────────────────────────────────┐    │
│ │  [+]  [≡ 2]  │  │  Info Panel (Shortcuts)            │    │
│ └──────────────┘  │  Ctrl+C Copy, Ctrl+V Paste, etc.   │    │
│                   └────────────────────────────────────┘    │
│    SDM Manager                                              │
│                                                             │
│                                                             │
│                     CANVAS AREA                             │
│                     (Draw shapes here)                      │
│                                                             │
│                                                             │
│  ┌────────────────────────────────────┐  ┌──────────────┐   │
│  │  Stats Panel                       │  │  Zoom        │   │
│  │  Elements: 5                       │  │  Controls    │   │
│  │  Connections: 3                    │  │   [+]        │   │
│  │  Selected: 1                       │  │   100%       │   │
│  └────────────────────────────────────┘  │   [-]        │   │
│                                          └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## SDM Manager Buttons

### Plus Button `[+]`
- Location: Top-left corner
- Function: Create new SDM
- Click behavior: Opens create modal

### List Button `[≡ 2]`
- Location: Next to Plus button
- Badge: Shows count of total SDMs
- Function: View and switch between SDMs
- Click behavior: Opens list modal

## Modal Views

### Create SDM Modal

```
┌─────────────────────────────────────────┐
│  Create New SDM                     [×] │
├─────────────────────────────────────────┤
│                                         │
│  SDM Name:                              │
│  ┌─────────────────────────────────┐   │
│  │ Enter diagram name...           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────┐  ┌─────────┐             │
│  │ Cancel  │  │ Create  │             │
│  └─────────┘  └─────────┘             │
└─────────────────────────────────────────┘
```

**Features:**
- Input validation (name required)
- Cancel button closes modal
- Create button calls API and switches to new SDM
- Loading spinner during creation

### SDM List Modal

```
┌─────────────────────────────────────────┐
│  System Design Models (3)           [×] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ● Main Diagram            [✓]   │   │ ← Current SDM
│  │   Created: 2024-01-15           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ Backend Architecture          │   │
│  │   Created: 2024-01-16           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ Frontend Components           │   │
│  │   Created: 2024-01-17           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Scrollable list of all SDMs
- Current SDM highlighted with blue background
- Checkmark icon for current selection
- Click any SDM to switch
- Loading spinner during switch
- Click X or overlay to close

## User Workflows

### Workflow 1: Creating First SDM

```
1. User opens diagram canvas (empty state)
2. User clicks [+] button
3. Modal opens with name input
4. User types "My First Diagram"
5. User clicks "Create"
6. Loading spinner appears
7. API creates SDM in database
8. Canvas clears for new diagram
9. Badge updates to [≡ 1]
10. User can now draw elements
```

### Workflow 2: Drawing and Auto-Saving

```
1. User has active SDM selected
2. User draws a rectangle
3. saveToHistory() is called
4. Auto-save triggers in background
5. API call to /api/sdm/:id/state
6. Success logged to console
7. Continue drawing...
```

### Workflow 3: Switching Between SDMs

```
1. User has multiple SDMs
2. Badge shows [≡ 3]
3. User clicks badge/list button
4. List modal opens showing all SDMs
5. Current SDM is highlighted
6. User clicks different SDM
7. Loading spinner appears
8. API fetches SDM data
9. Canvas clears and redraws
10. Elements and connections loaded
11. Modal closes automatically
```

## Visual States

### Button States

**Plus Button:**
- Default: White background, black border
- Hover: Light gray background
- Active: Darker gray background

**List Button:**
- Default: White background, black border, blue badge
- Hover: Light gray background
- Active: Darker gray background
- Badge: Blue circle with white text (count)

### Modal States

**Loading State:**
```
┌─────────────────────────────────────────┐
│  Create New SDM                         │
├─────────────────────────────────────────┤
│                                         │
│             ⟳ Creating...               │
│                                         │
└─────────────────────────────────────────┘
```

**Empty State (List):**
```
┌─────────────────────────────────────────┐
│  System Design Models (0)               │
├─────────────────────────────────────────┤
│                                         │
│      No SDMs yet.                       │
│      Click [+] to create one.           │
│                                         │
└─────────────────────────────────────────┘
```

## Color Scheme

- **Primary Action**: Blue (#3b82f6)
- **Background**: White (#ffffff)
- **Border**: Gray (#d1d5db)
- **Text**: Dark Gray (#374151)
- **Hover**: Light Gray (#f3f4f6)
- **Selected**: Blue background (#eff6ff)
- **Badge**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)

## Responsive Behavior

### Desktop (>1024px)
- Buttons: Normal size (40px height)
- Modal: 400px width, centered
- List: Max 500px height, scrollable

### Tablet (768px - 1024px)
- Same as desktop
- Modal: 90% width max

### Mobile (<768px)
- Buttons: Slightly smaller
- Modal: Full width with padding
- List: Full height scrollable

## Keyboard Shortcuts

Currently none implemented, but could add:
- `Ctrl+N` - Create new SDM
- `Ctrl+L` - Open SDM list
- `Ctrl+S` - Manual save
- `Esc` - Close modals

## Accessibility Features

Consider adding:
- ARIA labels for buttons
- Focus management in modals
- Keyboard navigation in list
- Screen reader announcements
- High contrast mode support
