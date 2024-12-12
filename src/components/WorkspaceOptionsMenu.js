import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import ImportIcon from '@mui/icons-material/Input';
import SaveAltIcon from '@mui/icons-material/SaveAltSharp';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import WorkspaceExport from '../containers/WorkspaceExport';
import WorkspaceImport from '../containers/WorkspaceImport';
import WorkspaceContext from '../contexts/WorkspaceContext';
import { PluginHook } from './PluginHook';

/**
 * WorkspaceOptionsMenu ~ the menu for workspace options such as import/export
*/
export function WorkspaceOptionsMenu({
  anchorEl = null, handleClose, open = false, t,
}) {
  const container = useContext(WorkspaceContext);
  const [selectedOption, setSelectedOption] = useState(null);

  const pluginProps = {
    anchorEl, container, handleClose, open, t,
  };

  /** */
  const handleClick = (option) => {
    setSelectedOption(option);
    handleClose();
  };

  /** */
  const handleDialogClose = () => {
    setSelectedOption(null);
  };

  return (
    <>
      <Menu
        id="workspace-options-menu"
        container={container?.current}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        transformOrigin={{
          horizontal: 'left',
          vertical: 'top',
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          aria-haspopup="true"
          onClick={() => { handleClick('exportWorkspace'); }}
          aria-owns={selectedOption === 'exportWorkspace' ? 'workspace-export' : undefined}
        >
          <ListItemIcon>
            <SaveAltIcon />
          </ListItemIcon>
          <Typography variant="body1">{t('downloadExportWorkspace')}</Typography>
        </MenuItem>
        <MenuItem
          aria-haspopup="true"
          id="workspace-menu-import"
          onClick={() => { handleClick('importWorkspace'); }}
          aria-owns={selectedOption === 'importWorkspace' ? 'workspace-import' : undefined}
        >
          <ListItemIcon>
            <ImportIcon />
          </ListItemIcon>
          <Typography variant="body1">{t('importWorkspace')}</Typography>
        </MenuItem>
        <PluginHook targetName="WorkspaceOptionsMenu" {...pluginProps} />
      </Menu>
      {selectedOption === 'exportWorkspace' && (
        <WorkspaceExport
          open={selectedOption === 'exportWorkspace'}
          container={container?.current}
          handleClose={handleDialogClose}
        />
      )}
      {selectedOption === 'importWorkspace' && (
        <WorkspaceImport
          open={selectedOption === 'importWorkspace'}
          container={container?.current}
          handleClose={handleDialogClose}
        />
      )}
    </>
  );
}

WorkspaceOptionsMenu.propTypes = {
  anchorEl: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  t: PropTypes.func.isRequired,
};
