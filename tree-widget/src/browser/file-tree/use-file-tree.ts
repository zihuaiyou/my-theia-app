/**
 * Custom hook for file tree state and logic management.
 */

import { useState, useCallback, useEffect } from '@theia/core/shared/react';
import URI from '@theia/core/lib/common/uri';
import { FileTreeNode, UseFileTreeOptions, UseFileTreeReturn } from './types';

/**
 * Custom hook for managing file tree state and operations.
 */
export const useFileTree = (options: UseFileTreeOptions): UseFileTreeReturn => {
    const { fileService, workspaceService, fileDialogService } = options;

    const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [selectedNodeUri, setSelectedNodeUri] = useState<string>('');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileTreeNode } | null>(null);
    const [blankContextMenu, setBlankContextMenu] = useState<{ x: number; y: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Load directory contents recursively.
     */
    const loadDirectory = useCallback(async (uri: string): Promise<FileTreeNode[]> => {
        try {
            const parentStat = await fileService.resolve(new URI(uri));
            if (!parentStat || !parentStat.isDirectory || !parentStat.children) {
                return [];
            }

            const nodes: FileTreeNode[] = [];
            for (const childStat of parentStat.children) {
                const node: FileTreeNode = {
                    id: childStat.resource.toString(),
                    name: childStat.name,
                    type: childStat.isDirectory ? 'folder' : 'file',
                    uri: childStat.resource.toString(),
                    parentId: uri
                };

                if (childStat.isDirectory) {
                    node.children = await loadDirectory(childStat.resource.toString());
                }

                nodes.push(node);
            }

            // Sort: folders first, then alphabetically
            nodes.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

            return nodes;
        } catch (error) {
            console.error('Failed to load directory:', error);
            return [];
        }
    }, [fileService]);

    /**
     * Refresh the file tree.
     */
    const refreshTree = useCallback(async () => {
        setIsLoading(true);
        const roots = await workspaceService.roots;

        if (roots.length === 0) {
            setFileTree([]);
            setIsLoading(false);
            return;
        }

        const rootUri = roots[0].resource.toString();
        const tree = await loadDirectory(rootUri);
        setFileTree(tree);
        setIsLoading(false);
    }, [workspaceService, loadDirectory]);

    /**
     * Initialize file tree and subscribe to file changes.
     */
    useEffect(() => {
        refreshTree();

        const disposable = fileService.onDidFilesChange(() => {
            refreshTree();
        });

        return () => disposable.dispose();
    }, [refreshTree, fileService]);

    /**
     * Toggle node expansion state.
     */
    const toggleNode = useCallback((id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    /**
     * Handle node selection.
     */
    const handleSelect = useCallback((id: string) => {
        setSelectedNode(id);

        const findNodeUri = (nodes: FileTreeNode[], targetId: string): string => {
            for (const node of nodes) {
                if (node.id === targetId) return node.uri;
                if (node.children) {
                    const found = findNodeUri(node.children, targetId);
                    if (found) return found;
                }
            }
            return '';
        };

        const uri = findNodeUri(fileTree, id);
        setSelectedNodeUri(uri);
    }, [fileTree]);

    /**
     * Handle context menu display.
     */
    const handleContextMenu = useCallback((e: React.MouseEvent, node: FileTreeNode) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    }, []);

    /**
     * Create a new folder.
     */
    const handleAddFolder = useCallback(async (parentUri: string) => {
        if (!parentUri) return;

        const newFolderUri = parentUri + '/New Folder';
        try {
            await fileService.createFolder(new URI(newFolderUri));
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    }, [fileService]);

    /**
     * Create a new file.
     */
    const handleAddFile = useCallback(async (parentUri: string) => {
        if (!parentUri) return;

        const newFileUri = parentUri + '/newfile.txt';
        try {
            await fileService.create(new URI(newFileUri));
        } catch (error) {
            console.error('Failed to create file:', error);
        }
    }, [fileService]);

    /**
     * Delete a file or folder.
     */
    const handleDelete = useCallback(async (uri: string, isFolder: boolean) => {
        try {
            if (isFolder) {
                await fileService.delete(new URI(uri), { recursive: true });
            } else {
                await fileService.delete(new URI(uri));
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    }, [fileService]);

    /**
     * Switch to a different workspace.
     */
    const handleSwitchWorkspace = useCallback(async () => {
        try {
            const selected = await fileDialogService.showOpenDialog({
                title: '选择工作区文件夹',
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false
            });

            if (selected) {
                const uri = selected instanceof URI ? selected : selected[0];
                await workspaceService.open(uri);
            }
        } catch (error) {
            console.error('Failed to switch workspace:', error);
        }
    }, [fileDialogService, workspaceService]);

    /**
     * Get the parent URI of the currently selected node.
     */
    const getSelectedParentUri = useCallback((): string => {
        if (!selectedNode) return '';

        const findNode = (nodes: FileTreeNode[], id: string): FileTreeNode | undefined => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNode(node.children, id);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const node = findNode(fileTree, selectedNode);
        if (!node) return '';

        return node.type === 'folder' ? node.uri : (node.parentId || '');
    }, [selectedNode, fileTree]);

    /**
     * Toolbar: Add folder action.
     */
    const handleToolbarAddFolder = useCallback(async () => {
        const parentUri = getSelectedParentUri();
        if (parentUri) {
            await handleAddFolder(parentUri);
        } else {
            const roots = await workspaceService.roots;
            if (roots.length > 0) {
                await handleAddFolder(roots[0].resource.toString());
            }
        }
    }, [getSelectedParentUri, handleAddFolder, workspaceService]);

    /**
     * Toolbar: Add file action.
     */
    const handleToolbarAddFile = useCallback(async () => {
        const parentUri = getSelectedParentUri();
        if (parentUri) {
            await handleAddFile(parentUri);
        } else {
            const roots = await workspaceService.roots;
            if (roots.length > 0) {
                await handleAddFile(roots[0].resource.toString());
            }
        }
    }, [getSelectedParentUri, handleAddFile, workspaceService]);

    /**
     * Toolbar: Delete action.
     */
    const handleToolbarDelete = useCallback(async () => {
        if (selectedNodeUri) {
            const stat = await fileService.resolve(new URI(selectedNodeUri));
            if (stat) {
                await handleDelete(selectedNodeUri, stat.isDirectory);
            }
        }
    }, [selectedNodeUri, handleDelete, fileService]);

    return {
        fileTree,
        expandedNodes,
        selectedNode,
        selectedNodeUri,
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
    };
};
