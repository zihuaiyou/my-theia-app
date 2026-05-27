/**
 * SVG icon components for the file tree widget.
 */

import * as React from '@theia/core/shared/react';

/**
 * Props for FolderIcon component.
 */
interface FolderIconProps {
    expanded?: boolean;
}

/**
 * Folder icon component - displays different SVG for expanded/collapsed states.
 */
export const FolderIcon: React.FC<FolderIconProps> = ({ expanded }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: '4px', flexShrink: 0 }}>
        {expanded ? (
            <path fill="#DCAD5B" d="M14.5 3H7L6 2H1.5C0.675 2 0 2.675 0 3.5v9c0 .825.675 1.5 1.5 1.5h13c.825 0 1.5-.675 1.5-1.5v-9c0-.825-.675-1.5-1.5-1.5zM1.5 4h5.5l1 1h6c.275 0 .5.225.5.5v1.5H1V4z"/>
        ) : (
            <path fill="#DCAD5B" d="M14.5 3H7L6 2H1.5C0.675 2 0 2.675 0 3.5v9c0 .825.675 1.5 1.5 1.5h13c.825 0 1.5-.675 1.5-1.5v-9c0-.825-.675-1.5-1.5-1.5z"/>
        )}
    </svg>
);

/**
 * File icon component - displays a file document icon.
 */
export const FileIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: '4px', flexShrink: 0 }}>
        <path fill="#5D9CED" d="M14.5 2H5.5L4.5 1H1.5C0.675 1 0 1.675 0 2.5v11c0 .825.675 1.5 1.5 1.5h13c.825 0 1.5-.675 1.5-1.5v-11c0-.825-.675-1.5-1.5-1.5zM5 2l1-1h6.5L14 2H5zM1.5 13V3h2.5l1 1H14v9h-12.5z"/>
    </svg>
);

/**
 * Chevron icon component - displays expand/collapse indicator.
 */
export const ChevronIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        style={{
            marginRight: '2px',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'
        }}
    >
        <path fill="currentColor" d="M6 4l4 4-4 4z"/>
    </svg>
);

/**
 * Switch workspace icon component.
 */
export const SwitchWorkspaceIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: '6px', flexShrink: 0 }}>
        <path fill="currentColor" d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
        <path fill="currentColor" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
    </svg>
);

/**
 * Refresh icon component.
 */
export const RefreshIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ marginRight: '6px', flexShrink: 0 }}>
        <path fill="currentColor" d="M13.451 5.609l-.579-.939-1.068.812-.076.094c-.335.415-.927 1.146-1.545 1.565-.619.419-1.524.629-2.083.629H8V6.124c0-.265-.105-.52-.293-.707l-.007-.007L2.414 0l-.879.879 4.773 4.773c.375-.375 1.165-1.164 1.828-2.003l.076-.094 1.068-.812.579.939C9.4 4.49 9.887 5.32 10 5.32h1V2.414L9.586 1H5.32C5.112 1 4.92 1.086 4.79 1.21l-.078.081-4.712 5.71c-.187.187-.293.442-.293.707v1.572c0 .265.105.52.293.707l.078.081 2.343 2.343c.13.124.322.21.53.21h1.414c.208 0 .4-.086.53-.21l.078-.081 1.712-1.712c.187-.187.293-.442.293-.707v-.858h.172c.558 0 1.464-.21 2.083-.629.618-.419 1.21-1.15 1.545-1.565l.076-.094 1.068-.812.579.939C14.4 7.49 13.913 8.32 13.8 8.32H13v2.586l1.414 1.414v-4c0-.265-.105-.52-.293-.707z"/>
    </svg>
);
