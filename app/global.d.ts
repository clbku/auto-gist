type Message = import('../src/type').Message;

type VSCode = {
  postMessage<T extends Message = Message>(message: T): void;
  getState(): any;
  setState(state: any): void;
};

declare const vscode: VSCode;
declare const appType: "auto-versioning" | "convention-commit" | "git-graph";

declare const apiUserGender: string;
