/**
 * Recursive component renderer.
 *
 * Renders a ComponentNode into its visual preview.
 * Container types render an inner drop zone for nesting.
 */

import * as React from '@theia/core/shared/react';
import { useState, useCallback } from '@theia/core/shared/react';
import { ComponentNode, DND_DATA_KEY, DragPayload } from './types';

/** Props for the rendered component. */
interface RenderedComponentProps {
    node: ComponentNode;
    selectedId: string | null;
    depth: number;
    onSelect: (id: string) => void;
    onDrop: (parentId: string | null, index: number, payload: DragPayload) => void;
    onDelete: (id: string) => void;
    isDragging?: boolean;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

/** Render a component's visual preview based on type. */
const renderPreview = (node: ComponentNode): React.ReactNode => {
    switch (node.type) {
        case 'button':
            return <button className="dd-preview-button">{node.props.label || 'Button'}</button>;
        case 'text':
            return <div className="dd-preview-text">{node.props.content || 'Text content'}</div>;
        case 'image':
            return <div className="dd-preview-image">📷 {node.props.alt || 'Image'}</div>;
        case 'input':
            return <input className="dd-preview-input" placeholder={node.props.placeholder || 'Input...'} readOnly />;
        case 'container':
            return null; // Container renders its own structure
        default:
            return <div>Unknown</div>;
    }
};

/** Gap drop zone between siblings for reordering. */
const GapDropZone: React.FC<{
    parentId: string | null;
    index: number;
    onDrop: (parentId: string | null, index: number, payload: DragPayload) => void;
}> = ({ parentId, index, onDrop }) => {
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const raw = e.dataTransfer.getData(DND_DATA_KEY);
        if (!raw) { return; }
        onDrop(parentId, index, JSON.parse(raw));
    }, [parentId, index, onDrop]);

    return (
        <div
            className={`dd-gap-zone${dragOver ? ' drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        />
    );
};

/** Inner drop zone for containers (append at end). */
const InnerContainerDropZone: React.FC<{
    parentId: string;
    index: number;
    onDrop: (parentId: string | null, index: number, payload: DragPayload) => void;
    isEmpty: boolean;
}> = ({ parentId, index, onDrop, isEmpty }) => {
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const raw = e.dataTransfer.getData(DND_DATA_KEY);
        if (!raw) { return; }
        onDrop(parentId, index, JSON.parse(raw));
    }, [parentId, index, onDrop]);

    if (isEmpty && !dragOver) { return null; }

    return (
        <div
            className={`dd-container-inner-zone${dragOver ? ' drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isEmpty ? <span className="dd-drop-hint">Drop components here</span> : null}
        </div>
    );
};

/**
 * RenderedComponent — recursively renders a component node.
 */
export const RenderedComponent: React.FC<RenderedComponentProps> = ({
    node,
    selectedId,
    depth,
    onSelect,
    onDrop,
    onDelete,
    onDragStart,
}) => {
    const isSelected = selectedId === node.id;
    const isContainer = node.type === 'container';

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(node.id);
    }, [node.id, onSelect]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(node.id);
    }, [node.id, onDelete]);

    const handleDragStartLocal = useCallback((e: React.DragEvent) => {
        e.stopPropagation();
        onDragStart(e, node.id);
    }, [node.id, onDragStart]);

    // Container rendering
    if (isContainer) {
        return (
            <div
                className={`dd-component-wrapper${isSelected ? ' dd-selected' : ''}`}
                style={{ marginLeft: Math.min(depth * 16, 80) }}
                onClick={handleClick}
                draggable
                onDragStart={handleDragStartLocal}
            >
                <div className="dd-container-header">
                    <span>📦 Container</span>
                    <button className="dd-delete-btn" onClick={handleDeleteClick}>✕</button>
                </div>
                <div className="dd-container-body">
                    {node.children.length > 0 ? (
                        <>
                            <GapDropZone parentId={node.id} index={0} onDrop={onDrop} />
                            {node.children.map((child, idx) => (
                                <React.Fragment key={child.id}>
                                    <RenderedComponent
                                        node={child}
                                        selectedId={selectedId}
                                        depth={depth + 1}
                                        onSelect={onSelect}
                                        onDrop={onDrop}
                                        onDelete={onDelete}
                                        onDragStart={onDragStart}
                                    />
                                    <GapDropZone parentId={node.id} index={idx + 1} onDrop={onDrop} />
                                </React.Fragment>
                            ))}
                        </>
                    ) : null}
                    <InnerContainerDropZone
                        parentId={node.id}
                        index={node.children.length}
                        onDrop={onDrop}
                        isEmpty={node.children.length === 0}
                    />
                </div>
            </div>
        );
    }

    // Non-container rendering
    return (
        <div
            className={`dd-component-wrapper dd-leaf-wrapper${isSelected ? ' dd-selected' : ''}`}
            style={{ marginLeft: Math.min(depth * 16, 80) }}
            onClick={handleClick}
            draggable
            onDragStart={handleDragStartLocal}
        >
            <div className="dd-leaf-header">
                <button className="dd-delete-btn" onClick={handleDeleteClick}>✕</button>
            </div>
            {renderPreview(node)}
        </div>
    );
};
