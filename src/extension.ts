import * as vscode from 'vscode';
import { bumpVersion } from './subscriptions/bumpVersion';
import { conventionCommit } from './subscriptions/conventionCommit';
import { ConventionViewProvider } from './view/ConventionView';
import { AutoVersioningProvider } from './view/AutoVersioningView';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
    bumpVersion, 
    conventionCommit
  );

  const conventionViewProvider = new ConventionViewProvider(context);
  const autoVersioningProvider = new AutoVersioningProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ConventionViewProvider.viewType, conventionViewProvider),
    vscode.window.registerWebviewViewProvider(AutoVersioningProvider.viewType, autoVersioningProvider)
  );
}

export function deactivate() {}
