/**
 * DragDropDesignerContribution — registers the designer widget in the main editor area.
 */

import { AbstractViewContribution } from '@theia/core/lib/browser';
import { injectable } from '@theia/core/shared/inversify';
import { DragDropDesignerWidget } from './designer-widget';

@injectable()
export class DragDropDesignerContribution extends AbstractViewContribution<DragDropDesignerWidget> {
    constructor() {
        super({
            widgetId: DragDropDesignerWidget.ID,
            widgetName: DragDropDesignerWidget.LABEL,
            defaultWidgetOptions: { area: 'main' },
            toggleCommandId: 'dragDropDesigner:toggle',
        });
    }
}
