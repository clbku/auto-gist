export type Commit = {
  hash: string;
  type: CommitType;
  scope?: string;
  subject: string;
  isBreaking?: boolean;
  footer?: { [key: string]: string };
  submodule?: string;
};

export type CommitType = "feat" | "fix" | "docs" | "style" | "refactor" | "perf" | "test" | "build" | "ci" | "chore" | "revert";


export interface Message {
  type: string;
  payload?: any;
}

export interface CommonMessage extends Message {
  type: string;
  payload: any;
}

export interface ReloadMessage extends Message {
  type: 'RELOAD';
}