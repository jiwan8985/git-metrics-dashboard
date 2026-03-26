/**
 * Git 상태 표시기
 * 상태바에 실시간 Git 상태와 최근 변경사항을 표시합니다
 */

import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface GitStatus {
  isWatching: boolean;
  lastChangeTime: Date | null;
  lastChangeType: string;
  lastChangeMessage: string;
  currentBranch: string;
  stagedChanges: number;
  unstagedChanges: number;
  untrackedFiles: number;
}

export interface GitEvent {
  timestamp: Date;
  type: string;
  message: string;
  branch?: string;
}

export class GitStatusIndicator {
  private status: GitStatus = {
    isWatching: false,
    lastChangeTime: null,
    lastChangeType: '',
    lastChangeMessage: '',
    currentBranch: 'unknown',
    stagedChanges: 0,
    unstagedChanges: 0,
    untrackedFiles: 0
  };

  private eventHistory: GitEvent[] = [];
  private readonly maxHistorySize = 50;
  private statusBar: vscode.StatusBarItem | null = null;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.initializeStatusBar();
  }

  private initializeStatusBar(): void {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBar.name = 'Git Metrics Auto Refresh';
    this.updateStatusBar();
    this.statusBar.show();
  }

  private updateStatusBar(): void {
    if (!this.statusBar) { return; }

    if (this.status.isWatching) {
      const lastChange = this.status.lastChangeTime ? this.getTimeAgo(this.status.lastChangeTime) : '시작됨';
      this.statusBar.text = `🔄 Git 실시간 감시 (${lastChange})`;
      this.statusBar.tooltip = [
        '📡 상태: 활성화',
        `마지막 변경: ${this.status.lastChangeMessage}`,
        `브랜치: ${this.status.currentBranch}`,
        `변경파일: ${this.status.stagedChanges + this.status.unstagedChanges}`
      ].join('\n');
      this.statusBar.backgroundColor = new vscode.ThemeColor('gitDecoration.addedResourceForeground');
    } else {
      this.statusBar.text = '⏸️ Git 실시간 감시 비활성화';
      this.statusBar.tooltip = 'Git Metrics 설정에서 활성화할 수 있습니다';
      this.statusBar.backgroundColor = undefined;
    }
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) { return '방금 전'; }
    if (seconds < 3600) { return `${Math.floor(seconds / 60)}분 전`; }
    if (seconds < 86400) { return `${Math.floor(seconds / 3600)}시간 전`; }
    return `${Math.floor(seconds / 86400)}일 전`;
  }

  public async startWatching(): Promise<void> {
    this.status.isWatching = true;
    await this.updateCurrentStatus();
    this.updateStatusBar();
  }

  public stopWatching(): void {
    this.status.isWatching = false;
    this.updateStatusBar();
  }

  public async recordChange(type: string, message: string): Promise<void> {
    this.status.lastChangeTime = new Date();
    this.status.lastChangeType = type;
    this.status.lastChangeMessage = message;

    this.eventHistory.unshift({ timestamp: new Date(), type, message });
    if (this.eventHistory.length > this.maxHistorySize) { this.eventHistory.pop(); }

    await this.updateCurrentStatus();
    this.updateStatusBar();
  }

  private async updateCurrentStatus(): Promise<void> {
    try {
      const { stdout: branchOut } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: this.workspacePath });
      this.status.currentBranch = branchOut.trim();

      const { stdout: statusOut } = await execFileAsync('git', ['status', '--porcelain'], { cwd: this.workspacePath });
      const lines = statusOut.trim().split('\n').filter(l => l.trim());
      this.status.stagedChanges = lines.filter(l => !'? '.includes(l[0])).length;
      this.status.unstagedChanges = lines.filter(l => !' ?'.includes(l[1])).length;
      this.status.untrackedFiles = lines.filter(l => l.startsWith('??')).length;
    } catch {
      // Ignore errors (e.g. empty repo, no git)
    }
  }

  public getStatus(): GitStatus { return { ...this.status }; }
  public getEventHistory(): GitEvent[] { return [...this.eventHistory]; }
  public getRecentEvents(count = 10): GitEvent[] { return this.eventHistory.slice(0, count); }

  public dispose(): void {
    if (this.statusBar) { this.statusBar.dispose(); this.statusBar = null; }
    this.eventHistory = [];
  }
}
