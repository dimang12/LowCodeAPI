import { Edit, Copy, CopyPlus, Trash2, Play } from 'lucide-react';

export const contextMenuConfig = [
  {
    action: 'edit',
    label: 'Edit',
    icon: <Edit size={18} />,
    divider: false,
    danger: false
  },
  {
    action: 'copy',
    label: 'Copy',
    icon: <Copy size={18} />,
    divider: false,
    danger: false
  },
  {
    action: 'duplicate',
    label: 'Duplicate',
    icon: <CopyPlus size={18} />,
    divider: false,
    danger: false
  },
  {
    action: 'runFromHere',
    label: 'Run From Here',
    icon: <Play size={18} />,
    divider: true,
    danger: false
  },
  {
    action: 'delete',
    label: 'Delete',
    icon: <Trash2 size={18} />,
    divider: false,
    danger: true
  }
];
