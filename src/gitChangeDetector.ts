/**
 * Git 변경 감지 및 실시간 대시보드 업데이트
 * .git 디렉토리의 변경을 감시하고 자동 새로고침을 수행합니다
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface GitChangeEvent {
  type: 'commit' | 'branch' | 'file' | 'stash' | 'tag';
  message: string;
  timestamp: Date;
}

export class GitChangeDetector {
  private watcher: vscode.FileSystemWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastHeadHash: string = '';
  private debounceDelay: number = 1000;
  private changeCallback: ((event: GitChangeEvent) => void) | null = null;
  private workspacePath: string;
  private isEnabled: boolean = false;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const { stdout } = await execFileAsync('git', ['log', '-1', '--pretty=format:%H'], { cwd: this.workspacePath });
      this.lastHeadHash = stdout.trim();
    } catch {
      // git log may fail on empty repos — ignore
    }
  }

  public watchForChanges(callback: (event: GitChangeEvent) => void): void {
    this.changeCallback = callback;
    this.isEnabled = true;

    const gitPath = path.join(this.workspacePath, '.git');
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.workspacePath, '.git/**'),
      false, false, false
    );

    this.watcher.onDidChange((uri) => this.handleGitChange(uri));
    this.watcher.onDidCreate((uri) => this.handleGitChange(uri));
    this.watcher.onDidDelete((uri) => this.handleGitChange(uri));

    console.log('✅ Git 변경 감시 시작:', gitPath);
  }

  private handleGitChange(uri: vscode.Uri): void {
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); }
    this.debounceTimer = setTimeout(() => this.detectGitChange(uri), this.debounceDelay);
  }

  private async detectGitChange(uri: vscode.Uri): Promise<void> {
    try {
      const filePath = uri.fsPath;
      const fileName = path.basename(filePath);

      if (fileName === 'HEAD' || filePath.includes('objects')) {
        await this.detectCommitOrBranch();
        return;
      }
      if (filePath.includes('refs')) {
        await this.detectBranchChange();
        return;
      }
      if (fileName === 'index') {
        await this.detectFileChange();
        return;
      }
      if (filePath.includes('stash')) {
        this.emitChange({ type: 'stash', message: 'Stash 변경 감지됨', timestamp: new Date() });
      }
    } catch (error) {
      console.error('Git 변경 감지 오류:', error);
    }
  }

  private async detectCommitOrBranch(): Promise<void> {
    try {
      const { stdout: hashOut } = await execFileAsync('git', ['log', '-1', '--pretty=format:%H'], { cwd: this.workspacePath });
      const currentHash = hashOut.trim();

      if (currentHash && currentHash !== this.lastHeadHash) {
        this.lastHeadHash = currentHash;
        const { stdout: msgOut } = await execFileAsync('git', ['log', '-1', '--pretty=format:%s'], { cwd: this.workspacePath });
        this.emitChange({ type: 'commit', message: `새 커밋: ${msgOut.trim()}`, timestamp: new Date() });
      }
    } catch (error) {
      console.error('커밋 감지 오류:', error);
    }
  }

  private async detectBranchChange(): Promise<void> {
    try {
      const { stdout } = await execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: this.workspacePath });
      this.emitChange({ type: 'branch', message: `브랜치 변경: ${stdout.trim()}`, timestamp: new Date() });
    } catch (error) {
      console.error('브랜치 변경 감지 오류:', error);
    }
  }

  private async detectFileChange(): Promise<void> {
    try {
      const { stdout } = await execFileAsync('git', ['status', '--porcelain'], { cwd: this.workspacePath });
      const totalChanges = stdout.trim().split('\n').filter(l => l.trim()).length;
      if (totalChanges > 0) {
        this.emitChange({ type: 'file', message: `${totalChanges}개 파일 변경 감지`, timestamp: new Date() });
      }
    } catch (error) {
      console.error('파일 변경 감지 오류:', error);
    }
  }

  private emitChange(event: GitChangeEvent): void {
    if (this.changeCallback) { this.changeCallback(event); }
  }

  public dispose(): void {
    if (this.watcher) { this.watcher.dispose(); this.watcher = null; }
    if (this.debounceTimer) { clearTimeout(this.debounceTimer); this.debounceTimer = null; }
    this.isEnabled = false;
    console.log('❌ Git 변경 감시 중지');
  }

  public isWatching(): boolean { return this.isEnabled; }

  public setDebounceDelay(delayMs: number): void {
    this.debounceDelay = Math.max(100, delayMs);
  }
}
