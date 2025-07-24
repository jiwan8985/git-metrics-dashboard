import * as vscode from 'vscode';
import { GitAnalyzer } from './gitAnalyzer';
import { DashboardProvider } from './dashboardProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Git Metrics Dashboard 활성화됨!');

    const gitAnalyzer = new GitAnalyzer();
    const dashboardProvider = new DashboardProvider(context, gitAnalyzer);

    // 대시보드 열기 명령어 등록
    const disposable = vscode.commands.registerCommand('gitMetrics.showDashboard', () => {
        dashboardProvider.showDashboard();
    });

    // 상태바 아이템 추가
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'gitMetrics.showDashboard';
    statusBarItem.text = "📊 Git Stats";
    statusBarItem.tooltip = "Git 메트릭 대시보드 열기";
    statusBarItem.show();

    context.subscriptions.push(disposable, statusBarItem);
}

export function deactivate() {
    console.log('Git Metrics Dashboard 비활성화됨');
}