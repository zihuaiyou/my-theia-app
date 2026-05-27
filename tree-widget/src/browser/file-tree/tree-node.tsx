/**
 * Tree node component for the file tree widget.
 */

import * as React from '@theia/core/shared/react';
import { useCallback } from '@theia/core/shared/react';
import { TreeNodeProps } from './types';
import { FolderIcon, FileIcon, ChevronIcon } from './icons';

/**
 * TreeNodeComponent - Renders a single node in the file tree.
 */
export const TreeNodeComponent: React.FC<TreeNodeProps> = ({
    node,
    depth,
    expandedNodes,
    selectedNode,
    onToggle,
    onSelect,
    onContextMenu
}) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(node.id);
        if (hasChildren) {
            onToggle(node.id);
        }
    }, [node.id, hasChildren, onToggle, onSelect]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node);
    }, [node, onContextMenu]);

    return (
        <div className="node-children">
            <div
                className={`react-tree-node ${isSelected ? 'selected' : ''}`}
                style={{ paddingLeft: `${depth * 18}px` }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                {hasChildren ? (
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`} onClick={(e) => {
                        e.stopPropagation();
                        onToggle(node.id);
                    }}>
                        <ChevronIcon expanded={isExpanded} />
                    </span>
                ) : (
                    <span className="expand-icon-placeholder"></span>
                )}
                <span className="node-icon">
                    {node.type === 'folder' ? (
                        <FolderIcon expanded={isExpanded} />
                    ) : (
                        <FileIcon />
                    )}
                </span>
                <span className="node-name">{node.name}</span>
                {hasChildren && (
                    <span className="node-quantity">{node.children!.length}</span>
                )}
            </div>
            {hasChildren && isExpanded && (
                <div className="node-children node-children-transition">
                    {node.children!.map(child => (
                        <TreeNodeComponent
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            expandedNodes={expandedNodes}
                            selectedNode={selectedNode}
                            onToggle={onToggle}
                            onSelect={onSelect}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
