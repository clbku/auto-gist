import * as fs from "fs";
import {workspace} from "vscode";
import * as path from 'path';

export const getRootPath = () => {
  if (!workspace.workspaceFolders?.length) {
    return '';
  }
  // Retrieve the workspace folder
  const workspaceFolder = workspace.workspaceFolders[0];

  // Get the absolute path of the workspace folder
  const workspaceFolderPath = workspaceFolder.uri.fsPath;

  // Convert to the appropriate path format
  const normalizedPath = path.normalize(workspaceFolderPath);

  return normalizedPath;
};

export const getFilePath = (fileName: string) => {
  const rootPath = getRootPath();

  if (fileName.startsWith('./')) {
    fileName.replace('./', '');
  }

  return rootPath + '/' + fileName;
};

export const readFile = (fileName: string) => {
  const filePath = getFilePath(fileName);

  return fs.readFileSync(filePath, 'utf-8');
};

export const writeFile = (fileName: any, data: string) => {
  const filePath = getFilePath(fileName);

  return fs.writeFileSync(filePath, data);
};