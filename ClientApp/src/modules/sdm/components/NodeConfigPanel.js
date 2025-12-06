import {
  StartNodeConfig,
  StopNodeConfig,
  ProcessNodeConfig,
  DecisionNodeConfig,
  DataTemplateNodeConfig
} from './nodes';

const NodeConfigPanel = ({ node, onUpdate }) => {
  // Render the appropriate node configuration component
  const renderNodeConfig = () => {
    switch (node.type) {
      case 'start':
        return <StartNodeConfig node={node} onUpdate={onUpdate} />;
      
      case 'stop':
        return <StopNodeConfig node={node} onUpdate={onUpdate} />;
      
      case 'process':
        return <ProcessNodeConfig node={node} onUpdate={onUpdate} />;
      
      case 'decision':
        return <DecisionNodeConfig node={node} onUpdate={onUpdate} />;
      
      case 'dataTemplate':
        return <DataTemplateNodeConfig node={node} onUpdate={onUpdate} />;
      
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            No configuration available for this node type: {node.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Node Type Badge */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100/60 text-gray-800 backdrop-blur-sm">
            {node.type}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          ID: {node.id}
        </div>
      </div>

      {/* Node-specific Configuration */}
      {renderNodeConfig()}
    </div>
  );
};

export default NodeConfigPanel;
