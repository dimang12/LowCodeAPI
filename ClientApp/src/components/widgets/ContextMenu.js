import React from 'react';
import { Menu, MenuItem, MenuList, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Edit, Copy, CopyPlus, Trash2, Play } from 'lucide-react';

const ContextMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  menuItems = [],
  onMenuItemClick 
}) => {
  const handleItemClick = (action) => {
    onMenuItemClick?.(action);
    onClose();
  };

  // Don't render if we don't have valid position
  if (!anchorEl || anchorEl.mouseY === undefined || anchorEl.mouseX === undefined) {
    return null;
  }

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: anchorEl.mouseY, left: anchorEl.mouseX }}
      slotProps={{
        paper: {
          sx: {
            width: 200,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }
        }
      }}
    >
      <MenuList>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.action}>
            {item.divider && <Divider />}
            <MenuItem 
              onClick={() => handleItemClick(item.action)}
              sx={{
                color: item.danger ? 'error.main' : 'inherit',
                '&:hover': {
                  backgroundColor: item.danger ? 'error.lighter' : 'action.hover',
                }
              }}
            >
              <ListItemIcon sx={{ color: item.danger ? 'error.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          </React.Fragment>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ContextMenu;
