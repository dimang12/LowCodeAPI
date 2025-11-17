import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import ContextMenu from './ContextMenu';
import { ElementDragHandler } from '../handlers/ElementDragHandler';
import { CanvasDrawHandler } from '../handlers/CanvasDrawHandler';
import { createConnectionPath, updateConnectionsDuringDrag } from '../utils/connectionHelpers';
import { createNewElement } from '../utils/elementHelpers';
import { createGridPattern, createCircleMarker, applyBackgroundGrid, setupZoomBehavior } from '../utils/svgHelpers';

const DiagramCanvas = ({ selectedTool = 'select' }) => {
  const svgRef = useRef(null);
  const selectedToolRef = useRef(selectedTool);
  const selectedElementsRef = useRef([]);
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [history, setHistory] = useState([{ elements: [], connections: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [contextMenu, setContextMenu] = useState(null);

  // Keep refs in sync with state
  useEffect(() => {
    selectedToolRef.current = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    selectedElementsRef.current = selectedElements;
  }, [selectedElements]);

  // Save to history
  const saveToHistory = useCallback((newElements, newConnections) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ elements: newElements, connections: newConnections });
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Copy selected elements
  const copyElements = useCallback(() => {
    const elementsToCopy = elements.filter(e => selectedElements.includes(e.id));
    const connectionsToCopy = connections.filter(c =>
      selectedElements.includes(c.from) && selectedElements.includes(c.to)
    );
    setClipboard({ elements: elementsToCopy, connections: connectionsToCopy });
    console.log('Copied', elementsToCopy.length, 'elements');
  }, [elements, connections, selectedElements]);

  // Paste elements
  const pasteElements = useCallback(() => {
    if (!clipboard || !clipboard.elements.length) return;

    const idMap = {};
    const newElements = clipboard.elements.map(elem => {
      const newId = Date.now() + Math.random();
      idMap[elem.id] = newId;
      return {
        ...elem,
        id: newId,
        x: elem.x + 50,
        y: elem.y + 50
      };
    });

    const newConnections = clipboard.connections.map(conn => ({
      ...conn,
      id: Date.now() + Math.random(),
      from: idMap[conn.from],
      to: idMap[conn.to]
    }));

    const updatedElements = [...elements, ...newElements];
    const updatedConnections = [...connections, ...newConnections];
    setElements(updatedElements);
    setConnections(updatedConnections);
    setSelectedElements(newElements.map(e => e.id));
    saveToHistory(updatedElements, updatedConnections);
    console.log('Pasted', newElements.length, 'elements');
  }, [clipboard, elements, connections, saveToHistory]);

  // Delete selected elements
  const deleteSelected = useCallback(() => {
    if (selectedElements.length === 0) return;

    const updatedElements = elements.filter(e => !selectedElements.includes(e.id));
    const updatedConnections = connections.filter(c =>
      !selectedElements.includes(c.from) && !selectedElements.includes(c.to)
    );

    setElements(updatedElements);
    setConnections(updatedConnections);
    setSelectedElements([]);
    saveToHistory(updatedElements, updatedConnections);
    console.log('Deleted', selectedElements.length, 'elements');
  }, [elements, connections, selectedElements, saveToHistory]);

  // Add element
  const addElement = useCallback((type, x, y, width, height) => {
    const newElement = createNewElement(type, x, y, width, height);
    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    saveToHistory(updatedElements, connections);
  }, [elements, connections, saveToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + C: Copy
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copyElements();
      }
      // Ctrl/Cmd + V: Paste
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        pasteElements();
      }
      // Delete or Backspace: Delete
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
      }
      // Ctrl/Cmd + Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((event.ctrlKey || event.metaKey) && ((event.shiftKey && event.key === 'z') || event.key === 'y')) {
        event.preventDefault();
        redo();
      }
      // Ctrl/Cmd + A: Select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        setSelectedElements(elements.map(e => e.id));
      }
      // Escape: Deselect all / Cancel connection
      if (event.key === 'Escape') {
        setSelectedElements([]);
        setConnecting(null);
        setTempConnection(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copyElements, pasteElements, deleteSelected, undo, redo, elements]);

  // Initialize D3 diagram
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll('*').remove();

    // Setup SVG definitions and patterns
    const defs = svg.append('defs');
    createGridPattern(defs);
    createCircleMarker(defs);

    // Apply background with grid
    applyBackgroundGrid(svg);

    // Create a main group for zoom/pan transformations
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Create groups for connections and elements (connections behind elements)
    const connectionsGroup = mainGroup.append('g').attr('class', 'connections');
    const elementsGroup = mainGroup.append('g').attr('class', 'elements');

    // Setup zoom behavior
    const { zoomIn, zoomOut, resetZoom } = setupZoomBehavior(svg, mainGroup, setZoomLevel);

    // Store zoom functions for external access
    svg.node().zoomIn = zoomIn;
    svg.node().zoomOut = zoomOut;
    svg.node().resetZoom = resetZoom;

    // Draw connections
    connections.forEach((conn) => {
      const fromElement = elements.find((e) => e.id === conn.from);
      const toElement = elements.find((e) => e.id === conn.to);

      if (fromElement && toElement) {
        const path = connectionsGroup
          .append('path')
          .attr('class', 'connection')
          .attr('data-from', conn.from)
          .attr('data-to', conn.to)
          .attr('stroke', '#6b7280')
          .attr('stroke-width', 4)
          .attr('fill', 'none')
          .attr('marker-end', 'url(#circlemarker)');

        const pathData = createConnectionPath(fromElement, toElement);
        path.attr('d', pathData);
      }
    });

    // Draw temp connection if connecting
    if (tempConnection) {
      const path = connectionsGroup
        .append('path')
        .attr('class', 'temp-connection')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('fill', 'none');

      const fromElement = elements.find((e) => e.id === tempConnection.from);
      if (fromElement) {
        const pathData = createConnectionPath(
          fromElement,
          tempConnection.to
        );
        path.attr('d', pathData);
      }
    }

    // Draw elements
    elements.forEach((element) => {
      const elementGroup = elementsGroup
        .append('g')
        .attr('class', 'element')
        .attr('data-id', element.id)
        .attr('transform', `translate(${element.x}, ${element.y})`)
        .style('cursor', selectedTool === 'select' ? (dragging === element.id ? 'grabbing' : 'grab') : selectedTool === 'connect' ? 'pointer' : 'default')
        .on('contextmenu', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (selectedTool === 'select') {
            setContextMenu({
              x: event.clientX,
              y: event.clientY,
              elementId: element.id
            });
          }
        });

      // Create hover highlight border (hidden by default, shown on hover or selection)
      const hoverBorder = elementGroup
        .append('rect')
        .attr('class', 'hover-border')
        .attr('x', -5)
        .attr('y', -5)
        .attr('width', element.width + 10)
        .attr('height', element.height + 10)
        .attr('rx', element.type === 'start' || element.type === 'stop' ? 25 : 5)
        .attr('fill', 'none')
        .attr('stroke', connecting === element.id ? '#10b981' : '#3b82f6')
        .attr('stroke-width', 3)
        .attr('opacity', connecting === element.id ? 1 : 0)
        .attr('pointer-events', 'none');

      // Draw shape based on type
      let shapeElement;
      switch (element.type) {
        case 'start':
        case 'stop':
          shapeElement = elementGroup
            .append('rect')
            .attr('class', 'shape')
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('rx', 20)
            .attr('ry', 20)
            .attr('fill', element.type === 'start' ? '#10b981' : '#ef4444')
            .attr('stroke', '#000')
            .attr('stroke-width', 2);
          break;
        case 'process':
          shapeElement = elementGroup
            .append('rect')
            .attr('class', 'shape')
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('fill', element.color || '#60a5fa')
            .attr('stroke', '#000')
            .attr('stroke-width', 2);
          break;
        case 'decision':
          const points = [
            [element.width / 2, 0],
            [element.width, element.height / 2],
            [element.width / 2, element.height],
            [0, element.height / 2],
          ];
          shapeElement = elementGroup
            .append('polygon')
            .attr('class', 'shape')
            .attr('points', points.map((p) => p.join(',')).join(' '))
            .attr('fill', '#fbbf24')
            .attr('stroke', '#000')
            .attr('stroke-width', 2);
          break;
        default:
          shapeElement = elementGroup
            .append('rect')
            .attr('class', 'shape')
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('fill', '#e5e7eb')
            .attr('stroke', '#000')
            .attr('stroke-width', 2);
          break;
      }

      // Draw text
      elementGroup
        .append('text')
        .attr('class', 'label')
        .attr('x', element.width / 2)
        .attr('y', element.height / 2)
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#000')
        .text(element.label || element.type);

      // Create resize handles group (hidden by default, shown on hover or selection)
      const resizeHandles = elementGroup
        .append('g')
        .attr('class', 'resize-handles')
        .attr('opacity', 0)
        .attr('pointer-events', 'none');

      // Add 8 resize handles (corners and edges)
      const handlePositions = [
        { x: 0, y: 0, cursor: 'nw-resize', name: 'nw' },
        { x: element.width / 2, y: 0, cursor: 'n-resize', name: 'n' },
        { x: element.width, y: 0, cursor: 'ne-resize', name: 'ne' },
        { x: element.width, y: element.height / 2, cursor: 'e-resize', name: 'e' },
        { x: element.width, y: element.height, cursor: 'se-resize', name: 'se' },
        { x: element.width / 2, y: element.height, cursor: 's-resize', name: 's' },
        { x: 0, y: element.height, cursor: 'sw-resize', name: 'sw' },
        { x: 0, y: element.height / 2, cursor: 'w-resize', name: 'w' }
      ];

      handlePositions.forEach(pos => {
        const handle = resizeHandles
          .append('rect')
          .attr('class', `resize-handle resize-handle-${pos.name}`)
          .attr('x', pos.x - 4)
          .attr('y', pos.y - 4)
          .attr('width', 8)
          .attr('height', 8)
          .attr('fill', '#fff')
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 2)
          .attr('rx', 1)
          .style('cursor', pos.cursor)
          .attr('pointer-events', 'all');

        // Add resize drag behavior
        let startMouseX, startMouseY;
        
        const resizeDrag = d3.drag()
          .on('start', function(event) {
            event.sourceEvent.stopPropagation();
            // Store the actual screen coordinates at start
            startMouseX = event.sourceEvent.clientX;
            startMouseY = event.sourceEvent.clientY;
          })
          .on('drag', function(event) {
            // Calculate delta from the original start position using screen coordinates
            const currentMouseX = event.sourceEvent.clientX;
            const currentMouseY = event.sourceEvent.clientY;
            
            // Get current zoom transform
            const transform = d3.zoomTransform(svg.node());
            const scale = transform.k;
            
            const actualDx = (currentMouseX - startMouseX) / scale;
            const actualDy = (currentMouseY - startMouseY) / scale;
            
            // Update start position for next drag event
            startMouseX = currentMouseX;
            startMouseY = currentMouseY;

            const elementId = parseFloat(elementGroup.attr('data-id'));
            
            setElements((prev) =>
              prev.map((e) => {
                if (e.id === elementId) {
                  let newWidth = e.width;
                  let newHeight = e.height;
                  let newX = e.x;
                  let newY = e.y;

                  // Calculate new dimensions based on actual incremental drag distance
                  if (pos.name.includes('e')) {
                    newWidth = Math.max(50, newWidth + actualDx);
                  }
                  if (pos.name.includes('w')) {
                    const oldWidth = newWidth;
                    newWidth = Math.max(50, newWidth - actualDx);
                    // Only move position if width actually changed
                    if (newWidth !== oldWidth) {
                      newX = newX + actualDx;
                    }
                  }
                  if (pos.name.includes('s')) {
                    newHeight = Math.max(30, newHeight + actualDy);
                  }
                  if (pos.name.includes('n')) {
                    const oldHeight = newHeight;
                    newHeight = Math.max(30, newHeight - actualDy);
                    // Only move position if height actually changed
                    if (newHeight !== oldHeight) {
                      newY = newY + actualDy;
                    }
                  }

                  return { ...e, width: newWidth, height: newHeight, x: newX, y: newY };
                }
                return e;
              })
            );
          })
          .on('end', function() {
            setElements((prev) => {
              saveToHistory(prev, connections);
              return prev;
            });
          });

        handle.call(resizeDrag);
      });

      // Add hover effects (only change appearance if not already selected)
      elementGroup
        .on('mouseenter', function() {
          if (selectedToolRef.current === 'select') {
            hoverBorder.transition().duration(150).attr('opacity', 1);
            resizeHandles.transition().duration(150).attr('opacity', 1).attr('pointer-events', 'all');
            shapeElement.transition().duration(150).attr('stroke', '#3b82f6').attr('stroke-width', 3);
          }
        })
        .on('mouseleave', function() {
          if (selectedToolRef.current === 'select') {
            const elementId = parseFloat(elementGroup.attr('data-id'));
            const isElementSelected = selectedElementsRef.current.includes(elementId);
            // Only hide if element is not selected
            if (!isElementSelected) {
              hoverBorder.transition().duration(150).attr('opacity', 0);
              resizeHandles.transition().duration(150).attr('opacity', 0).attr('pointer-events', 'none');
              shapeElement.transition().duration(150).attr('stroke', '#000').attr('stroke-width', 2);
            }
          }
        });
    });

    // Setup drag handler for elements using handler class
    const dragHandlerInstance = new ElementDragHandler({
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
      updateConnections: (elementId, newX, newY) => {
        updateConnectionsDuringDrag(svg, connections, elements, elementId, newX, newY);
      },
      mainGroup
    });

    const dragBehavior = dragHandlerInstance.createDragBehavior();
    svg.selectAll('.element').call(dragBehavior);

    // Setup draw handler for creating new elements using handler class
    const drawHandlerInstance = new CanvasDrawHandler({
      selectedToolRef,
      mainGroup,
      addElement
    });

    const drawBehavior = drawHandlerInstance.createDrawBehavior();
    svg.call(drawBehavior);

    // Handle temp connection while dragging
    if (connecting && selectedToolRef.current === 'connect') {
      svg.on('mousemove', (event) => {
        const fromElement = elements.find((e) => e.id === connecting);
        if (fromElement) {
          const [x, y] = d3.pointer(event);
          setTempConnection({ from: connecting, to: { x, y } });
        }
      });
    }

    // Add click handler on canvas to clear selection
    svg.on('click', (event) => {
      // Only clear if clicking directly on SVG (not on elements)
      if (event.target === svgRef.current || (event.target.tagName === 'rect' && event.target.getAttribute('fill') === 'url(#grid)')) {
        if (selectedToolRef.current === 'select') {
          setSelectedElements([]);
        }
      }
    });

    return () => {
      svg.on('click', null);
      svg.on('mousemove', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, connections, connecting, tempConnection, addElement, saveToHistory]);

  // Separate useEffect to handle tool changes
  useEffect(() => {
    if (selectedTool !== 'connect') {
      setConnecting(null);
      setTempConnection(null);
    }
    
    // Update cursor style based on tool
    const svg = d3.select(svgRef.current);
    const cursor = selectedTool === 'connect' ? (connecting ? 'crosshair' : 'pointer') : 
                   selectedTool !== 'select' ? 'crosshair' : 'default';
    svg.style('cursor', cursor);
    
    // Update element cursors
    svg.selectAll('.element').style('cursor', function() {
      const elementId = parseFloat(d3.select(this).attr('data-id'));
      if (selectedTool === 'select') {
        return dragging === elementId ? 'grabbing' : 'grab';
      } else if (selectedTool === 'connect') {
        return 'pointer';
      }
      return 'default';
    });
  }, [selectedTool, connecting, dragging]);

  // Update border color when connecting state changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Update all hover borders based on connecting state
    svg.selectAll('.element').each(function() {
      const element = d3.select(this);
      const elementId = parseFloat(element.attr('data-id'));
      const hoverBorder = element.select('.hover-border');
      
      if (connecting === elementId) {
        hoverBorder
          .attr('stroke', '#10b981')
          .attr('opacity', 1);
      } else {
        hoverBorder
          .attr('stroke', '#3b82f6')
          .attr('opacity', 0);
      }
    });
  }, [connecting]);

  // Update visual state when selection changes
  useEffect(() => {
    console.log('Selection effect running, selectedElements:', selectedElements);
    const svg = d3.select(svgRef.current);
    
    // Update all elements based on selection state
    svg.selectAll('.element').each(function() {
      const element = d3.select(this);
      const elementId = parseFloat(element.attr('data-id'));
      const isSelected = selectedElements.includes(elementId);
      
      console.log(`Element ${elementId} isSelected:`, isSelected);
      
      const hoverBorder = element.select('.hover-border');
      const resizeHandles = element.select('.resize-handles');
      const shapeElement = element.select('.shape');
      
      if (isSelected) {
        console.log(`Showing selection for element ${elementId}`);
        // Show selection indicators
        hoverBorder.attr('opacity', 1).attr('stroke', '#3b82f6');
        resizeHandles.attr('opacity', 1).attr('pointer-events', 'all');
        shapeElement.attr('stroke', '#3b82f6').attr('stroke-width', 3);
      } else {
        // Hide selection indicators (unless hovering)
        hoverBorder.attr('opacity', 0);
        resizeHandles.attr('opacity', 0).attr('pointer-events', 'none');
        shapeElement.attr('stroke', '#000').attr('stroke-width', 2);
      }
    });
  }, [selectedElements]);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    if (svgRef.current?.zoomIn) {
      svgRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current?.zoomOut) {
      svgRef.current.zoomOut();
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    if (svgRef.current?.resetZoom) {
      svgRef.current.resetZoom();
    }
  }, []);

  // Context menu handlers
  const handleContextMenuEdit = useCallback(() => {
    if (contextMenu) {
      const element = elements.find(e => e.id === contextMenu.elementId);
      if (element) {
        const newLabel = prompt('Edit label:', element.label);
        if (newLabel !== null && newLabel.trim() !== '') {
          const updatedElements = elements.map(e =>
            e.id === contextMenu.elementId ? { ...e, label: newLabel.trim() } : e
          );
          setElements(updatedElements);
          saveToHistory(updatedElements, connections);
        }
      }
    }
  }, [contextMenu, elements, connections, saveToHistory]);

  const handleContextMenuCopy = useCallback(() => {
    if (contextMenu) {
      setSelectedElements([contextMenu.elementId]);
      copyElements();
    }
  }, [contextMenu, copyElements]);

  const handleContextMenuDuplicate = useCallback(() => {
    if (contextMenu) {
      const element = elements.find(e => e.id === contextMenu.elementId);
      if (element) {
        const newElement = {
          ...element,
          id: Date.now() + Math.random(),
          x: element.x + 50,
          y: element.y + 50
        };
        const updatedElements = [...elements, newElement];
        setElements(updatedElements);
        saveToHistory(updatedElements, connections);
      }
    }
  }, [contextMenu, elements, connections, saveToHistory]);

  const handleContextMenuDelete = useCallback(() => {
    if (contextMenu) {
      setSelectedElements([contextMenu.elementId]);
      deleteSelected();
    }
  }, [contextMenu, deleteSelected]);

  return (
    <div className="relative h-full w-full bg-gray-50">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ 
          cursor: selectedTool === 'connect' ? (connecting ? 'crosshair' : 'pointer') : 
                  selectedTool !== 'select' ? 'crosshair' : 'default'
        }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In (Scroll Up)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 hover:bg-gray-100 rounded transition-colors text-xs font-medium"
          title="Reset Zoom"
        >
          {zoomLevel}%
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out (Scroll Down)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Info panel */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm space-y-1 text-gray-700 pointer-events-none">
        <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+C</kbd> Copy</div>
        <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+V</kbd> Paste</div>
        <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Del</kbd> Delete</div>
        <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Z</kbd> Undo</div>
        <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Y</kbd> Redo</div>
        <div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Wheel</kbd> Zoom</div>
        {selectedTool === 'connect' && !connecting && (
          <div className="mt-2 pt-2 border-t border-gray-300 text-green-600 font-medium">
            Click first node to start connection
          </div>
        )}
        {connecting && (
          <div className="mt-2 pt-2 border-t border-gray-300 text-blue-600 font-medium">
            Click target node to complete connection
          </div>
        )}
      </div>
      {/* Stats panel */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm text-gray-700 pointer-events-none">
        <div>Elements: {elements.length}</div>
        <div>Connections: {connections.length}</div>
        <div>Selected: {selectedElements.length}</div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEdit={handleContextMenuEdit}
          onCopy={handleContextMenuCopy}
          onDuplicate={handleContextMenuDuplicate}
          onDelete={handleContextMenuDelete}
        />
      )}
    </div>
  );
};

export default DiagramCanvas;

