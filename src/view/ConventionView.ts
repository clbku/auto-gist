import * as vscode from 'vscode';
import * as path from 'path';
import { CommonMessage, Message } from '../type';
import { COMMANDS, VIEWS } from '../constant';
import { BaseViewProvider } from '../core/view/BaseViewProvider';
import { getGitStatus, gitAddChanges, gitResetChanges } from '../helpers/git';

export class ConventionViewProvider implements BaseViewProvider {
  public static readonly viewType = VIEWS.COMMIT;
  public static currentView: vscode.WebviewView;

  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    ConventionViewProvider.currentView = webviewView;

    this._view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app')),
        vscode.Uri.file(path.join(this._context.extensionPath, 'medias')),
      ],
    };

    this._view.webview.onDidReceiveMessage((message: Message) => {
      const payload = (message as CommonMessage).payload;

      switch (message.type) {
        case 'startup': {
          // vscode.commands.executeCommand(COMMANDS.GET_SOURCE_CHANGE);
          getGitStatus().then(statuses => {
            this.postMessageToWebview({ type: 'git-status', statuses });
          });
          break;
        }
        case 'stage-changes': {
          gitAddChanges(payload.fileName).then(statuses => {
            this.postMessageToWebview({ type: 'git-status', statuses });
          });
          break;
        }
        case 'unstage-changes': {
          gitResetChanges(payload.fileName).then(statuses => {
            this.postMessageToWebview({ type: 'git-status', statuses });
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
    this._view?.webview.postMessage(message);
  }

  private _update() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview();
    }
  }

  private _getHtmlForWebview() {
    const bundleScriptPath = this._view?.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app', 'bundle.js'))
    );

    const codiconUri = this._view?.webview.asWebviewUri(
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
                  const appType = "convention-commit";
                </script>
                <script src="${bundleScriptPath}"></script>
              </body>
            </html>
          `;
  }
}
