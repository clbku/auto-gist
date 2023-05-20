import * as vscode from 'vscode';
import { bumpVersion } from './subscriptions/bumpVersion';
import { conventionCommit } from './subscriptions/conventionCommit';
import { ConventionViewProvider } from './view/ConventionView';
import { AutoVersioningProvider } from './view/AutoVersioningView';
import { GitgraphPanel } from './view/GitGraphView';
import { COMMANDS } from './constant';

const cats = {
  'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
  'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
};


export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
    bumpVersion, 
    conventionCommit
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.GIT_GRAPH, () => {
      new GitgraphPanel(context);
    })
  );

  const conventionViewProvider = new ConventionViewProvider(context);
  const autoVersioningProvider = new AutoVersioningProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ConventionViewProvider.viewType, conventionViewProvider),
    vscode.window.registerWebviewViewProvider(AutoVersioningProvider.viewType, autoVersioningProvider),
  );
}

export function deactivate() {}