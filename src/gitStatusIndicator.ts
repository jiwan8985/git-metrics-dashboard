/**
 * Git 상태 표시기
 * 대시보드에 실시간 Git 상태와 최근 변경사항을 표시합니다
 */

import * as vscode from 'vscode';
import simpleGit from 'simple-git';

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
  private maxHistorySize: number = 50;
  private statusBar: vscode.StatusBarItem | null = null;
  private git: any;

  constructor(workspacePath: string) {
    this.git = simpleGit(workspacePath);
    this.initializeStatusBar();
  }

  /**
   * 상태바 초기화
   */
  private initializeStatusBar(): void {
    this.statusBar = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBar.name = 'Git Metrics Auto Refresh';
    this.updateStatusBar();
    this.statusBar.show();
  }

  /**
   * 상태바 업데이트
   */
  private updateStatusBar(): void {
    if (!this.statusBar) {return;}

    if (this.status.isWatching) {
      const lastChange = this.status.lastChangeTime
        ? this.getTimeAgo(this.status.lastChangeTime)
        : '시작됨';

      this.statusBar.text = `🔄 Git 실시간 감시 (${lastChange})`;
      this.statusBar.tooltip = `
        📡 상태: 활성화
        마지막 변경: ${this.status.lastChangeMessage}
        브랜치: ${this.status.currentBranch}
        변경파일: ${this.status.stagedChanges + this.status.unstagedChanges}
      `;
      this.statusBar.backgroundColor = new vscode.ThemeColor(
        'gitDecoration.addedResourceForeground'
      );
    } else {
      this.statusBar.text = '⏸️ Git 실시간 감시 비활성화';
      this.statusBar.tooltip = 'Git Metrics 설정에서 활성화할 수 있습니다';
      this.statusBar.backgroundColor = undefined;
    }
  }

  /**
   * 시간 계산 (얼마 전?)
   */
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {return '방금 전';}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)}분 전`;}
    if (seconds < 86400) {return `${Math.floor(seconds / 3600)}시간 전`;}
    return `${Math.floor(seconds / 86400)}일 전`;
  }

  /**
   * 감시 시작
   */
  public async startWatching(): Promise<void> {
    this.status.isWatching = true;
    await this.updateCurrentStatus();
    this.updateStatusBar();
    console.log('✅ Git 상태 표시기 시작');
  }

  /**
   * 감시 중지
   */
  public stopWatching(): void {
    this.status.isWatching = false;
    this.updateStatusBar();
    console.log('❌ Git 상태 표시기 중지');
  }

  /**
   * Git 변경 기록
   */
  public async recordChange(
    type: string,
    message: string
  ): Promise<void> {
    this.status.lastChangeTime = new Date();
    this.status.lastChangeType = type;
    this.status.lastChangeMessage = message;

    // 이벤트 히스토리에 추가
    const event: GitEvent = {
      timestamp: new Date(),
      type,
      message
    };

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // 현재 상태 업데이트
    await this.updateCurrentStatus();
    this.updateStatusBar();
  }

  /**
   * 현재 상태 업데이트
   */
  private async updateCurrentStatus(): Promise<void> {
    try {
      // 현재 브랜치
      const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      this.status.currentBranch = branch.trim();

      // 파일 변경 상태
      const gitStatus = await this.git.status();
      this.status.stagedChanges = gitStatus.staged?.length || 0;
      this.status.unstagedChanges = gitStatus.modified?.length || 0;
      this.status.untrackedFiles = gitStatus.untracked?.length || 0;
    } catch (error) {
      console.error('Git 상태 업데이트 오류:', error);
    }
  }

  /**
   * 상태 조회
   */
  public getStatus(): GitStatus {
    return { ...this.status };
  }

  /**
   * 이벤트 히스토리 조회
   */
  public getEventHistory(): GitEvent[] {
    return [...this.eventHistory];
  }

  /**
   * 최근 N개 이벤트 조회
   */
  public getRecentEvents(count: number = 10): GitEvent[] {
    return this.eventHistory.slice(0, count);
  }

  /**
   * 상태를 HTML로 반환 (대시보드에 표시용)
   */
  public generateStatusHTML(): string {
    const status = this.getStatus();
    const recentEvents = this.getRecentEvents(5);

    return `
      <div class="git-status-indicator">
        <div class="status-header">
          <h3>🔄 실시간 감시 상태</h3>
          <span class="status-badge ${status.isWatching ? 'active' : 'inactive'}">
            ${status.isWatching ? '활성화' : '비활성화'}
          </span>
        </div>

        <div class="status-info">
          <div class="info-item">
            <span class="label">현재 브랜치:</span>
            <span class="value">${this.escapeHtml(status.currentBranch)}</span>
          </div>
          <div class="info-item">
            <span class="label">스테이징된 파일:</span>
            <span class="value">${status.stagedChanges}</span>
          </div>
          <div class="info-item">
            <span class="label">수정된 파일:</span>
            <span class="value">${status.unstagedChanges}</span>
          </div>
          <div class="info-item">
            <span class="label">추적되지 않는 파일:</span>
            <span class="value">${status.untrackedFiles}</span>
          </div>
        </div>

        ${status.lastChangeTime ? `
          <div class="last-change">
            <strong>마지막 변경:</strong>
            <div class="change-detail">
              <span class="type">[${this.escapeHtml(status.lastChangeType)}]</span>
              <span class="message">${this.escapeHtml(status.lastChangeMessage)}</span>
              <span class="time">${this.getTimeAgo(status.lastChangeTime)}</span>
            </div>
          </div>
        ` : ''}

        ${recentEvents.length > 0 ? `
          <div class="recent-events">
            <strong>최근 변경 이벤트:</strong>
            <ul>
              ${recentEvents.map(event => `
                <li>
                  <span class="time">${event.timestamp.toLocaleTimeString()}</span>
                  <span class="type">[${this.escapeHtml(event.type)}]</span>
                  <span class="message">${this.escapeHtml(event.message)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <style>
          .git-status-indicator {
            margin-top: 20px;
            padding: 16px;
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
          }

          .status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .status-header h3 {
            margin: 0;
            font-size: 16px;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .status-badge.active {
            background-color: var(--success-color);
            color: white;
          }

          .status-badge.inactive {
            background-color: var(--border-color);
            color: var(--foreground);
          }

          .status-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }

          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
          }

          .info-item .label {
            font-weight: 600;
          }

          .info-item .value {
            color: var(--primary-color);
          }

          .last-change {
            padding: 12px;
            margin-bottom: 16px;
            background-color: var(--bg-primary);
            border-left: 3px solid var(--primary-color);
          }

          .change-detail {
            margin-top: 8px;
            display: flex;
            gap: 8px;
            align-items: center;
            font-size: 12px;
          }

          .change-detail .type {
            background-color: var(--border-color);
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
          }

          .change-detail .time {
            color: var(--foreground);
            opacity: 0.7;
            margin-left: auto;
          }

          .recent-events {
            padding-top: 12px;
            border-top: 1px solid var(--border-color);
          }

          .recent-events ul {
            list-style: none;
            padding: 0;
            margin: 8px 0 0 0;
          }

          .recent-events li {
            padding: 8px 0;
            font-size: 12px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .recent-events li:last-child {
            border-bottom: none;
          }

          .recent-events .time {
            color: var(--foreground);
            opacity: 0.6;
            min-width: 60px;
          }

          .recent-events .type {
            background-color: var(--border-color);
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 600;
            min-width: 60px;
            text-align: center;
          }

          .recent-events .message {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        </style>
      </div>
    `;
  }

  /**
   * HTML 이스케이프
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * 정리
   */
  public dispose(): void {
    if (this.statusBar) {
      this.statusBar.dispose();
      this.statusBar = null;
    }
    this.eventHistory = [];
    console.log('🧹 Git 상태 표시기 정리 완료');
  }
}
