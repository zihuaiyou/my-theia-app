/**
 * Main file tree component for the file tree widget.
 */

import * as React from '@theia/core/shared/react';
import { FileTreeComponentProps } from './types';
import { useFileTree } from './use-file-tree';
import { TreeNodeComponent } from './tree-node';
import { ContextMenu, BlankContextMenu } from './context-menus';

/**
 * FileTreeComponent - Main component for displaying the file tree.
 */
export const FileTreeComponent: React.FC<FileTreeComponentProps> = ({
    fileService,
    workspaceService,
    fileDialogService
}) => {
    const {
        fileTree,
        expandedNodes,
        selectedNode,
        isLoading,
        contextMenu,
        setContextMenu,
        blankContextMenu,
        toggleNode,
        handleSelect,
        handleContextMenu,
        setBlankContextMenu,
        handleAddFolder,
        handleAddFile,
        handleDelete,
        handleSwitchWorkspace,
        handleToolbarAddFolder,
        handleToolbarAddFile,
        handleToolbarDelete,
        refreshTree
    } = useFileTree({ fileService, workspaceService, fileDialogService });

    /**
     * Handle creating a new folder from blank context menu.
     */
    const handleBlankNewFolder = async () => {
        const roots = await workspaceService.roots;
        if (roots.length > 0) {
            await handleAddFolder(roots[0].resource.toString());
        }
        setBlankContextMenu(null);
    };

    /**
     * Handle creating a new file from blank context menu.
     */
    const handleBlankNewFile = async () => {
        const roots = await workspaceService.roots;
        if (roots.length > 0) {
            await handleAddFile(roots[0].resource.toString());
        }
        setBlankContextMenu(null);
    };

    /**
     * Handle refresh from blank context menu.
     */
    const handleBlankRefresh = async () => {
        await refreshTree();
        setBlankContextMenu(null);
    };

    if (isLoading) {
        return (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '4px',
                padding: '8px',
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#fafafa'
            }}>
                <button onClick={refreshTree} title="刷新" style={toolbarButtonStyle}>
                    🔄
                </button>
                <button onClick={handleToolbarAddFolder} title="新建文件夹" style={toolbarButtonStyle}>
                    📁
                </button>
                <button onClick={handleToolbarAddFile} title="新建文件" style={toolbarButtonStyle}>
                    📄
                </button>
                <div style={{ flex: 1 }} />
                <button
                    onClick={handleToolbarDelete}
                    disabled={!selectedNode}
                    title="删除选中项"
                    style={{
                        ...toolbarButtonStyle,
                        cursor: selectedNode ? 'pointer' : 'not-allowed',
                        opacity: selectedNode ? 1 : 0.5
                    }}
                >
                    🗑️
                </button>
            </div>

            {/* Tree Content */}
            <div
                style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setBlankContextMenu({ x: e.clientX, y: e.clientY });
                }}
            >
                {fileTree.length === 0 ? (
                    <div style={{ padding: '16px', color: '#666', textAlign: 'center' }}>
                        No workspace opened or empty workspace
                    </div>
                ) : (
                    fileTree.map(node => (
                        <TreeNodeComponent
                            key={node.id}
                            node={node}
                            depth={0}
                            expandedNodes={expandedNodes}
                            selectedNode={selectedNode}
                            onToggle={toggleNode}
                            onSelect={handleSelect}
                            onContextMenu={handleContextMenu}
                        />
                    ))
                )}
            </div>

            {/* Context Menus */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    node={contextMenu.node}
                    onAddFolder={handleAddFolder}
                    onAddFile={handleAddFile}
                    onDelete={handleDelete}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {blankContextMenu && (
                <BlankContextMenu
                    x={blankContextMenu.x}
                    y={blankContextMenu.y}
                    onSwitchWorkspace={handleSwitchWorkspace}
                    onNewFolder={handleBlankNewFolder}
                    onNewFile={handleBlankNewFile}
                    onRefresh={handleBlankRefresh}
                    onClose={() => setBlankContextMenu(null)}
                />
            )}
        </div>
    );
};

/**
 * Toolbar button styles.
 */
const toolbarButtonStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px'
};
