import * as fs from "fs";
import {workspace} from "vscode";

export const getFilePath = (fileName: string) => {
    const rootPath = workspace.workspaceFolders?.[0].uri.path;

    if (fileName.startsWith("./")) {
        fileName.replace("./", "");
    }

    return rootPath + "/" + fileName;
};

export const readFile = (fileName: string) => {
    const filePath = getFilePath(fileName); 

    return fs.readFileSync(filePath, 'utf-8');
};

export const writeFile = (fileName: string, data: string) => {
    const filePath = getFilePath(fileName); 
    
    return fs.writeFileSync(filePath, data);
};

