import * as vscode from 'vscode';
import { execGit } from '../helpers/git';
import { COMMANDS } from '../constant';
import { newLine } from '../helpers/os';

const subscription = async (data: any) => {
  const { type, scope, isBreaking, subject, linkTo, ticketId, footerGen } = data;

  const title = `${type}${scope ? `(${scope})` : ''}${isBreaking ? '!' : ''}: ${subject}`;
  const description = data.description.replace(/'/g, "'").replace(/"/g, '"');
  const footer = `${linkTo ? `Refer-to-${linkTo}: ${ticketId}` : ''}`;

  const message = `${title}${newLine(2)}${description}${newLine(2)}${footer}`;
  process.env.ComSpec = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
  let commitMessage = "git commit";
  if (title !== "") {
    commitMessage += ` -m "${title}"`;
  }
  if (description !== "") {
    commitMessage += ` -m "${description}"`;
  }
  if (footer !== "") {
    commitMessage += ` -m "${footer}"`;
  }
  if (footerGen !== "") {
    commitMessage += ` -m "${footerGen}"`;
  }

  try {
    
    await execGit(commitMessage);
    vscode.window.showInformationMessage(`Complete!`);
  } catch (e: any) {
    vscode.window.showErrorMessage(e.message);
  }
};

export const conventionCommit = vscode.commands.registerCommand(COMMANDS.COMMIT, subscription);
