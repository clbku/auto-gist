import * as vscode from 'vscode';

export const getPrefix = (extention: string, API: string, value: string) => {
    return vscode.workspace.getConfiguration().get(`${extention}.${API}`, `${value}`);
};