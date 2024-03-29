import * as vscode from 'vscode';
import * as path from 'path';
import { VIEWS } from '../constant';
import { CommonMessage, Message } from '../type';
import { getGitTree } from '../helpers/git';

export class GitgraphPanel {
  private _panel?: vscode.WebviewPanel;

  constructor(private readonly _context: vscode.ExtensionContext) {
    this._panel = vscode.window.createWebviewPanel(
      VIEWS.GIT_GRAPH,
      'Git graph',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    );

    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app'))],
    };

    this._panel.webview.onDidReceiveMessage((message: Message) => {
      switch (message.type) {
        case 'get-commits': {
          getGitTree().then(commits => {
            this.postMessageToWebview({ type: 'get-commits', commits });
          });
          break;
        }
        default: {
        }
      }
    });

    this._update();
  }

  public postMessageToWebview<T extends Message = Message>(message: T) {
    // post message from extension to webview
    this._panel?.webview.postMessage(message);
  }

  private _update() {
    if (this._panel) {
      this._panel.webview.html = this._getHtmlForWebview();
    }
  }

  private _getHtmlForWebview() {
    const bundleScriptPath = this._panel?.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app', 'bundle.js'))
    );

    const codiconUri = this._panel?.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._context.extensionPath, 'medias', 'codicon.css'))
    );

    return `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>React App</title>
                <link rel="stylesheet" href="${codiconUri}" />
                </head>
          
              <body>
                <div id="root"></div>
                <script>
                  const vscode = acquireVsCodeApi();
                  const appType = "git-graph";
                </script>
                <script src="${bundleScriptPath}"></script>
              </body>
            </html>
          `;
  }
}
