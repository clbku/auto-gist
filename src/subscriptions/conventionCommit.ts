import * as vscode from 'vscode';
import { execGit } from '../helpers/git';
import { COMMANDS } from '../constant';
// import { newLine } from '../helpers/os';

const subscription = async (data: any) => {
  const {
    type,
    scope,
    isBreaking,
    subject,
    linkTo,
    ticketId,
    footerGen,
    module = 'main',
  } = data.convention;
  const push = data.push;

  const title = `${type}${scope ? `(${scope})` : ''}${isBreaking ? '!' : ''}: ${subject}`;
  const description = data.convention.description.replace(/'/g, "'").replace(/"/g, '"');
  const footer = `${linkTo ? `${linkTo}: ${ticketId}` : ''}`;

  // const message = `${title}${newLine(2)}${description}${newLine(2)}${footer}`;
  process.env.ComSpec = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  let commitMessage = `git ${module !== 'main' ? `-C ${module}` : ''} commit`;

  if (title !== '') {
    commitMessage += ` -m "${title}"`;
  }
  if (description !== '') {
    commitMessage += ` -m "${description}"`;
  }
  if (footer !== '') {
    commitMessage += ` -m "${footer}"`;
  }
  if (footerGen !== '') {
    commitMessage += ` -m "${footerGen}"`;
  }

  try {
    await execGit(commitMessage);

    if (push) {
      const upstream = await execGit(
        `git ${module !== 'main' ? `-C ${module}` : ''} rev-parse --abbrev-ref HEAD`
      );
      await execGit(
        `git ${module !== 'main' ? `-C ${module}` : ''} push --set-upstream origin ${upstream}`
      );
    }
    vscode.window.showInformationMessage(`Complete!`);
  } catch (e: any) {
    vscode.window.showErrorMessage(e.message);
  }
};

export const conventionCommit = vscode.commands.registerCommand(COMMANDS.COMMIT, subscription);
