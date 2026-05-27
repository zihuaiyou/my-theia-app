/**
 * Type definitions for the file tree widget.
 */

import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { FileDialogService } from '@theia/filesystem/lib/browser/file-dialog/file-dialog-service';

/**
 * Represents a node in the file tree.
 */
export interface FileTreeNode {
    id: string;
    name: string;
    type: 'folder' | 'file';
    children?: FileTreeNode[];
    parentId?: string;
    uri: string;
}

/**
 * Props for the FileTreeComponent.
 */
export interface FileTreeComponentProps {
    fileService: FileService;
    workspaceService: WorkspaceService;
    fileDialogService: FileDialogService;
}

/**
 * Props for the TreeNodeComponent.
 */
export interface TreeNodeProps {
    node: FileTreeNode;
    depth: number;
    expandedNodes: Set<string>;
    selectedNode: string | null;
    onToggle: (id: string) => void;
    onSelect: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, node: FileTreeNode) => void;
}

/**
 * Props for the node context menu.
 */
export interface ContextMenuProps {
    x: number;
    y: number;
    node: FileTreeNode;
    onAddFolder: (parentUri: string) => void;
    onAddFile: (parentUri: string) => void;
    onDelete: (uri: string, isFolder: boolean) => void;
    onClose: () => void;
}

/**
 * Props for the blank area context menu.
 */
export interface BlankContextMenuProps {
    x: number;
    y: number;
    onSwitchWorkspace: () => void;
    onNewFolder: () => void;
    onNewFile: () => void;
    onRefresh: () => void;
    onClose: () => void;
}

/**
 * Props for the useFileTree hook.
 */
export interface UseFileTreeOptions {
    fileService: FileService;
    workspaceService: WorkspaceService;
    fileDialogService: FileDialogService;
}

/**
 * Return type for the useFileTree hook.
 */
export interface UseFileTreeReturn {
    fileTree: FileTreeNode[];
    expandedNodes: Set<string>;
    selectedNode: string | null;
    selectedNodeUri: string;
    isLoading: boolean;
    contextMenu: { x: number; y: number; node: FileTreeNode } | null;
    setContextMenu: (menu: { x: number; y: number; node: FileTreeNode } | null) => void;
    blankContextMenu: { x: number; y: number } | null;
    toggleNode: (id: string) => void;
    handleSelect: (id: string) => void;
    handleContextMenu: (e: React.MouseEvent, node: FileTreeNode) => void;
    setBlankContextMenu: (menu: { x: number; y: number } | null) => void;
    handleAddFolder: (parentUri: string) => Promise<void>;
    handleAddFile: (parentUri: string) => Promise<void>;
    handleDelete: (uri: string, isFolder: boolean) => Promise<void>;
    handleSwitchWorkspace: () => Promise<void>;
    handleToolbarAddFolder: () => Promise<void>;
    handleToolbarAddFile: () => Promise<void>;
    handleToolbarDelete: () => Promise<void>;
    refreshTree: () => Promise<void>;
}
