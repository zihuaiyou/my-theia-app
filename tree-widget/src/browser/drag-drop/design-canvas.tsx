/**
 * Design canvas — main drop surface.
 *
 * Left sidebar: ComponentPalette
 * Right area: drop canvas with tree rendering
 */

import * as React from '@theia/core/shared/react';
import { useState, useCallback } from '@theia/core/shared/react';
import { ComponentNode, ComponentType, DND_DATA_KEY, DragPayload } from './types';
import { ComponentPalette } from './component-palette';
import { RenderedComponent } from './render-component';

/** DropZone component for root-level drops. */
export const DropZone: React.FC<{
    parentId: string | null;
    index: number;
    onDrop: (parentId: string | null, index: number, payload: DragPayload) => void;
    isEmpty?: boolean;
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

    if (isEmpty && !dragOver) {
        return (
            <div
                className="dd-canvas-empty"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <span>Drag components here</span>
            </div>
        );
    }

    return (
        <div
            className={`dd-root-drop-zone${dragOver ? ' drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        />
    );
};

/** Props for DesignCanvas. */
interface DesignCanvasProps {
    components: ComponentNode[];
    selectedId: string | null;
    onAddComponent: (type: ComponentType, parentId?: string, index?: number) => void;
    onRemoveComponent: (id: string) => void;
    onMoveComponent: (componentId: string, targetParentId: string | null, targetIndex?: number) => void;
    onSelectComponent: (id: string | null) => void;
}

/**
 * DesignCanvas — main layout with palette + canvas.
 */
export const DesignCanvas: React.FC<DesignCanvasProps> = ({
    components,
    selectedId,
    onAddComponent,
    onRemoveComponent,
    onMoveComponent,
    onSelectComponent,
}) => {
    /** Shared drop handler: reads DragPayload from dataTransfer. */
    const handleDrop = useCallback((parentId: string | null, index: number, payload: DragPayload) => {
        if (payload.source === 'palette' && payload.componentType) {
            onAddComponent(payload.componentType, parentId ?? undefined, index);
        } else if (payload.source === 'canvas' && payload.componentId) {
            onMoveComponent(payload.componentId, parentId, index);
        }
    }, [onAddComponent, onMoveComponent]);

    /** Handle drag start on a canvas component (for reordering/reparenting). */
    const handleComponentDragStart = useCallback((e: React.DragEvent, id: string) => {
        const payload: DragPayload = { source: 'canvas', componentId: id };
        e.dataTransfer.setData(DND_DATA_KEY, JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    /** Clear selection on canvas background click. */
    const handleCanvasClick = useCallback(() => {
        onSelectComponent(null);
    }, [onSelectComponent]);

    return (
        <div className="dd-designer-container">
            <ComponentPalette />
            <div className="dd-canvas" onClick={handleCanvasClick}>
                <h3 className="dd-canvas-title">Design Canvas</h3>
                {components.length === 0 ? (
                    <DropZone parentId={null} index={0} onDrop={handleDrop} isEmpty />
                ) : (
                    <>
                        <DropZone parentId={null} index={0} onDrop={handleDrop} />
                        {components.map((node, idx) => (
                            <React.Fragment key={node.id}>
                                <RenderedComponent
                                    node={node}
                                    selectedId={selectedId}
                                    depth={0}
                                    onSelect={onSelectComponent}
                                    onDrop={handleDrop}
                                    onDelete={onRemoveComponent}
                                    onDragStart={handleComponentDragStart}
                                />
                                <DropZone parentId={null} index={idx + 1} onDrop={handleDrop} />
                            </React.Fragment>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
