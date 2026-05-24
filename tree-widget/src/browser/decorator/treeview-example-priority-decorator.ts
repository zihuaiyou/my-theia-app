import { Emitter, MaybePromise } from '@theia/core';
import { DepthFirstTreeIterator, Tree, TreeDecorator } from '@theia/core/lib/browser';
import { WidgetDecoration } from '@theia/core/lib/browser/widget-decoration';
import { Event } from '@theia/core/lib/common';
import { injectable } from '@theia/core/shared/inversify';
import { ExampleTreeLeaf } from '../treeview-example-model';

/**
 * A decorator that shows priority icons based on node name length.
 * - Long names (> 10 chars): Shows a red star (high priority)
 * - Short names (≤ 10 chars): Shows a blue star (normal priority)
 */
@injectable()
export class TreeviewExamplePriorityDecorator implements TreeDecorator {
    /** Decorator id - must be unique */
    id = 'TreeviewExamplePriorityDecorator';

    /** Event Emitter for decoration changes */
    protected readonly emitter = new Emitter<(tree: Tree) => Map<string, WidgetDecoration.Data>>();

    get onDidChangeDecorations(): Event<(tree: Tree) => Map<string, WidgetDecoration.Data>> {
        return this.emitter.event;
    }

    /**
     * Calculate decorations based on node name length.
     * @param tree the tree to decorate
     * @returns a Map of node IDs to decorations
     */
    decorations(tree: Tree): MaybePromise<Map<string, WidgetDecoration.Data>> {
        const result = new Map();

        if (tree.root === undefined) {
            return result;
        }

        // Iterate through all nodes in the tree
        for (const treeNode of new DepthFirstTreeIterator(tree.root)) {
            // Only decorate leaf nodes
            if (ExampleTreeLeaf.is(treeNode)) {
                // Get the node caption (name)
                const caption = this.getNodeCaption(treeNode);

                if (caption.length > 10) {
                    // Long name = High priority (red star)
                    result.set(treeNode.id, <WidgetDecoration.Data>{
                        iconOverlay: {
                            position: WidgetDecoration.IconOverlayPosition.TOP_LEFT,
                            iconClass: ['fa', 'fa-star'],
                            color: 'red'
                        },
                        fontData: {
                            color: 'darkred',
                            style: 'italic'
                        }
                    });
                } else {
                    // Short name = Normal priority (blue star)
                    result.set(treeNode.id, <WidgetDecoration.Data>{
                        iconOverlay: {
                            position: WidgetDecoration.IconOverlayPosition.TOP_LEFT,
                            iconClass: ['fa', 'fa-star'],
                            color: 'blue'
                        }
                    });
                }
            }
        }

        return result;
    }

    /**
     * Get the display caption of a tree node.
     * This tries to get the label from various sources.
     */
    private getNodeCaption(treeNode: any): string {
        // Try different ways to get the label
        if (treeNode.label) {
            return treeNode.label;
        }
        if (treeNode.name) {
            return treeNode.name;
        }
        if (treeNode.uri) {
            return treeNode.uri.toString();
        }
        return treeNode.id || '';
    }

}
