import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import ContextMenu from '../../../components/widgets/ContextMenu';
import { contextMenuConfig } from '../../../config/contextMenuConfig';
import SdmManager from './SdmManager';
import TabularDataGrid from './TabularDataGrid';
import { ElementDragHandler } from '../handlers/ElementDragHandler';
import { CanvasDrawHandler } from '../handlers/CanvasDrawHandler';
import { createConnectionPath, updateConnectionsDuringDrag } from '../utils/connectionHelpers';
import { createNewElement } from '../utils/elementHelpers';
import { createGridPattern, createCircleMarker, applyBackgroundGrid, setupZoomBehavior } from '../utils/svgHelpers';
import { sdmApi } from '../services/sdmApi';
import { sdmExecuteApi } from '../services/sdmExecuteApi';
import { 
  CONNECTION_STYLES, 
  ELEMENT_COLORS, 
  ELEMENT_STROKE, 
  HIGHLIGHT_STYLES,
  RESIZE_HANDLE_STYLES,
  TEXT_STYLES,
  TRANSITION_SETTINGS
} from '../config/diagramStyles';

const DiagramCanvas = ({ selectedTool = 'select', currentSdmId: propSdmId, onSdmChange, onNodeClick, onNodeUpdate, isDrawerOpen = false }) => {
  const svgRef = useRef(null);
  const selectedToolRef = useRef(selectedTool);
  const selectedElementsRef = useRef([]);
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [history, setHistory] = useState([{ elements: [], connections: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [currentSdmId, setCurrentSdmId] = useState(propSdmId || null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeExecutionResults, setNodeExecutionResults] = useState({}); // Store results by nodeId
  const [selectedNodeResult, setSelectedNodeResult] = useState(null);
  const [previewPanelHeight, setPreviewPanelHeight] = useState(500); // Default height
  const [isResizingPanel, setIsResizingPanel] = useState(false);
  const resizeStartY = useRef(null);
  const resizeStartHeight = useRef(null);

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
    
    // Auto-save to database if SDM is active
    if (currentSdmId) {
      sdmApi.saveState(currentSdmId, newElements, newConnections).catch(error => {
        console.error('Failed to save SDM state:', error);
      });
    }
  }, [historyIndex, currentSdmId]);

  // Handle panel resizing
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizingPanel(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = previewPanelHeight;
  }, [previewPanelHeight]);

  const handleResizeMove = useCallback((e) => {
    if (!isResizingPanel) return;
    const deltaY = resizeStartY.current - e.clientY;
    const newHeight = Math.max(200, Math.min(window.innerHeight * 0.7, resizeStartHeight.current + deltaY));
    setPreviewPanelHeight(newHeight);
  }, [isResizingPanel]);

  const handleResizeEnd = useCallback(() => {
    setIsResizingPanel(false);
  }, []);

  useEffect(() => {
    if (isResizingPanel) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizingPanel, handleResizeMove, handleResizeEnd]);

  // Handle SDM change (switching between SDMs)
  const handleSdmChange = useCallback(async (sdmId) => {
    try {
      const sdmData = await sdmApi.getById(sdmId);
      console.log('📦 Loaded SDM data:', sdmData);
      console.log('📝 Elements with labels:', sdmData.elements.map(el => ({ 
        id: el.id, 
        type: el.type,
        label: el.label, 
        externalLabel: el.externalLabel,
        config: el.config
      })));
      setCurrentSdmId(sdmId);
      setElements(sdmData.elements || []);
      setConnections(sdmData.connections || []);
      setSelectedElements([]);
      setSelectedConnection(null);
      setHistory([{ elements: sdmData.elements || [], connections: sdmData.connections || [] }]);
      setHistoryIndex(0);
      setIsLoaded(true);
      
      // Call parent handler to update URL
      if (onSdmChange) {
        onSdmChange(sdmId);
      }
    } catch (error) {
      console.error('Failed to load SDM:', error);
    }
  }, [onSdmChange]);

  // Load SDM on mount if propSdmId is provided
  useEffect(() => {
    if (propSdmId && !isLoaded) {
      handleSdmChange(propSdmId);
    }
  }, [propSdmId, isLoaded, handleSdmChange]);

  // Handle propSdmId changes after initial load
  useEffect(() => {
    if (propSdmId && isLoaded && propSdmId !== currentSdmId) {
      handleSdmChange(propSdmId);
    }
  }, [propSdmId, currentSdmId, isLoaded, handleSdmChange]);

  // Handle save (used by SdmManager)
  const handleSave = useCallback(async () => {
    if (currentSdmId) {
      try {
        await sdmApi.saveState(currentSdmId, elements, connections);
        console.log('Saved SDM successfully');
      } catch (error) {
        console.error('Failed to save SDM:', error);
      }
    }
  }, [currentSdmId, elements, connections]);

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

  // Update element
  const updateElement = useCallback((elementId, updates) => {
    const updatedElements = elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    setElements(updatedElements);
    saveToHistory(updatedElements, connections);
  }, [elements, connections, saveToHistory]);

  // Expose updateElement to parent
  useEffect(() => {
    if (onNodeUpdate) {
      window.sdmUpdateElement = updateElement;
    }
  }, [updateElement, onNodeUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore keyboard shortcuts if user is typing in an input/textarea
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      );

      // Ctrl/Cmd + C: Copy
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && !isTyping) {
        event.preventDefault();
        copyElements();
      }
      // Ctrl/Cmd + V: Paste
      if ((event.ctrlKey || event.metaKey) && event.key === 'v' && !isTyping) {
        event.preventDefault();
        pasteElements();
      }
      // Delete or Backspace: Delete (only if not typing in input)
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isTyping) {
        event.preventDefault();
        deleteSelected();
      }
      // Ctrl/Cmd + Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey && !isTyping) {
        event.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((event.ctrlKey || event.metaKey) && ((event.shiftKey && event.key === 'z') || event.key === 'y') && !isTyping) {
        event.preventDefault();
        redo();
      }
      // Ctrl/Cmd + A: Select all (allow in inputs, but prevent default only if not typing)
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !isTyping) {
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

    // Preserve current zoom transform before clearing
    const currentTransform = d3.zoomTransform(svg.node());

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

    // Restore the zoom transform
    mainGroup.attr('transform', currentTransform);

    // Create groups for connections and elements (connections behind elements)
    const connectionsGroup = mainGroup.append('g').attr('class', 'connections');
    const elementsGroup = mainGroup.append('g').attr('class', 'elements');

    // Setup zoom behavior
    const { zoomIn, zoomOut, resetZoom, cleanup } = setupZoomBehavior(svg, mainGroup, setZoomLevel, currentTransform, selectedToolRef);

    // Store zoom functions for external access
    svg.node().zoomIn = zoomIn;
    svg.node().zoomOut = zoomOut;
    svg.node().resetZoom = resetZoom;
    svg.node().cleanupZoom = cleanup;

    // Draw connections
    connections.forEach((conn) => {
      const fromElement = elements.find((e) => e.id === conn.from);
      const toElement = elements.find((e) => e.id === conn.to);

      if (fromElement && toElement) {
        const isSelected = selectedConnection?.from === conn.from && selectedConnection?.to === conn.to;
        
        const path = connectionsGroup
          .append('path')
          .attr('class', 'connection')
          .attr('data-from', conn.from)
          .attr('data-to', conn.to)
          .attr('stroke', isSelected ? '#3b82f6' : CONNECTION_STYLES.stroke)
          .attr('stroke-width', isSelected ? CONNECTION_STYLES.strokeWidth + 2 : CONNECTION_STYLES.strokeWidth)
          .attr('fill', 'none')
          .attr('marker-end', 'url(#circlemarker)')
          .style('cursor', 'pointer')
          .on('click', function(event) {
            event.stopPropagation();
            if (selectedToolRef.current === 'select') {
              setSelectedConnection({ from: conn.from, to: conn.to });
              setSelectedElements([]);
            }
          });

        const pathData = createConnectionPath(fromElement, toElement);
        path.attr('d', pathData);

        // Add connection label at midpoint
        const midX = (fromElement.x + fromElement.width + toElement.x) / 2;
        const midY = (fromElement.y + fromElement.height / 2 + toElement.y + toElement.height / 2) / 2;
        
        connectionsGroup
          .append('text')
          .attr('class', 'connection-label')
          .attr('data-from', conn.from)
          .attr('data-to', conn.to)
          .attr('x', midX)
          .attr('y', midY - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '11px')
          .attr('fill', '#6b7280')
          .attr('cursor', 'text')
          .style('background', 'white')
          .text(conn.label || '')
          .on('dblclick', function(event) {
            event.stopPropagation();
            // TODO: Add connection edit handler
          });
      }
    });

    // Draw temp connection if connecting
    if (tempConnection) {
      const path = connectionsGroup
        .append('path')
        .attr('class', 'temp-connection')
        .attr('stroke', CONNECTION_STYLES.tempStroke)
        .attr('stroke-width', CONNECTION_STYLES.tempStrokeWidth)
        .attr('stroke-dasharray', CONNECTION_STYLES.tempDashArray)
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
          // Show context menu regardless of selected tool
          setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            elementId: element.id
          });
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
        .attr('stroke', connecting === element.id ? HIGHLIGHT_STYLES.connecting.borderColor : HIGHLIGHT_STYLES.hover.borderColor)
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
            .attr('fill', element.type === 'start' ? ELEMENT_COLORS.start : ELEMENT_COLORS.stop)
            .attr('stroke', ELEMENT_STROKE.default.color)
            .attr('stroke-width', ELEMENT_STROKE.default.width);
          break;
        case 'process':
          shapeElement = elementGroup
            .append('rect')
            .attr('class', 'shape')
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('fill', element.color || ELEMENT_COLORS.process)
            .attr('stroke', ELEMENT_STROKE.default.color)
            .attr('stroke-width', ELEMENT_STROKE.default.width);
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
            .attr('fill', ELEMENT_COLORS.decision)
            .attr('stroke', ELEMENT_STROKE.default.color)
            .attr('stroke-width', ELEMENT_STROKE.default.width);
          break;
        case 'dataTemplate':
          shapeElement = elementGroup
            .append('rect')
            .attr('class', 'shape')
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', ELEMENT_COLORS.dataTemplate)
            .attr('stroke', ELEMENT_STROKE.default.color)
            .attr('stroke-width', ELEMENT_STROKE.default.width);
          break;
        default:
          shapeElement = elementGroup
            .append('rect')
            .attr('class', 'shape')
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('fill', ELEMENT_COLORS.default)
            .attr('stroke', ELEMENT_STROKE.default.color)
            .attr('stroke-width', ELEMENT_STROKE.default.width);
          break;
      }

      // Draw text inside node
      elementGroup
        .append('text')
        .attr('class', 'label-inside')
        .attr('x', element.width / 2)
        .attr('y', element.height / 2)
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', TEXT_STYLES.fontSize)
        .attr('font-weight', TEXT_STYLES.fontWeight)
        .attr('fill', TEXT_STYLES.color)
        .text(element.label || element.type);

      // Draw external label below node
      elementGroup
        .append('text')
        .attr('class', 'label-external')
        .attr('x', element.width / 2)
        .attr('y', element.height + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#6b7280')
        .attr('cursor', 'text')
        .text(element.externalLabel || '')
        .on('dblclick', function(event) {
          event.stopPropagation();
          if (onNodeClick) {
            onNodeClick(element);
          }
        });

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
          .attr('x', pos.x - RESIZE_HANDLE_STYLES.size / 2)
          .attr('y', pos.y - RESIZE_HANDLE_STYLES.size / 2)
          .attr('width', RESIZE_HANDLE_STYLES.size)
          .attr('height', RESIZE_HANDLE_STYLES.size)
          .attr('fill', RESIZE_HANDLE_STYLES.fill)
          .attr('stroke', RESIZE_HANDLE_STYLES.stroke)
          .attr('stroke-width', RESIZE_HANDLE_STYLES.strokeWidth)
          .attr('rx', RESIZE_HANDLE_STYLES.borderRadius)
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
            hoverBorder.transition().duration(TRANSITION_SETTINGS.duration.short).attr('opacity', 1);
            resizeHandles.transition().duration(TRANSITION_SETTINGS.duration.short).attr('opacity', 1).attr('pointer-events', 'all');
            shapeElement.transition().duration(TRANSITION_SETTINGS.duration.short).attr('stroke', ELEMENT_STROKE.hover.color).attr('stroke-width', ELEMENT_STROKE.hover.width);
          }
        })
        .on('mouseleave', function() {
          if (selectedToolRef.current === 'select') {
            const elementId = parseFloat(elementGroup.attr('data-id'));
            const isElementSelected = selectedElementsRef.current.includes(elementId);
            // Only hide if element is not selected
            if (!isElementSelected) {
              hoverBorder.transition().duration(TRANSITION_SETTINGS.duration.short).attr('opacity', 0);
              resizeHandles.transition().duration(TRANSITION_SETTINGS.duration.short).attr('opacity', 0).attr('pointer-events', 'none');
              shapeElement.transition().duration(TRANSITION_SETTINGS.duration.short).attr('stroke', ELEMENT_STROKE.default.color).attr('stroke-width', ELEMENT_STROKE.default.width);
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
      selectedElements,
      setDragging,
      setElements,
      setConnections,
      setConnecting,
      setTempConnection,
      setSelectedElements,
      saveToHistory,
      updateConnections: (elementIdOrPositions, newX, newY) => {
        updateConnectionsDuringDrag(svg, connections, elements, elementIdOrPositions, newX, newY);
      },
      mainGroup,
      onNodeClick
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

    // Setup selection box drag behavior for select tool
    // Apply to background rectangles only to avoid conflict with draw behavior
    let selectionBoxElement = null;
    let selectionStartX = null;
    let selectionStartY = null;
    
    const selectionDrag = d3.drag()
      .filter(function(event) {
        // Only allow in select mode
        if (selectedToolRef.current !== 'select') return false;
        // Don't allow on elements
        if (event.target.closest('.element')) return false;
        // Don't allow when Cmd/Ctrl is pressed (reserved for canvas panning)
        if (event.metaKey || event.ctrlKey) return false;
        return event.button === 0; // Left mouse button only
      })
      .on('start', function(event) {
        const [x, y] = d3.pointer(event, mainGroup.node());
        selectionStartX = x;
        selectionStartY = y;
        
        // Remove any existing selection box visual
        mainGroup.selectAll('.selection-box-display').remove();
        
        // Create temporary selection box for dragging
        selectionBoxElement = mainGroup.append('rect')
          .attr('class', 'selection-box-temp')
          .attr('x', x)
          .attr('y', y)
          .attr('width', 0)
          .attr('height', 0)
          .attr('fill', 'rgba(59, 130, 246, 0.1)')
          .attr('stroke', '#3b82f6')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('pointer-events', 'none');
      })
      .on('drag', function(event) {
        if (!selectionBoxElement) return;
        
        const [currentX, currentY] = d3.pointer(event, mainGroup.node());
        const x = Math.min(selectionStartX, currentX);
        const y = Math.min(selectionStartY, currentY);
        const width = Math.abs(currentX - selectionStartX);
        const height = Math.abs(currentY - selectionStartY);
        
        selectionBoxElement
          .attr('x', x)
          .attr('y', y)
          .attr('width', width)
          .attr('height', height);
        
        // Update selection box state for intersection check
        setSelectionBox({ x, y, width, height });
      })
      .on('end', function() {
        if (selectionBoxElement) {
          const box = {
            x: parseFloat(selectionBoxElement.attr('x')),
            y: parseFloat(selectionBoxElement.attr('y')),
            width: parseFloat(selectionBoxElement.attr('width')),
            height: parseFloat(selectionBoxElement.attr('height'))
          };
          
          // Find elements that intersect with selection box
          const selectedIds = elements.filter(elem => {
            const elemRight = elem.x + elem.width;
            const elemBottom = elem.y + elem.height;
            const boxRight = box.x + box.width;
            const boxBottom = box.y + box.height;
            
            // Check if rectangles intersect
            return !(elem.x > boxRight || 
                    elemRight < box.x || 
                    elem.y > boxBottom || 
                    elemBottom < box.y);
          }).map(e => e.id);
          
          setSelectedElements(selectedIds);
          
          // Convert temporary box to persistent display box if there are selected elements
          if (selectedIds.length > 0) {
            // Remove temporary box
            selectionBoxElement.remove();
            
            // Save selection box dimensions in state so it persists across re-renders
            setSelectionBox(box);
          } else {
            // No elements selected, just remove the box
            selectionBoxElement.remove();
            setSelectionBox(null);
          }
          
          selectionBoxElement = null;
        }
      });
    
    // Apply selection drag only to background rectangles, not the entire SVG
    svg.selectAll('rect[fill="url(#grid)"], rect[fill="#ffffff"]').call(selectionDrag);

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
      const isBackgroundClick = event.target === svgRef.current || 
                                (event.target.tagName === 'rect' && event.target.getAttribute('fill') === 'url(#grid)');
      const isSelectionBoxClick = event.target.classList?.contains('selection-box-display');
      
      // Only clear if clicking on background (not on elements or selection box)
      if (isBackgroundClick && !isSelectionBoxClick) {
        if (selectedToolRef.current === 'select') {
          setSelectedElements([]);
          setSelectedConnection(null);
          // Remove selection box display
          mainGroup.selectAll('.selection-box-display').remove();
        }
      }
    });

    return () => {
      svg.on('click', null);
      svg.on('mousemove', null);
      // Cleanup zoom event listeners
      if (svg.node()?.cleanupZoom) {
        svg.node().cleanupZoom();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, connections, connecting, tempConnection, selectedConnection, addElement, saveToHistory]);

  // Separate useEffect to handle tool changes
  useEffect(() => {
    if (selectedTool !== 'connect') {
      setConnecting(null);
      setTempConnection(null);
    }
    
    // Update cursor style based on tool
    const svg = d3.select(svgRef.current);
    let cursor;
    if (selectedTool === 'connect') {
      cursor = connecting ? 'crosshair' : 'pointer';
    } else if (selectedTool !== 'select') {
      cursor = 'crosshair';
    } else {
      cursor = 'default';
    }
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
  }, [selectedTool, connecting, dragging, zoomLevel]);

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
          .attr('stroke', HIGHLIGHT_STYLES.connecting.borderColor)
          .attr('opacity', 1);
      } else {
        hoverBorder
          .attr('stroke', HIGHLIGHT_STYLES.hover.borderColor)
          .attr('opacity', 0);
      }
    });
  }, [connecting]);

  // Render persistent selection box with drag behavior
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const mainGroup = svg.select('.main-group');
    
    // Remove any existing selection boxes
    mainGroup.selectAll('.selection-box-display').remove();
    
    // Create selection box if we have box dimensions and multiple selected elements
    if (selectionBox && selectedElements.length > 1) {
      const displayBox = mainGroup.append('rect')
        .attr('class', 'selection-box-display')
        .attr('x', selectionBox.x)
        .attr('y', selectionBox.y)
        .attr('width', selectionBox.width)
        .attr('height', selectionBox.height)
        .attr('fill', 'rgba(59, 130, 246, 0.05)')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('cursor', 'move')
        .style('pointer-events', 'all') // Allow dragging
        .lower(); // Place behind elements
      
      // Add drag behavior to move all selected elements together
      let boxDragStartX, boxDragStartY;
      let elementsStartPositions = [];
      
      const boxDrag = d3.drag()
        .on('start', function(event) {
          [boxDragStartX, boxDragStartY] = d3.pointer(event, mainGroup.node());
          
          // Store start positions of all selected elements
          elementsStartPositions = selectedElements.map(id => {
            const elem = elements.find(e => e.id === id);
            return { id, x: elem.x, y: elem.y };
          });
          
          displayBox.attr('stroke-width', 3).style('cursor', 'grabbing');
        })
        .on('drag', function(event) {
          const [currentX, currentY] = d3.pointer(event, mainGroup.node());
          const dx = currentX - boxDragStartX;
          const dy = currentY - boxDragStartY;
          
          // Update box position
          const newBoxX = selectionBox.x + dx;
          const newBoxY = selectionBox.y + dy;
          displayBox.attr('x', newBoxX).attr('y', newBoxY);
          
          // Build position map for all selected elements
          const positionMap = {};
          
          // Update all selected elements positions
          elementsStartPositions.forEach(({ id, x, y }) => {
            const newX = x + dx;
            const newY = y + dy;
            
            positionMap[id] = { x: newX, y: newY };
            
            const elemGroup = svg.select(`.element[data-id="${id}"]`);
            if (!elemGroup.empty()) {
              elemGroup.attr('transform', `translate(${newX}, ${newY})`);
            }
          });
          
          // Update all connections once with all positions
          updateConnectionsDuringDrag(svg, connections, elements, positionMap);
        })
        .on('end', function(event) {
          const [currentX, currentY] = d3.pointer(event, mainGroup.node());
          const dx = currentX - boxDragStartX;
          const dy = currentY - boxDragStartY;
          
          displayBox.attr('stroke-width', 2).style('cursor', 'move');
          
          // Save final positions
          const updatedElements = elements.map((e) => {
            if (selectedElements.includes(e.id)) {
              const startPos = elementsStartPositions.find(p => p.id === e.id);
              return { ...e, x: startPos.x + dx, y: startPos.y + dy };
            }
            return e;
          });
          
          setElements(updatedElements);
          saveToHistory(updatedElements, connections);
          
          // Update box stored position
          setSelectionBox({
            x: selectionBox.x + dx,
            y: selectionBox.y + dy,
            width: selectionBox.width,
            height: selectionBox.height
          });
        });
      
      displayBox.call(boxDrag);
    }
  }, [selectionBox, selectedElements, elements, connections, saveToHistory]);

  // Update visual state when selection changes
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Clear selection box state if selection is cleared
    if (selectedElements.length === 0) {
      setSelectionBox(null);
    }
    
    // Update all elements based on selection state
    svg.selectAll('.element').each(function() {
      const element = d3.select(this);
      const elementId = parseFloat(element.attr('data-id'));
      const isSelected = selectedElements.includes(elementId);
      
      const hoverBorder = element.select('.hover-border');
      const resizeHandles = element.select('.resize-handles');
      const shapeElement = element.select('.shape');
      
      if (isSelected) {
        // Show selection indicators
        hoverBorder.attr('opacity', 1).attr('stroke', HIGHLIGHT_STYLES.selected.borderColor);
        resizeHandles.attr('opacity', 1).attr('pointer-events', 'all');
        shapeElement.attr('stroke', ELEMENT_STROKE.selected.color).attr('stroke-width', ELEMENT_STROKE.selected.width);
      } else {
        // Hide selection indicators (unless hovering)
        hoverBorder.attr('opacity', 0);
        resizeHandles.attr('opacity', 0).attr('pointer-events', 'none');
        shapeElement.attr('stroke', ELEMENT_STROKE.default.color).attr('stroke-width', ELEMENT_STROKE.default.width);
      }
    });
  }, [selectedElements]);

  // Visualize execution results
  useEffect(() => {
    if (!executionResults) return;

    const svg = d3.select(svgRef.current);
    
    // Update element borders based on execution results
    svg.selectAll('.element').each(function() {
      const element = d3.select(this);
      const elementId = element.attr('data-id');
      const shapeElement = element.select('ellipse, rect, polygon, path');
      
      // Find this node's execution result
      const nodeResult = executionResults.nodeResults?.find(r => r.nodeId === elementId);
      
      if (nodeResult) {
        if (nodeResult.success) {
          // Green border for success
          shapeElement
            .attr('stroke', '#10b981')
            .attr('stroke-width', 3);
        } else {
          // Red border for failure
          shapeElement
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 3);
        }
      } else {
        // Reset to default if not executed
        shapeElement
          .attr('stroke', ELEMENT_STROKE.default.color)
          .attr('stroke-width', ELEMENT_STROKE.default.width);
      }
    });
  }, [executionResults]);

  // Update selected node result when selection changes
  useEffect(() => {
    if (selectedElements.length === 1 && nodeExecutionResults[selectedElements[0]]) {
      setSelectedNodeResult(nodeExecutionResults[selectedElements[0]]);
    } else {
      setSelectedNodeResult(null);
    }
  }, [selectedElements, nodeExecutionResults]);

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
      const elementId = contextMenu.elementId;
      const updatedElements = elements.filter(e => e.id !== elementId);
      const updatedConnections = connections.filter(c =>
        c.from !== elementId && c.to !== elementId
      );
      
      setElements(updatedElements);
      setConnections(updatedConnections);
      setSelectedElements([]);
      saveToHistory(updatedElements, updatedConnections);
      console.log('Deleted element:', elementId);
    }
  }, [contextMenu, elements, connections, saveToHistory]);

  const handleRunFromStart = useCallback(async () => {
    if (!currentSdmId) {
      console.error('No SDM loaded');
      return;
    }

    setIsExecuting(true);
    setExecutionResults(null);

    try {
      const result = await sdmExecuteApi.runFromStart(currentSdmId);
      setExecutionResults(result);
      
      // Store results for each node
      const resultsMap = {};
      result.nodeResults?.forEach(nodeResult => {
        resultsMap[nodeResult.nodeId] = nodeResult;
      });
      setNodeExecutionResults(resultsMap);
      
      console.log('Execution completed:', result);
    } catch (error) {
      console.error('Execution failed:', error);
      setExecutionResults({
        success: false,
        message: error.response?.data?.message || error.message,
        nodeResults: []
      });
    } finally {
      setIsExecuting(false);
    }
  }, [currentSdmId]);

  const handleRunFromNode = useCallback(async (nodeId) => {
    if (!currentSdmId) {
      console.error('No SDM loaded');
      return;
    }

    setIsExecuting(true);
    setExecutionResults(null);

    try {
      const result = await sdmExecuteApi.runFromNode(currentSdmId, nodeId);
      setExecutionResults(result);
      
      // Store results for each node
      const resultsMap = {};
      result.nodeResults?.forEach(nodeResult => {
        resultsMap[nodeResult.nodeId] = nodeResult;
      });
      setNodeExecutionResults(resultsMap);
      
      // Show the result for the node that was executed
      if (result.nodeResults && result.nodeResults.length > 0) {
        const targetNodeResult = result.nodeResults.find(nr => nr.nodeId === nodeId);
        if (targetNodeResult) {
          setSelectedNodeResult(targetNodeResult);
        }
      }
      
      console.log('Execution completed from node:', result);
    } catch (error) {
      console.error('Execution failed:', error);
      setExecutionResults({
        success: false,
        message: error.response?.data?.message || error.message,
        nodeResults: []
      });
    } finally {
      setIsExecuting(false);
    }
  }, [currentSdmId]);

  const handleMenuItemClick = useCallback((action) => {
    switch(action) {
      case 'edit':
        handleContextMenuEdit();
        break;
      case 'copy':
        handleContextMenuCopy();
        break;
      case 'duplicate':
        handleContextMenuDuplicate();
        break;
      case 'delete':
        handleContextMenuDelete();
        break;
      case 'runFromHere':
        if (contextMenu?.elementId) {
          handleRunFromNode(contextMenu.elementId);
        }
        break;
      default:
        break;
    }
  }, [handleContextMenuEdit, handleContextMenuCopy, handleContextMenuDuplicate, handleContextMenuDelete, handleRunFromNode, contextMenu]);

  return (
    <div className="relative h-full w-full bg-gray-50">
      {/* SDM Manager */}
      <SdmManager
        currentSdmId={currentSdmId}
        onSdmChange={handleSdmChange}
        onSave={handleSave}
      />

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

      {/* Execution Controls */}
      <div className="absolute bottom-24 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <button
          onClick={handleRunFromStart}
          disabled={isExecuting || !currentSdmId}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Run from Start"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {isExecuting ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* Selected Node Execution Results Panel */}
      {selectedNodeResult && (
        <div 
          className="absolute rounded-lg bottom-5 left-12 bg-white/95 backdrop-blur-sm border-t-2 border-gray-200 shadow-lg flex flex-col" 
          style={{ 
            height: `${previewPanelHeight}px`,
            right: isDrawerOpen ? '535px' : '0', // Leave space for drawer (max-w-lg = 32rem = 512px)
            transition: isResizingPanel ? 'none' : 'right 0.3s ease-in-out',
          }}
        >
          {/* Resize Handle */}
          <div 
            className="w-full h-2  rounded-t-md bg-gray-300 hover:bg-blue-500 cursor-ns-resize transition-colors"
            onMouseDown={handleResizeStart}
            style={{ flexShrink: 0 }}
          />
          
          <div className="flex-1 overflow-hidden flex flex-col p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3 flex-shrink-0">
              <h3 className="font-semibold text-lg">
                {selectedNodeResult.success ? (
                  <span className="text-green-600">✓ {selectedNodeResult.nodeLabel}</span>
                ) : (
                  <span className="text-red-600">✗ {selectedNodeResult.nodeLabel}</span>
                )}
              </h3>
              <button
                onClick={() => setSelectedNodeResult(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mb-3 flex-shrink-0">Execution time: {selectedNodeResult.executionTimeMs}ms</div>
            
            {selectedNodeResult.error && (
              <div className="mb-3 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm flex-shrink-0">
                {selectedNodeResult.error}
              </div>
            )}
            
            {selectedNodeResult.outputData && (() => {
              // Check if output is tabular data
              const isTabular = selectedNodeResult.outputData?.outputType === 'tabular' && 
                                Array.isArray(selectedNodeResult.outputData?.transformedData) &&
                                selectedNodeResult.outputData.transformedData.length > 0;

              return (
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  {isTabular ? (
                    <div className="flex-1 overflow-hidden min-h-0">
                      <TabularDataGrid 
                        data={selectedNodeResult.outputData.transformedData}
                        title="Formatted Data Preview"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto">
                      <div className="text-xs font-semibold text-gray-600 mb-2">Output Data</div>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedNodeResult.outputData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

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
      <ContextMenu
        anchorEl={contextMenu}
        open={Boolean(contextMenu)}
        onClose={() => setContextMenu(null)}
        menuItems={contextMenuConfig}
        onMenuItemClick={handleMenuItemClick}
      />
    </div>
  );
};

export default DiagramCanvas;

