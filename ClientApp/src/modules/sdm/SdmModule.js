import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DiagramCanvas from './components/DiagramCanvas';
import { Drawer } from '../../components/widgets';
import { tools } from './config/tools';
import NodeConfigPanel from './components/NodeConfigPanel';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SdmModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState('select');
  const [currentSdmId, setCurrentSdmId] = useState(id ? parseInt(id) : null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Update currentSdmId when URL param changes
  useEffect(() => {
    if (id) {
      setCurrentSdmId(parseInt(id));
    }
  }, [id]);

  const handleSdmChange = (newSdmId) => {
    setCurrentSdmId(newSdmId);
    navigate(`/sdm/${newSdmId}`);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedNode(null);
  };

  const handleNodeUpdate = (updatedNode) => {
    // Update the node in the diagram
    if (window.sdmUpdateElement) {
      window.sdmUpdateElement(updatedNode.id, updatedNode);
    }
    // Update selected node to reflect changes
    setSelectedNode(updatedNode);
  };

  return (
    <div className="flex h-full w-full flex-row bg-white px-1">
      {/* Toolbar */}
      <div className="flex items-center flex-col w-10 gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex flex-col h-full gap-1 rounded-2xl border border-gray-300 bg-gray-50 p-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setSelectedTool(tool.id)}
              className={classNames(
                selectedTool === tool.id
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
                'rounded-xl p-2 transition'
              )}
              title={tool.name}
            >
              <tool.icon className="size-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
        <DiagramCanvas 
          selectedTool={selectedTool} 
          currentSdmId={currentSdmId}
          onSdmChange={handleSdmChange}
          onNodeClick={handleNodeClick}
          onNodeUpdate={handleNodeUpdate}
          isDrawerOpen={isDrawerOpen}
        />
      </div>

      {/* Configuration Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        title={selectedNode ? `Configure ${selectedNode.type} Node` : 'Node Configuration'}
        width="max-w-lg"
      >
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
          />
        )}
      </Drawer>
    </div>
  );
};

export default SdmModule;