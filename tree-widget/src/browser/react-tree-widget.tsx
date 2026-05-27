/**
 * React-based Tree Widget for Theia.
 *
 * This widget provides a file tree view using React components.
 */

import { ReactWidget } from '@theia/core/lib/browser';
import { WorkspaceService } from '@theia/workspace/lib/browser/workspace-service';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileDialogService } from '@theia/filesystem/lib/browser/file-dialog/file-dialog-service';
import { injectable, postConstruct, inject } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { FileTreeComponent } from './file-tree';

/**
 * React-based Tree Widget.
 * Provides a file tree view using React components.
 */
@injectable()
export class ReactTreeWidget extends ReactWidget {
    static readonly ID = 'react-tree-widget';
    static readonly LABEL = '文件树';

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(FileDialogService)
    protected readonly fileDialogService: FileDialogService;

    @postConstruct()
    protected init(): void {
        this.id = ReactTreeWidget.ID;
        this.title.label = ReactTreeWidget.LABEL;
        this.title.caption = ReactTreeWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-folder-tree';
        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <FileTreeComponent
                fileService={this.fileService}
                workspaceService={this.workspaceService}
                fileDialogService={this.fileDialogService}
            />
        );
    }
}
