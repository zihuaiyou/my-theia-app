/**
 * Type definitions for the drag-drop designer widget.
 */

/** Component types supported in the designer palette. */
export type ComponentType = 'button' | 'text' | 'container' | 'image' | 'input';

/** A node in the component tree. Containers have children for nesting. */
export interface ComponentNode {
    id: string;
    type: ComponentType;
    props: Record<string, string>;
    children: ComponentNode[];
}

/** A palette item definition. */
export interface PaletteItem {
    type: ComponentType;
    label: string;
    icon: string;
}

/** Data transfer key for drag-and-drop operations. */
export const DND_DATA_KEY = 'application/x-component-designer';

/** Payload serialized into dataTransfer during drag. */
export interface DragPayload {
    source: 'palette' | 'canvas';
    componentType?: ComponentType;
    componentId?: string;
}
