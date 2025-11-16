import { useState } from 'react';
import {
  PlayIcon,
  Square3Stack3DIcon,
  CubeIcon,
  RectangleStackIcon,
  CursorArrowRaysIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import DiagramCanvas from './components/DiagramCanvas';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SdmModule = () => {
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState('select');

  const tools = [
    { id: 'select', name: 'Select', icon: CursorArrowRaysIcon },
    { id: 'start', name: 'Start', icon: PlayIcon, color: 'bg-green-500' },
    { id: 'process', name: 'Process', icon: RectangleStackIcon, color: 'bg-blue-500' },
    { id: 'decision', name: 'Decision', icon: Square3Stack3DIcon, color: 'bg-yellow-500' },
    { id: 'stop', name: 'Stop', icon: CubeIcon, color: 'bg-red-500' },
    { id: 'connect', name: 'Connect', icon: LinkIcon }
  ];

  return (
    <div className="flex h-full w-full flex-row bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center flex-col w-10 gap-2 border-b border-gray-200 bg-white px-4 py-2 dark:border-white/10 dark:bg-gray-900">
        <div className="flex flex-col h-full gap-1 rounded-lg border border-gray-300 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-800">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setSelectedTool(tool.id)}
              className={classNames(
                selectedTool === tool.id
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                'rounded-md p-2 transition'
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
