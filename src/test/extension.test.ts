import * as assert from 'assert';
import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

suite('Extension host smoke tests', () => {
    test('activates the extension and registers every contributed command', async () => {
        const extension = vscode.extensions.getExtension('jiwan-dev.git-metrics-dashboard');
        assert.ok(extension, 'The development extension must be loaded');
        await extension.activate();
        assert.ok(extension.isActive);

        const commands = new Set(await vscode.commands.getCommands(true));
        const contributions = extension.packageJSON.contributes.commands as Array<{ command: string }>;
        assert.ok(contributions.length > 0);
        for (const contribution of contributions) {
            assert.ok(commands.has(contribution.command), `Missing command: ${contribution.command}`);
        }
    });

    test('opens the dashboard through its public command', async function () {
        if (!vscode.workspace.workspaceFolders?.length) {
            this.skip();
        }
        await vscode.commands.executeCommand('gitMetrics.showDashboard');
        const tabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);
        assert.ok(tabs.some(tab => tab.input instanceof vscode.TabInputWebview
            && tab.label.includes('Git Metrics Dashboard')), 'Dashboard webview tab must open');
        if (process.env.GIT_METRICS_CAPTURE_PORT) {
            const extension = vscode.extensions.getExtension('jiwan-dev.git-metrics-dashboard')!;
            await promisify(execFile)('node', [path.join(extension.extensionPath, 'scripts', 'phase0-capture.cjs')], {
                cwd: extension.extensionPath, timeout: 25000
            });
        }
    });
});
