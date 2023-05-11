export type Commit = {
  hash: string,
  type: CommitType,
  scope?: string,
  subject: string,
  isBreaking?: boolean,
  footer?: {
      mantisId?: number | string,
      jiraTicket?: string,
  }
};

export type CommitType = "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";

export type MessageType = 'RELOAD' | 'COMMON';

export interface Message {
  type: MessageType;
  payload?: any;
}

export interface CommonMessage extends Message {
  type: 'COMMON';
  payload: any;
}

export interface ReloadMessage extends Message {
  type: 'RELOAD';
}