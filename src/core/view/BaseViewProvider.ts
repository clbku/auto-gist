import * as vscode from 'vscode';

type Message = {
  type: string;
  payload?: any;
};

export interface BaseViewProvider extends vscode.WebviewViewProvider {
  postMessageToWebview<T extends Message = Message>(message: T): void;
}
