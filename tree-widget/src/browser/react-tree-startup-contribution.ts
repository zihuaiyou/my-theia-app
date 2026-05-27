import { injectable } from 'inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { ReactTreeWidget } from './react-tree-widget';

@injectable()
export class MyViewContribution extends AbstractViewContribution<ReactTreeWidget> {
    constructor() {
        super({
            widgetId: ReactTreeWidget.ID,
            widgetName: ReactTreeWidget.LABEL,
            defaultWidgetOptions: { area: 'left' }, // 默认停靠在左侧面板
            toggleCommandId: 'ReactTreeWidget:toggle' // 切换显示的命令ID
        });
    }
}