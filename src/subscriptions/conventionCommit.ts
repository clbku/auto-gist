import * as vscode from 'vscode';
import { CommitType } from '../type';
import { execGit } from '../helpers/git';
import { COMMANDS } from '../constant';

const subscription = async (data: any) => {
  const { type, scope, isBreaking, subject, description = '', linkTo, ticketId } = data;

  const message = `${type}${scope ? `(${scope})` : ''}${
    isBreaking ? '!' : ''
  }: ${subject}\n\n${description}${linkTo ? `\n\nRefer-to-${linkTo}: ${ticketId}` : ''}`;

  try {
    await execGit(`git commit -m "${message}"`);
    vscode.window.showInformationMessage(`Complete!`);
  } catch (e: any) {
    vscode.window.showErrorMessage(e.message);
  }
};

export const conventionCommit = vscode.commands.registerCommand(COMMANDS.COMMIT, subscription);
