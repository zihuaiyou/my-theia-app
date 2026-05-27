/**
 * Context menu components for the file tree widget.
 */

import * as React from '@theia/core/shared/react';
import { useEffect } from '@theia/core/shared/react';
import { ContextMenuProps, BlankContextMenuProps } from './types';
import { FolderIcon, FileIcon, SwitchWorkspaceIcon, RefreshIcon } from './icons';

/**
 * Base styles for context menus.
 */
const contextMenuStyles: React.CSSProperties = {
    position: 'fixed',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '4px 0',
    zIndex: 1000
};

/**
 * Base styles for context menu buttons.
 */
const menuButtonStyles: React.CSSProperties = {
    width: '100%',
    textAlign: 'left',
    padding: '6px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '13px'
};

/**
 * ContextMenu - Right-click menu for file/folder nodes.
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    node,
    onAddFolder,
    onAddFile,
    onDelete,
    onClose
}) => {
    useEffect(() => {
        const handleClick = () => onClose();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [onClose]);

    const handleFolderClick = () => {
        const parentUri = node.type === 'folder' ? node.uri : (node.parentId || '');
        onAddFolder(parentUri);
        onClose();
    };

    const handleFileClick = () => {
        const parentUri = node.type === 'folder' ? node.uri : (node.parentId || '');
        onAddFile(parentUri);
        onClose();
    };

    return (
        <div style={{ ...contextMenuStyles, left: x, top: y, minWidth: '160px' }}>
            <button onClick={handleFolderClick} style={menuButtonStyles}>
                <FolderIcon /> 新建文件夹
            </button>
            <button onClick={handleFileClick} style={menuButtonStyles}>
                <FileIcon /> 新建文件
            </button>
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <button
                onClick={() => { onDelete(node.uri, node.type === 'folder'); onClose(); }}
                style={{ ...menuButtonStyles, color: '#d93026' }}
            >
                🗑️ 删除
            </button>
        </div>
    );
};

/**
 * BlankContextMenu - Right-click menu for blank area in file tree.
 */
export const BlankContextMenu: React.FC<BlankContextMenuProps> = ({
    x,
    y,
    onSwitchWorkspace,
    onNewFolder,
    onNewFile,
    onRefresh,
    onClose
}) => {
    useEffect(() => {
        const handleClick = () => onClose();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [onClose]);

    return (
        <div style={{ ...contextMenuStyles, left: x, top: y, minWidth: '180px' }}>
            <button
                onClick={onSwitchWorkspace}
                style={{ ...menuButtonStyles, display: 'flex', alignItems: 'center' }}
            >
                <SwitchWorkspaceIcon />
                切换工作区
            </button>
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <button
                onClick={onNewFolder}
                style={{ ...menuButtonStyles, display: 'flex', alignItems: 'center' }}
            >
                <FolderIcon />
                新建文件夹
            </button>
            <button
                onClick={onNewFile}
                style={{ ...menuButtonStyles, display: 'flex', alignItems: 'center' }}
            >
                <FileIcon />
                新建文件
            </button>
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
            <button
                onClick={onRefresh}
                style={{ ...menuButtonStyles, display: 'flex', alignItems: 'center' }}
            >
                <RefreshIcon />
                刷新
            </button>
        </div>
    );
};
