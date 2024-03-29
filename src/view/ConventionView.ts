import * as vscode from 'vscode';
import * as path from 'path';
import { CommonMessage, Message } from '../type';
import { COMMANDS, VIEWS } from '../constant';
import { BaseViewProvider } from '../core/view/BaseViewProvider';
import {
  getFileFromCommit,
  getGitModules,
  getGitStatus,
  gitAddChanges,
  gitDiscardChange,
  gitResetChanges,
} from '../helpers/git';
import { getFilePath } from '../helpers/file';

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
        case 'git-commit': {
          vscode.commands.executeCommand(COMMANDS.COMMIT, payload).then(() => {
            getGitStatus(payload.convention.module).then(statuses => {
              this.postMessageToWebview({ type: 'git-status', statuses });
            });
          });
          break;
        }
        case 'git-status': {
          getGitStatus(payload.module).then(statuses => {
            this.postMessageToWebview({ type: 'git-status', statuses });
          });
          break;
        }
        case 'git-modules': {
          getGitModules().then(modules => {
            this.postMessageToWebview({ type: 'git-modules', modules });
          });
          break;
        }
        case 'stage-changes': {
          gitAddChanges(payload.fileName, payload.module).then(statuses => {
            this.postMessageToWebview({ type: 'git-status', statuses });
          });
          break;
        }
        case 'unstage-changes': {
          gitResetChanges(payload.fileName, payload.module).then(statuses => {
            this.postMessageToWebview({ type: 'git-status', statuses });
          });
          break;
        }
        case 'discard-changes': {
          vscode.window
            .showInformationMessage(`Discard changes?`, { modal: true }, { title: 'Discard' })
            .then(answer => {
              if (answer) {
                gitDiscardChange(payload.fileName, payload.module).then(statuses => {
                  this.postMessageToWebview({ type: 'git-status', statuses });
                });
              }
            });
          break;
        }
        case 'compare-changes': {
          const gitFileProvider = new (class implements vscode.TextDocumentContentProvider {
            provideTextDocumentContent() {
              return getFileFromCommit(payload.fileName);
            }
          })();

          vscode.workspace.registerTextDocumentContentProvider('git-file', gitFileProvider);

          vscode.commands.executeCommand(
            'vscode.diff',
            vscode.Uri.parse(`git-file:${payload.fileName}.tsx`),
            vscode.Uri.file(getFilePath(payload.fileName))
          );

          break;
        }
        case 'open-file': {
          vscode.window.showTextDocument(vscode.Uri.file(getFilePath(payload.fileName)));
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
