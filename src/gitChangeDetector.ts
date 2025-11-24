/**
 * Git 변경 감지 및 실시간 대시보드 업데이트
 * .git 디렉토리의 변경을 감시하고 자동 새로고침을 수행합니다
 */

import * as vscode from 'vscode';
import * as path from 'path';
import simpleGit from 'simple-git';

export interface GitChangeEvent {
  type: 'commit' | 'branch' | 'file' | 'stash' | 'tag';
  message: string;
  timestamp: Date;
}

export class GitChangeDetector {
  private watcher: vscode.FileSystemWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastCheckTime: number = Date.now();
  private lastHeadHash: string = '';
  private debounceDelay: number = 1000; // 1초
  private changeCallback: ((event: GitChangeEvent) => void) | null = null;
  private workspacePath: string;
  private isEnabled: boolean = false;
  private git: any;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.git = simpleGit(workspacePath);
    this.initialize();
  }

  /**
   * 초기화
   */
  private async initialize(): Promise<void> {
    try {
      // 현재 HEAD 해시 저장
      const status = await this.git.log(['-1', '--pretty=format:%H']);
      if (status && status.length > 0) {
        this.lastHeadHash = status;
      }
    } catch (error) {
      console.error('GitChangeDetector 초기화 오류:', error);
    }
  }

  /**
   * Git 변경 감시 시작
   * @param callback 변경 감지 시 호출할 콜백
   */
  public watchForChanges(
    callback: (event: GitChangeEvent) => void
  ): void {
    this.changeCallback = callback;
    this.isEnabled = true;

    // .git 디렉토리 감시
    const gitPath = path.join(this.workspacePath, '.git');
    this.watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(this.workspacePath, '.git/**'),
      false, // ignoreCreateEvents
      false, // ignoreChangeEvents
      false  // ignoreDeleteEvents
    );

    // 파일 변경 감지
    this.watcher.onDidChange((uri) => {
      this.handleGitChange(uri);
    });

    this.watcher.onDidCreate((uri) => {
      this.handleGitChange(uri);
    });

    this.watcher.onDidDelete((uri) => {
      this.handleGitChange(uri);
    });

    console.log('✅ Git 변경 감시 시작:', gitPath);
  }

  /**
   * Git 변경 처리 (디바운싱)
   */
  private handleGitChange(uri: vscode.Uri): void {
    // 기존 타이머 취소
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 새 타이머 설정
    this.debounceTimer = setTimeout(async () => {
      await this.detectGitChange(uri);
    }, this.debounceDelay);
  }

  /**
   * 실제 Git 변경 감지
   */
  private async detectGitChange(uri: vscode.Uri): Promise<void> {
    try {
      const filePath = uri.fsPath;
      const fileName = path.basename(filePath);

      // HEAD 파일 변경 감지 = 커밋 또는 브랜치 변경
      if (fileName === 'HEAD' || filePath.includes('objects')) {
        await this.detectCommitOrBranch();
        return;
      }

      // refs 파일 변경 = 브랜치 변경
      if (filePath.includes('refs')) {
        await this.detectBranchChange();
        return;
      }

      // index 파일 변경 = 스테이징 변경
      if (fileName === 'index') {
        await this.detectFileChange();
        return;
      }

      // stash 변경
      if (filePath.includes('stash')) {
        this.emitChange({
          type: 'stash',
          message: 'Stash 변경 감지됨',
          timestamp: new Date()
        });
        return;
      }
    } catch (error) {
      console.error('Git 변경 감지 오류:', error);
    }
  }

  /**
   * 커밋 또는 브랜치 변경 감지
   */
  private async detectCommitOrBranch(): Promise<void> {
    try {
      const currentHeadHash = await this.git.log(['-1', '--pretty=format:%H']);

      if (currentHeadHash && currentHeadHash !== this.lastHeadHash) {
        this.lastHeadHash = currentHeadHash;

        // 최근 커밋 메시지 가져오기
        const commitMessage = await this.git.log(['-1', '--pretty=format:%s']);

        this.emitChange({
          type: 'commit',
          message: `새 커밋: ${commitMessage}`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('커밋 감지 오류:', error);
    }
  }

  /**
   * 브랜치 변경 감지
   */
  private async detectBranchChange(): Promise<void> {
    try {
      const currentBranch = await this.git.revparse(['--abbrev-ref', 'HEAD']);

      this.emitChange({
        type: 'branch',
        message: `브랜치 변경: ${currentBranch.trim()}`,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('브랜치 변경 감지 오류:', error);
    }
  }

  /**
   * 파일 변경 감지
   */
  private async detectFileChange(): Promise<void> {
    try {
      const status = await this.git.status();

      const totalChanges =
        (status.staged?.length || 0) +
        (status.modified?.length || 0) +
        (status.created?.length || 0) +
        (status.deleted?.length || 0);

      if (totalChanges > 0) {
        this.emitChange({
          type: 'file',
          message: `${totalChanges}개 파일 변경 감지`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('파일 변경 감지 오류:', error);
    }
  }

  /**
   * 변경 이벤트 발행
   */
  private emitChange(event: GitChangeEvent): void {
    if (this.changeCallback) {
      this.changeCallback(event);
    }
  }

  /**
   * 감시 중지
   */
  public dispose(): void {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isEnabled = false;
    console.log('❌ Git 변경 감시 중지');
  }

  /**
   * 감시 상태 확인
   */
  public isWatching(): boolean {
    return this.isEnabled;
  }

  /**
   * 디바운스 지연 시간 설정
   */
  public setDebounceDelay(delayMs: number): void {
    this.debounceDelay = Math.max(100, delayMs); // 최소 100ms
  }

  /**
   * 마지막 변경 시간 확인
   */
  public getLastCheckTime(): number {
    return this.lastCheckTime;
  }
}
