import * as d3 from 'd3';
import { DRAG_CONFIG } from '../config/diagramStyles';
import { updateConnectionsDuringDrag } from '../utils/connectionHelpers';

/**
 * Drag behavior handler for diagram elements
 */
export class ElementDragHandler {
  constructor(options) {
    this.selectedToolRef = options.selectedToolRef;
    this.elements = options.elements;
    this.connections = options.connections;
    this.connecting = options.connecting;
    this.selectedElements = options.selectedElements;
    this.setDragging = options.setDragging;
    this.setElements = options.setElements;
    this.setConnections = options.setConnections;
    this.setConnecting = options.setConnecting;
    this.setTempConnection = options.setTempConnection;
    this.setSelectedElements = options.setSelectedElements;
    this.saveToHistory = options.saveToHistory;
    this.updateConnections = options.updateConnections;
    this.mainGroup = options.mainGroup;
    this.onNodeClick = options.onNodeClick;
    
    // Drag state
    this.dragStartClientX = null;
    this.dragStartClientY = null;
    this.hasMoved = false;
    this.dragStartPointerX = null;
    this.dragStartPointerY = null;
    this.elementStartX = null;
    this.elementStartY = null;
    this.selectedElementsStartPositions = null;
  }

  /**
   * Creates and returns the D3 drag behavior
   */
  createDragBehavior() {
    return d3.drag()
      .filter((event) => {
        const tool = this.selectedToolRef.current;
        return tool === 'select' || tool === 'connect';
      })
      .on('start', (event) => this.handleDragStart(event))
      .on('drag', (event) => this.handleDrag(event))
      .on('end', (event) => this.handleDragEnd(event));
  }

  /**
   * Handles drag start event
   */
  handleDragStart(event) {
    const element = d3.select(event.sourceEvent.target.closest('.element'));
    const elementId = element.attr('data-id');
    
    if (!elementId) return;
    
    const id = parseFloat(elementId);
    const currentTool = this.selectedToolRef.current;
    
    // Handle connect tool
    if (currentTool === 'connect') {
      event.sourceEvent.stopPropagation();
      this.handleConnectMode(id);
      return;
    }
    
    // For select tool - prepare for drag or click
    const elem = this.elements.find(e => e.id === id);
    
    if (elem) {
      this.elementStartX = elem.x;
      this.elementStartY = elem.y;
      this.dragStartClientX = event.sourceEvent.clientX;
      this.dragStartClientY = event.sourceEvent.clientY;
      
      const [x, y] = d3.pointer(event, this.mainGroup.node());
      this.dragStartPointerX = x;
      this.dragStartPointerY = y;
      
      // Store start positions for all selected elements
      if (this.selectedElements.includes(id)) {
        this.selectedElementsStartPositions = this.selectedElements.map(selId => {
          const selElem = this.elements.find(e => e.id === selId);
          return {
            id: selId,
            startX: selElem.x,
            startY: selElem.y
          };
        });
      } else {
        this.selectedElementsStartPositions = null;
      }
      
      this.hasMoved = false;
    }
  }

  /**
   * Handles connection mode logic
   */
  handleConnectMode(id) {
    if (this.connecting) {
      if (this.connecting !== id) {
        const isDuplicate = this.connections.some(
          c => c.from === this.connecting && c.to === id
        );
        if (!isDuplicate) {
          const newConnections = [
            ...this.connections,
            { id: Date.now(), from: this.connecting, to: id },
          ];
          this.setConnections(newConnections);
          this.saveToHistory(this.elements, newConnections);
        }
      }
      this.setConnecting(null);
      this.setTempConnection(null);
    } else {
      this.setConnecting(id);
    }
  }

  /**
   * Handles drag event
   */
  handleDrag(event) {
    console.log('handleDrag called');
    const targetElement = event.sourceEvent.target.closest('.element');
    if (!targetElement) return;
    
    const element = d3.select(targetElement);
    const elementId = element.attr('data-id');
    
    if (!elementId) return;
    
    const id = parseFloat(elementId);
    const [currentX, currentY] = d3.pointer(event, this.mainGroup.node());
    
    console.log('handleDrag processing element:', id, 'hasMoved:', this.hasMoved);
    
    if (!this.hasMoved) {
      const totalDx = Math.abs(event.sourceEvent.clientX - this.dragStartClientX);
      const totalDy = Math.abs(event.sourceEvent.clientY - this.dragStartClientY);
      
      if (totalDx > DRAG_CONFIG.threshold || totalDy > DRAG_CONFIG.threshold) {
        this.hasMoved = true;
        this.setDragging(id);
        this.updateElementPosition(element, currentX, currentY, id);
      }
    } else {
      this.updateElementPosition(element, currentX, currentY, id);
    }
  }

  /**
   * Updates element position during drag
   */
  updateElementPosition(element, currentX, currentY, id) {
    console.log('updateElementPosition called for element:', id);
    const pointerDx = currentX - this.dragStartPointerX;
    const pointerDy = currentY - this.dragStartPointerY;
    
    // If dragging a selected element, move all selected elements
    if (this.selectedElementsStartPositions) {
      const svg = d3.select(this.mainGroup.node().ownerSVGElement);
      const positionMap = {};
      
      this.selectedElementsStartPositions.forEach(({ id: elemId, startX, startY }) => {
        const newX = startX + pointerDx;
        const newY = startY + pointerDy;
        
        positionMap[elemId] = { x: newX, y: newY };
        
        const elemGroup = svg.select(`.element[data-id="${elemId}"]`);
        if (!elemGroup.empty()) {
          elemGroup.attr('transform', `translate(${newX}, ${newY})`);
        }
      });
      
      // Update all connections once with all positions
      this.updateConnections(positionMap);
    } else {
      // Single element drag
      const newX = this.elementStartX + pointerDx;
      const newY = this.elementStartY + pointerDy;
      
      element.attr('transform', `translate(${newX}, ${newY})`);
      this.updateConnections(id, newX, newY);
    }
  }

  /**
   * Handles drag end event
   */
  handleDragEnd(event) {
    // In connect mode, handleDragStart returns early, so nothing to do here
    if (this.selectedToolRef.current === 'connect') {
      return;
    }
    
    const targetElement = event.sourceEvent.target.closest('.element');
    if (!targetElement) return;
    
    const element = d3.select(targetElement);
    const elementId = element.attr('data-id');
    
    if (!elementId) return;
    
    if (this.hasMoved) {
      this.saveFinalPosition(element, parseFloat(elementId));
    } else if (this.selectedToolRef.current === 'select') {
      this.handleClick(event, parseFloat(elementId));
    }
  }

  /**
   * Saves final position after drag
   */
  saveFinalPosition(element, id) {
    this.setDragging(null);
    
    // If multiple elements were dragged, update all of them
    if (this.selectedElementsStartPositions) {
      const svg = d3.select(this.mainGroup.node().ownerSVGElement);
      const updates = {};
      
      this.selectedElementsStartPositions.forEach(({ id: elemId }) => {
        const elemGroup = svg.select(`.element[data-id="${elemId}"]`);
        if (!elemGroup.empty()) {
          const transform = elemGroup.attr('transform');
          const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
          if (match) {
            updates[elemId] = {
              x: parseFloat(match[1]),
              y: parseFloat(match[2])
            };
          }
        }
      });
      
      this.setElements((prev) => {
        const updated = prev.map((e) => 
          updates[e.id] ? { ...e, x: updates[e.id].x, y: updates[e.id].y } : e
        );
        this.saveToHistory(updated, this.connections);
        return updated;
      });
    } else {
      // Single element drag
      const transform = element.attr('transform');
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      
      if (match) {
        const finalX = parseFloat(match[1]);
        const finalY = parseFloat(match[2]);
        
        this.setElements((prev) => {
          const updated = prev.map((e) => 
            e.id === id ? { ...e, x: finalX, y: finalY } : e
          );
          this.saveToHistory(updated, this.connections);
          return updated;
        });
      }
    }
  }

  /**
   * Handles click (when drag didn't move)
   */
  handleClick(event, id) {
    if (event.sourceEvent.ctrlKey || event.sourceEvent.metaKey) {
      this.setSelectedElements(prev =>
        prev.includes(id)
          ? prev.filter(eid => eid !== id)
          : [...prev, id]
      );
    } else {
      this.setSelectedElements([id]);
      
      // Trigger node click callback if provided
      if (this.onNodeClick) {
        const clickedElement = this.elements.find(e => e.id === id);
        if (clickedElement) {
          this.onNodeClick(clickedElement);
        }
      }
    }
  }
}
