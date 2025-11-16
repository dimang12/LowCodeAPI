import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	addEdge,
	useEdgesState,
	useNodesState,
	useReactFlow,
	ReactFlowProvider,
	MarkerType,
	Panel,
	Handle,
	Position
} from 'reactflow';
import 'reactflow/dist/style.css';

const id = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Custom node components with handles
const handleStyle = {
	width: '14px',
	height: '14px',
	background: '#3b82f6',
	border: '3px solid #fff',
	borderRadius: '50%',
	boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
	opacity: 1,
	zIndex: 10
};

const StartNode = ({ data }) => (
	<div style={{ 
		background: '#10b981', 
		borderRadius: '20px', 
		color: '#fff', 
		padding: '10px 20px', 
		border: '2px solid #000',
		fontSize: '14px',
		fontWeight: 'bold'
	}}>
		<Handle type="source" position={Position.Right} style={handleStyle} />
		{data.label}
	</div>
);

const StopNode = ({ data }) => (
	<div style={{ 
		background: '#ef4444', 
		borderRadius: '20px', 
		color: '#fff', 
		padding: '10px 20px', 
		border: '2px solid #000',
		fontSize: '14px',
		fontWeight: 'bold'
	}}>
		<Handle type="target" position={Position.Left} style={handleStyle} />
		{data.label}
	</div>
);

const ProcessNode = ({ data }) => (
	<div style={{ 
		background: '#60a5fa', 
		color: '#fff', 
		padding: '10px 20px', 
		border: '2px solid #000',
		fontSize: '14px',
		fontWeight: 'bold'
	}}>
		<Handle type="target" position={Position.Left} style={handleStyle} />
		<Handle type="source" position={Position.Right} style={handleStyle} />
		{data.label}
	</div>
);

const DecisionNode = ({ data }) => (
	<div style={{ 
		position: 'relative',
		width: 120,
		height: 120
	}}>
		<Handle type="target" position={Position.Left} style={handleStyle} />
		<Handle type="source" position={Position.Right} style={handleStyle} />
		<div style={{ 
			background: '#fbbf24',
			border: '2px solid #000',
			fontSize: '14px',
			fontWeight: 'bold',
			transform: 'rotate(45deg)',
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			position: 'absolute',
			top: 0,
			left: 0
		}}>
			<span>{data.label}</span>
		</div>
	</div>
);

const nodeTypes = {
	start: StartNode,
	stop: StopNode,
	process: ProcessNode,
	decision: DecisionNode
};

const getNodeForTool = (tool) => {
	switch (tool) {
		case 'start':
			return { 
				type: 'start', 
				data: { label: 'Start' }
			};
		case 'stop':
			return { 
				type: 'stop', 
				data: { label: 'Stop' }
			};
		case 'decision':
			return { 
				type: 'decision', 
				data: { label: 'Decision?' }
			};
		case 'process':
			return { 
				type: 'process', 
				data: { label: 'Process' }
			};
		default:
			return { 
				type: 'process', 
				data: { label: 'Node' }
			};
	}
};

// Add CSS for handles visibility
const customStyles = `
	.react-flow__handle {
		width: 14px !important;
		height: 14px !important;
		background: #3b82f6 !important;
		border: 3px solid #fff !important;
		box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
		opacity: 1 !important;
	}
	.react-flow__handle:hover {
		background: #2563eb !important;
	}
`;

const ReactFlowCanvasInner = ({ selectedTool = 'select' }) => {
	const initialNodes = useMemo(() => [
		{ 
			id: 'n1', 
			position: { x: 150, y: 100 }, 
			data: { label: 'Start' }, 
			type: 'start'
		},
		{ 
			id: 'n2', 
			position: { x: 450, y: 100 }, 
			data: { label: 'Process' },
			type: 'process'
		}
	], []);
	const initialEdges = useMemo(() => [
		{ 
			id: 'e1-2', 
			source: 'n1', 
			target: 'n2',
			markerEnd: { type: MarkerType.ArrowClosed },
			style: { strokeWidth: 2 }
		}
	], []);

	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNodes, setSelectedNodes] = useState([]);
	const [selectedEdges, setSelectedEdges] = useState([]);
	const [clipboard, setClipboard] = useState(null);
	const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges }]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const [connectingNodeId, setConnectingNodeId] = useState(null);
	const reactFlowInstance = useReactFlow();
	const canvasRef = useRef(null);

	// Save to history when nodes or edges change
	const saveToHistory = useCallback((newNodes, newEdges) => {
		setHistory(prev => {
			const newHistory = prev.slice(0, historyIndex + 1);
			newHistory.push({ nodes: newNodes, edges: newEdges });
			return newHistory.slice(-50); // Keep last 50 states
		});
		setHistoryIndex(prev => Math.min(prev + 1, 49));
	}, [historyIndex]);

	// Undo functionality
	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const prevState = history[historyIndex - 1];
			setNodes(prevState.nodes);
			setEdges(prevState.edges);
			setHistoryIndex(historyIndex - 1);
		}
	}, [history, historyIndex, setNodes, setEdges]);

	// Redo functionality
	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1];
			setNodes(nextState.nodes);
			setEdges(nextState.edges);
			setHistoryIndex(historyIndex + 1);
		}
	}, [history, historyIndex, setNodes, setEdges]);

	// Handle connection with validation
	const onConnect = useCallback((connection) => {
		// Validate connection (prevent self-loops, duplicate connections)
		if (connection.source === connection.target) {
			console.warn('Cannot connect node to itself');
			return;
		}

		const isDuplicate = edges.some(
			edge => edge.source === connection.source && edge.target === connection.target
		);

		if (isDuplicate) {
			console.warn('Connection already exists');
			return;
		}

		const newEdge = {
			...connection,
			id: `e${connection.source}-${connection.target}`,
			markerEnd: { type: MarkerType.ArrowClosed },
			style: { strokeWidth: 2 },
			animated: false
		};

		setEdges((eds) => {
			const updatedEdges = addEdge(newEdge, eds);
			saveToHistory(nodes, updatedEdges);
			return updatedEdges;
		});
	}, [edges, nodes, setEdges, saveToHistory]);

	// Handle pane click for adding new nodes
	const onPaneClick = useCallback((evt) => {
		if (selectedTool === 'select' || selectedTool === 'connect') {
			// Deselect all on canvas click
			setSelectedNodes([]);
			setSelectedEdges([]);
			return;
		}

		const bounds = evt.currentTarget.getBoundingClientRect();
		const position = reactFlowInstance.project({
			x: evt.clientX - bounds.left,
			y: evt.clientY - bounds.top,
		});

		const base = getNodeForTool(selectedTool);
		const newNode = { 
			id: id(), 
			position,
			...base,
			selected: false
		};

		setNodes((nds) => {
			const updatedNodes = nds.concat(newNode);
			saveToHistory(updatedNodes, edges);
			return updatedNodes;
		});
	}, [selectedTool, setNodes, reactFlowInstance, edges, saveToHistory]);

	// Handle node selection
	const onNodeClick = useCallback((event, node) => {
		if (selectedTool === 'connect') {
			if (connectingNodeId) {
				// Complete connection
				if (connectingNodeId !== node.id) {
					onConnect({ source: connectingNodeId, target: node.id });
				}
				setConnectingNodeId(null);
			} else {
				// Start connection
				setConnectingNodeId(node.id);
			}
		} else {
			// Handle selection with Ctrl/Cmd for multi-select
			if (event.ctrlKey || event.metaKey) {
				setSelectedNodes(prev => 
					prev.includes(node.id) 
						? prev.filter(id => id !== node.id)
						: [...prev, node.id]
				);
			} else {
				setSelectedNodes([node.id]);
			}
		}
	}, [selectedTool, connectingNodeId, onConnect]);

	// Handle selection change
	const onSelectionChange = useCallback(({ nodes: selectedNodes, edges: selectedEdges }) => {
		setSelectedNodes(selectedNodes.map(n => n.id));
		setSelectedEdges(selectedEdges.map(e => e.id));
	}, []);

	// Copy selected nodes
	const copyNodes = useCallback(() => {
		const nodesToCopy = nodes.filter(n => selectedNodes.includes(n.id));
		const edgesToCopy = edges.filter(e => 
			selectedNodes.includes(e.source) && selectedNodes.includes(e.target)
		);
		setClipboard({ nodes: nodesToCopy, edges: edgesToCopy });
		console.log('Copied', nodesToCopy.length, 'nodes');
	}, [nodes, edges, selectedNodes]);

	// Paste nodes
	const pasteNodes = useCallback(() => {
		if (!clipboard || !clipboard.nodes.length) return;

		const idMap = {};
		const newNodes = clipboard.nodes.map(node => {
			const newId = id();
			idMap[node.id] = newId;
			return {
				...node,
				id: newId,
				position: {
					x: node.position.x + 50,
					y: node.position.y + 50
				},
				selected: true
			};
		});

		const newEdges = clipboard.edges.map(edge => ({
			...edge,
			id: `e${idMap[edge.source]}-${idMap[edge.target]}`,
			source: idMap[edge.source],
			target: idMap[edge.target]
		}));

		setNodes((nds) => {
			const deselectedNodes = nds.map(n => ({ ...n, selected: false }));
			const updatedNodes = [...deselectedNodes, ...newNodes];
			saveToHistory(updatedNodes, [...edges, ...newEdges]);
			return updatedNodes;
		});
		setEdges((eds) => [...eds, ...newEdges]);
		setSelectedNodes(newNodes.map(n => n.id));
		console.log('Pasted', newNodes.length, 'nodes');
	}, [clipboard, edges, setNodes, setEdges, saveToHistory]);

	// Delete selected nodes
	const deleteSelected = useCallback(() => {
		if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

		setNodes((nds) => {
			const updatedNodes = nds.filter(n => !selectedNodes.includes(n.id));
			setEdges((eds) => {
				const updatedEdges = eds.filter(
					e => !selectedEdges.includes(e.id) && 
					!selectedNodes.includes(e.source) && 
					!selectedNodes.includes(e.target)
				);
				saveToHistory(updatedNodes, updatedEdges);
				return updatedEdges;
			});
			return updatedNodes;
		});

		setSelectedNodes([]);
		setSelectedEdges([]);
		console.log('Deleted', selectedNodes.length, 'nodes and', selectedEdges.length, 'edges');
	}, [selectedNodes, selectedEdges, setNodes, setEdges, saveToHistory]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Ctrl/Cmd + C: Copy
			if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
				event.preventDefault();
				copyNodes();
			}
			// Ctrl/Cmd + V: Paste
			if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
				event.preventDefault();
				pasteNodes();
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
				setSelectedNodes(nodes.map(n => n.id));
			}
			// Escape: Deselect all / Cancel connection
			if (event.key === 'Escape') {
				setSelectedNodes([]);
				setSelectedEdges([]);
				setConnectingNodeId(null);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [copyNodes, pasteNodes, deleteSelected, undo, redo, nodes]);

	// Update connecting state when tool changes
	useEffect(() => {
		if (selectedTool !== 'connect') {
			setConnectingNodeId(null);
		}
	}, [selectedTool]);

	// Apply selection styling
	const nodesWithSelection = useMemo(() => {
		return nodes.map(node => ({
			...node,
			selected: selectedNodes.includes(node.id),
			style: {
				...node.style,
				border: selectedNodes.includes(node.id) ? '3px solid #3b82f6' : node.style?.border || '2px solid #000',
				boxShadow: selectedNodes.includes(node.id) ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : undefined
			}
		}));
	}, [nodes, selectedNodes]);

	const edgesWithSelection = useMemo(() => {
		return edges.map(edge => ({
			...edge,
			selected: selectedEdges.includes(edge.id),
			style: {
				...edge.style,
				strokeWidth: selectedEdges.includes(edge.id) ? 3 : 2,
				stroke: selectedEdges.includes(edge.id) ? '#3b82f6' : '#6b7280'
			},
			animated: connectingNodeId === edge.source
		}));
	}, [edges, selectedEdges, connectingNodeId]);

	return (
		<div className="h-full w-full" ref={canvasRef}>
			<style>{customStyles}</style>
			<ReactFlow
				nodes={nodesWithSelection}
				edges={edgesWithSelection}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onPaneClick={onPaneClick}
				onNodeClick={onNodeClick}
				onSelectionChange={onSelectionChange}
				fitView
				selectNodesOnDrag={selectedTool === 'select'}
				panOnDrag={selectedTool === 'select'}
				nodesDraggable={selectedTool === 'select'}
				nodesConnectable={selectedTool === 'select' || selectedTool === 'connect'}
				elementsSelectable={selectedTool === 'select'}
				multiSelectionKeyCode="Control"
				deleteKeyCode="Delete"
				connectionMode="loose"
				style={{ cursor: selectedTool === 'connect' ? (connectingNodeId ? 'crosshair' : 'pointer') : 'default' }}
			>
				<MiniMap 
					nodeColor={(node) => {
						if (node.type === 'input') return '#10b981';
						if (node.type === 'output') return '#ef4444';
						return '#60a5fa';
					}}
				/>
				<Controls />
				<Background gap={20} color="#e5e7eb" />
				<Panel position="top-left" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-sm">
					<div className="space-y-1 text-gray-700">
						<div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+C</kbd> Copy</div>
						<div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+V</kbd> Paste</div>
						<div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Del</kbd> Delete</div>
						<div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Z</kbd> Undo</div>
						<div><kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl+Y</kbd> Redo</div>
						{connectingNodeId && (
							<div className="mt-2 pt-2 border-t border-gray-300 text-blue-600 font-medium">
								Click target node to connect
							</div>
						)}
					</div>
				</Panel>
				<Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
					<div className="text-sm text-gray-700">
						<div>Nodes: {nodes.length}</div>
						<div>Edges: {edges.length}</div>
						<div>Selected: {selectedNodes.length}</div>
					</div>
				</Panel>
			</ReactFlow>
		</div>
	);
};

const ReactFlowCanvas = (props) => (
	<ReactFlowProvider>
		<ReactFlowCanvasInner {...props} />
	</ReactFlowProvider>
);

export default ReactFlowCanvas;
