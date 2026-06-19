/**
 * DragDropDesignerWidget — Theia ReactWidget for the component drag-drop designer.
 *
 * Owns the component tree state and tree mutation helpers.
 * Injects CSS dynamically on init.
 */

import { ReactWidget } from '@theia/core/lib/browser';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { ComponentNode, ComponentType } from './types';
import { DesignCanvas } from './design-canvas';

// ─── ID Generator ────────────────────────────────────────────────────

let idCounter = 0;
const genId = (): string => `comp-${++idCounter}-${Date.now().toString(36)}`;

// ─── Default Props ───────────────────────────────────────────────────

const getDefaultProps = (type: ComponentType): Record<string, string> => {
    switch (type) {
        case 'button': return { label: 'Button' };
        case 'text': return { content: 'Text content' };
        case 'container': return {};
        case 'image': return { alt: 'Image placeholder' };
        case 'input': return { placeholder: 'Input...' };
    }
};

// ─── Tree Helpers (immutable) ────────────────────────────────────────

/** Insert a node under the parent with the given id. */
const insertChild = (
    tree: ComponentNode[],
    parentId: string,
    newNode: ComponentNode,
    index?: number,
): ComponentNode[] =>
    tree.map(node => {
        if (node.id === parentId) {
            const children = [...node.children];
            children.splice(index ?? children.length, 0, newNode);
            return { ...node, children };
        }
        if (node.children.length > 0) {
            return { ...node, children: insertChild(node.children, parentId, newNode, index) };
        }
        return node;
    });

/** Remove a node by id from the tree. */
const removeNode = (tree: ComponentNode[], id: string): ComponentNode[] =>
    tree
        .filter(n => n.id !== id)
        .map(n => ({
            ...n,
            children: removeNode(n.children, id),
        }));

/** Move a node from one parent/index to another. */
const moveNode = (
    tree: ComponentNode[],
    componentId: string,
    targetParentId: string | null,
    targetIndex?: number,
): ComponentNode[] => {
    let movedNode: ComponentNode | null = null;

    const removeAndCapture = (nodes: ComponentNode[]): ComponentNode[] => {
        const result: ComponentNode[] = [];
        for (const n of nodes) {
            if (n.id === componentId) {
                movedNode = n;
            } else {
                result.push({ ...n, children: removeAndCapture(n.children) });
            }
        }
        return result;
    };

    const cleaned = removeAndCapture(tree);
    if (!movedNode) { return tree; }

    if (targetParentId === null) {
        const arr = [...cleaned];
        arr.splice(targetIndex ?? arr.length, 0, movedNode);
        return arr;
    }

    return insertChild(cleaned, targetParentId, movedNode, targetIndex);
};

// ─── CSS (injected inline) ───────────────────────────────────────────

const DESIGNER_CSS = `
.dd-designer-container { display: flex; height: 100%; overflow: hidden; }

/* Palette */
.dd-palette { width: 180px; min-width: 180px; border-right: 1px solid var(--theia-border-color,#ddd); padding: 8px; overflow-y: auto; background: var(--theia-sideBar-background,#f3f3f3); }
.dd-palette-title { font-size: 11px; text-transform: uppercase; color: var(--theia-descriptionForeground,#888); margin: 0 0 8px 0; padding: 4px 8px; letter-spacing: 0.5px; }
.dd-palette-item { display: flex; align-items: center; gap: 8px; padding: 8px; margin: 4px 0; cursor: grab; border: 1px solid transparent; border-radius: 4px; user-select: none; background: var(--theia-sideBar-background,#f3f3f3); transition: all 0.12s; }
.dd-palette-item:hover { background: var(--theia-list-hoverBackground,#e8e8e8); border-color: var(--theia-border-color,#ddd); }
.dd-palette-item:active { cursor: grabbing; transform: scale(0.97); }
.dd-palette-icon { font-size: 18px; width: 24px; text-align: center; }
.dd-palette-label { font-size: 13px; color: var(--theia-foreground,#333); }

/* Canvas */
.dd-canvas { flex: 1; padding: 16px; overflow-y: auto; background: var(--theia-editor-background,#fff); }
.dd-canvas-title { font-size: 13px; font-weight: 600; margin: 0 0 12px 0; color: var(--theia-foreground,#333); }
.dd-canvas-empty { display: flex; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed var(--theia-border-color,#ccc); border-radius: 8px; color: var(--theia-descriptionForeground,#888); cursor: default; transition: all 0.15s; }
.dd-canvas-empty.drag-over, .dd-canvas-empty:hover { border-color: var(--theia-focusBorder,#4d90fe); background: rgba(77,144,254,0.05); }

/* Component wrapper */
.dd-component-wrapper { position: relative; margin: 4px 0; padding: 8px; border: 2px solid transparent; border-radius: 6px; transition: all 0.12s; cursor: pointer; }
.dd-component-wrapper:hover { border-color: var(--theia-focusBorder,#4d90fe); background: rgba(77,144,254,0.03); }
.dd-component-wrapper.dd-selected { border-color: var(--theia-list-activeSelectionBackground,#005fb8) !important; background: rgba(0,95,184,0.06); box-shadow: 0 0 0 1px var(--theia-list-activeSelectionBackground,#005fb8); }
.dd-leaf-wrapper { display: inline-block; min-width: 80px; }

/* Container */
.dd-container-header { display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; font-size: 12px; font-weight: 600; color: var(--theia-descriptionForeground,#888); background: var(--theia-sideBar-background,#f3f3f3); border-radius: 4px 4px 0 0; }
.dd-container-body { padding: 8px; border: 1px solid var(--theia-border-color,#ddd); border-radius: 0 0 4px 4px; min-height: 32px; }
.dd-container-inner-zone { min-height: 32px; border: 2px dashed var(--theia-border-color,#ccc); border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; margin-top: 4px; }
.dd-container-inner-zone.drag-over { border-color: var(--theia-list-activeSelectionBackground,#005fb8); background: rgba(0,95,184,0.08); min-height: 48px; }
.dd-drop-hint { color: var(--theia-descriptionForeground,#888); font-size: 12px; font-style: italic; }

/* Gap drop zones */
.dd-gap-zone { height: 4px; border-radius: 2px; transition: all 0.15s; margin: 2px 0; }
.dd-gap-zone.drag-over { height: 20px; background: var(--theia-list-activeSelectionBackground,#005fb8); opacity: 0.3; }

/* Root drop zone */
.dd-root-drop-zone { height: 4px; border-radius: 2px; transition: all 0.12s; }
.dd-root-drop-zone.drag-over { height: 24px; background: var(--theia-list-activeSelectionBackground,#005fb8); opacity: 0.25; }

/* Delete button */
.dd-delete-btn { background: none; border: none; cursor: pointer; font-size: 12px; color: var(--theia-errorForeground,#e51400); opacity: 0; padding: 2px 6px; border-radius: 3px; }
.dd-component-wrapper:hover .dd-delete-btn { opacity: 1; }
.dd-delete-btn:hover { background: rgba(229,20,0,0.1); }

/* Leaf header */
.dd-leaf-header { position: absolute; top: -8px; right: -2px; }

/* Component previews */
.dd-preview-button { padding: 8px 16px; background: var(--theia-button-background,#005fb8); color: var(--theia-button-foreground,#fff); border: none; border-radius: 4px; font-size: 13px; cursor: default; pointer-events: none; }
.dd-preview-text { padding: 4px 8px; font-size: 14px; color: var(--theia-foreground,#333); }
.dd-preview-image { width: 100px; height: 80px; background: var(--theia-editorWidget-background,#f3f3f3); display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid var(--theia-border-color,#ddd); color: var(--theia-descriptionForeground,#888); font-size: 12px; }
.dd-preview-input { padding: 6px 12px; border: 1px solid var(--theia-input-border,#ccc); background: var(--theia-input-background,#fff); color: var(--theia-foreground,#333); border-radius: 4px; width: 180px; font-size: 13px; }
`;

// ─── Widget ──────────────────────────────────────────────────────────

@injectable()
export class DragDropDesignerWidget extends ReactWidget {
    static readonly ID = 'drag-drop-designer';
    static readonly LABEL = 'Component Designer';

    private componentTree: ComponentNode[] = [];
    private selectedId: string | null = null;

    @postConstruct()
    protected init(): void {
        this.id = DragDropDesignerWidget.ID;
        this.title.label = DragDropDesignerWidget.LABEL;
        this.title.caption = DragDropDesignerWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-cubes';
        this.injectStyles();
        this.update();
    }

    private injectStyles(): void {
        if (!document.getElementById('dd-designer-style')) {
            const style = document.createElement('style');
            style.id = 'dd-designer-style';
            style.textContent = DESIGNER_CSS;
            document.head.appendChild(style);
        }
    }

    // ─── State Mutators ──────────────────────────────────────────

    addComponent = (type: ComponentType, parentId?: string, index?: number): void => {
        const newNode: ComponentNode = {
            id: genId(),
            type,
            props: { ...getDefaultProps(type) },
            children: [],
        };
        if (parentId) {
            this.componentTree = insertChild(this.componentTree, parentId, newNode, index);
        } else {
            const arr = [...this.componentTree];
            arr.splice(index ?? arr.length, 0, newNode);
            this.componentTree = arr;
        }
        this.update();
    };

    removeComponent = (id: string): void => {
        this.componentTree = removeNode(this.componentTree, id);
        if (this.selectedId === id) {
            this.selectedId = null;
        }
        this.update();
    };

    moveComponent = (componentId: string, targetParentId: string | null, targetIndex?: number): void => {
        // Don't move onto itself
        if (componentId === targetParentId) { return; }
        this.componentTree = moveNode(this.componentTree, componentId, targetParentId, targetIndex);
        this.update();
    };

    selectComponent = (id: string | null): void => {
        this.selectedId = id;
        this.update();
    };

    // ─── Render ──────────────────────────────────────────────────

    protected render(): React.ReactNode {
        return React.createElement(DesignCanvas, {
            components: this.componentTree,
            selectedId: this.selectedId,
            onAddComponent: this.addComponent,
            onRemoveComponent: this.removeComponent,
            onMoveComponent: this.moveComponent,
            onSelectComponent: this.selectComponent,
        });
    }
}
