import {
  PlayIcon,
  Square3Stack3DIcon,
  CubeIcon,
  RectangleStackIcon,
  CursorArrowRaysIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

export const tools = [
  { id: 'select', name: 'Select', icon: CursorArrowRaysIcon },
  { id: 'start', name: 'Start', icon: PlayIcon, color: 'bg-green-500' },
  { id: 'process', name: 'Process', icon: RectangleStackIcon, color: 'bg-blue-500' },
  { id: 'decision', name: 'Decision', icon: Square3Stack3DIcon, color: 'bg-yellow-500' },
  { id: 'stop', name: 'Stop', icon: CubeIcon, color: 'bg-red-500' },
  { id: 'connect', name: 'Connect', icon: LinkIcon }
];
