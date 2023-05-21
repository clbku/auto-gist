import * as vscode from 'vscode';
import * as path from 'path';
import { CommonMessage, Message } from '../type';
import { COMMANDS, VIEWS } from '../constant';
import { BaseViewProvider } from '../core/view/BaseViewProvider';

export class AutoVersioningProvider implements BaseViewProvider {
  public static readonly viewType = VIEWS.BUMP_VERSION;

  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  postMessageToWebview(message: Message): void {
    throw new Error('Method not implemented.');
  }

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;
    this._view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'app'))],
    };

    this._view.webview.onDidReceiveMessage((message: Message) => {
      const payload = (message as CommonMessage).payload;
      vscode.commands.executeCommand(COMMANDS.BUMP_VERSION, payload);
    });

    this._update();
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

    return `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>React App</title>
              </head>
          
              <body>
                <div id="root"></div>
                <script>
                  const vscode = acquireVsCodeApi();
                  const appType = "auto-versioning";
                </script>
                <script src="${bundleScriptPath}"></script>
              </body>
            </html>
          `;
  }
}
