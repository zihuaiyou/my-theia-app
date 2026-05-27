import { ContainerModule } from 'inversify';
import { ReactTreeWidget } from './react-tree-widget';
import { bindViewContribution, WidgetFactory } from '@theia/core/lib/browser';
import { MyViewContribution } from './react-tree-startup-contribution';

export default new ContainerModule(bind => {
    // 将你的 Widget 绑定到自身，以便后续注入
    bind(ReactTreeWidget).toSelf();
    // 注册 Widget 工厂
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: ReactTreeWidget.ID,
        createWidget: () => ctx.container.get<ReactTreeWidget>(ReactTreeWidget)
    })).inSingletonScope();
    // 4. 【建议】使用官方提供的辅助方法，自动将 Contribution 绑定到框架的扩展点上
    bindViewContribution(bind, MyViewContribution);
});
