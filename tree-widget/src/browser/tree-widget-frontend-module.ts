import { ContainerModule } from 'inversify';
import { ReactTreeWidget } from './react-tree-widget';
import { bindViewContribution, WidgetFactory } from '@theia/core/lib/browser';
import { MyViewContribution } from './react-tree-startup-contribution';
import { DragDropDesignerWidget } from './drag-drop/designer-widget';
import { DragDropDesignerContribution } from './drag-drop/designer-contribution';

export default new ContainerModule(bind => {
    // File tree widget
    bind(ReactTreeWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ReactTreeWidget.ID,
        createWidget: () => ctx.container.get<ReactTreeWidget>(ReactTreeWidget)
    })).inSingletonScope();
    bindViewContribution(bind, MyViewContribution);

    // Drag-drop designer widget
    bind(DragDropDesignerWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: DragDropDesignerWidget.ID,
        createWidget: () => ctx.container.get<DragDropDesignerWidget>(DragDropDesignerWidget)
    })).inSingletonScope();
    bindViewContribution(bind, DragDropDesignerContribution);
});
