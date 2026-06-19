/**
 * Component palette — draggable sidebar items.
 */

import * as React from '@theia/core/shared/react';
import { ComponentType, DND_DATA_KEY, DragPayload, PaletteItem } from './types';

const PALETTE_ITEMS: PaletteItem[] = [
    { type: 'button', label: 'Button', icon: '🔘' },
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'container', label: 'Container', icon: '📦' },
    { type: 'image', label: 'Image', icon: '🖼️' },
    { type: 'input', label: 'Input', icon: '📋' },
];

export const ComponentPalette: React.FC = () => {
    const handleDragStart = (e: React.DragEvent, type: ComponentType): void => {
        const payload: DragPayload = { source: 'palette', componentType: type };
        e.dataTransfer.setData(DND_DATA_KEY, JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="dd-palette">
            <h3 className="dd-palette-title">Components</h3>
            {PALETTE_ITEMS.map(item => (
                <div
                    key={item.type}
                    className="dd-palette-item"
                    draggable
                    onDragStart={(e: React.DragEvent) => handleDragStart(e, item.type)}
                >
                    <span className="dd-palette-icon">{item.icon}</span>
                    <span className="dd-palette-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
};
