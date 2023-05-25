import { exec } from 'child_process';
import * as path from 'path';
import { Commit, CommitType } from '../type';
import { getRootPath } from './file';

export const execGit = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: getRootPath() }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout);
    });
  });
};

export const getLatestTag = async (
  versionPrefix = ''
): Promise<{ version: string; tag: string }> => {
  try {
    const stdout = await execGit(`git describe --abbrev=0 --tags --match "${versionPrefix}*"`);
    const tag = stdout.trim();

    return { version: tag.replace(versionPrefix, ''), tag };
  } catch (e) {
    throw e;
  }
};

export const getCommitMessages = async (to?: string, from = 'HEAD'): Promise<Commit[]> => {
  let command = `git log --pretty=format:"%H %s %b----separation----"`;
  if (to) {
    command = `git log ${to}..${from} --oneline --pretty=format:"%H|%s|%b----separation----"`;
  }

  const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\!)?(\(.+\))?(\!)?:(.+)$/;

  try {
    const stdout = await execGit(command);

    const commitMessages = stdout.split('----separation----\n');
    const commitObjects: Commit[] = [];

    for (const commit of commitMessages) {
      const hash = commit.split('|')[0];
      const header = commit.split('|')[1];
      const body = commit.split('|')[2].split('\n');

      const footers = getFooterFromCommit(body);
      const matches = header.match(pattern);

      if (!matches) {
        continue;
      }

      const type = matches[1] as CommitType;
      const isBreaking = Boolean(matches[2] || matches[4]);
      const scope = matches[3]?.replace(/\(|\)/g, '') ?? undefined;
      const subject = matches[5];

      // const mantisRegex = /(refer-to-mantis|mantis):\s*([A-Z\d-]+)/i;
      // const jiraRegex = /(refer-to-jira|jira):\s*([A-Z\d-]+)/i;
      // let customMatch;

      // if (!body.toLowerCase().match(mantisRegex) && !body.toLowerCase().match(jiraRegex)) {
      //     customMatch = body.toLowerCase();
      // }

      // const mantisMatch = body.toLowerCase().match(mantisRegex);
      // const jiraMatch = body.toLowerCase().match(jiraRegex);

      // const footerMatch = body.toLocaleLowerCase().includes(filter.toLocaleLowerCase());

      commitObjects.push({
        hash,
        type,
        scope,
        subject,
        isBreaking,
        footer: footers,
      });
    }

    return commitObjects;
  } catch (e) {
    throw e;
  }
};

export const getGitHost = async (): Promise<string> => {
  try {
    const stdout = await execGit(`git config --get remote.origin.url`);

    return `https://${stdout
      .trim()
      .toString()
      .replace(/^git@([^:]+):/, '$1/')
      .replace(/\.git$/, '')}`;
  } catch (e) {
    throw e;
  }
};

export const commitVersion = async (
  newVersion: string,
  autoTag = false,
  versionPrefix = ''
): Promise<void> => {
  try {
    await execGit('git add -A');
    await execGit(`git commit -m "chore: Bump to version ${newVersion}"`);
    autoTag &&
      (await execGit(
        `git tag -a -m "Tag for version ${newVersion}" "${versionPrefix}${newVersion}" `
      ));
    // await execGit("git push --tags");
  } catch (e) {
    throw e;
  }
};

const getFooterFromCommit = (body: string[]) => {
  const Regex = /([A-Z\d][A-Z\d-]+):\s*([A-Z\d-]*)/i;
  let res: { [key: string]: string } = {};

  for (const element of body) {
    if (element.match(Regex) && element !== '') {
      const [key, value] = element.split(':').map(item => item.trim());
      const tmp = removeSpaces(key);
      res[tmp] = value;
    }
  }

  return res;
};

export const removeSpaces = (key: string): string => {
  const words = key.split('-');
  const firstWord = words.shift();
  if (!firstWord) {
    return '';
  }
  const remainingWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  return firstWord.toLowerCase() + remainingWords.join('');
};

export const getGitStatus = async () => {
  try {
    const stdout = await execGit(`git status -s`);

    const statuses = stdout.split('\n');

    return statuses.map(line => {
      const splitted = line.trim().split(' ');

      let status: string;
      let fileName: string;
      let isStaged: boolean;

      if (splitted.length === 2) {
        status = splitted[0];
        fileName = splitted[1];
        isStaged = false;
      } else {
        status = splitted[0];
        fileName = splitted[2];
        isStaged = true;
      }

      return { status: status === '??' ? 'A' : status, fileName, isStaged };
    });
  } catch (e) {
    throw e;
  }
};

export const gitAddChanges = async (fileName = '-A') => {
  try {
    await execGit(`git add ${fileName}`);
    return await getGitStatus();
  } catch (e) {
    throw e;
  }
};

export const gitResetChanges = async (fileName = '') => {
  try {
    await execGit(`git reset ${fileName ? `-- ${fileName}` : ''}`);
    return await getGitStatus();
  } catch (e) {
    throw e;
  }
};

export const gitDiscardChange = async (fileName = '.') => {
  try {
    await execGit(`git restore ${fileName}`);

    if (fileName === '.') {
      await execGit(`git clean -df`);
    }

    return await getGitStatus();
  } catch (e) {
    throw e;
  }
};

export const getFileFromCommit = async (fileName: string, commit = 'HEAD') => {
  try {
    const fileContent = await execGit(`git show ${commit}:${fileName}`);
    // return await createTempFile(
    //   fileContent,
    //   path.extname(fileName),
    //   getRootPath() + '/' + path.dirname(fileName)
    // );

    return fileContent;
  } catch (e) {
    throw e;
  }
};
