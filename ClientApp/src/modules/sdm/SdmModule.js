import { useState } from 'react';
import DiagramCanvas from './components/DiagramCanvas';
import { tools } from './config/tools';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SdmModule = () => {
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState('select');

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
        <DiagramCanvas selectedTool={selectedTool} />
      </div>
    </div>
  );
};

export default SdmModule;