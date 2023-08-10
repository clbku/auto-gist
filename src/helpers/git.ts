import { exec } from 'child_process';
import * as tmp from 'tmp';
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
  let command = `git log --oneline --pretty=format:"%H|%s|%b----separation----"`;
  if (to) {
    command = `git log ${to}..${from} --oneline --pretty=format:"%H|%s|%b----separation----"`;
  }

  try {
    let stdout = await execGit(command);
    let commitObjects = convertCommitsToObject(stdout);

    stdout = await execGit(
      `git submodule foreach 'echo "----submodule-start----"; git log --oneline --pretty=format:"%H|%s|%b----separation----" $(git -C ${getRootPath()} rev-parse ${to}:$path)..$(git -C ${getRootPath()} rev-parse ${from}:$path); echo "----submodule-start----"'`
    );

    const lines = stdout.split('----submodule-start----\n');
    let currentSubmodule = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!line) {
        continue;
      }

      if (line.startsWith('Entering')) {
        const [, submodule] = line.split("'").map(s => s.trim());

        if (submodule !== currentSubmodule) {
          currentSubmodule = submodule;
        }

        continue;
      }

      const commits = convertCommitsToObject(line);
      commitObjects = [
        ...commitObjects,
        ...commits.map(commit => ({ ...commit, submodule: currentSubmodule })),
      ];
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
    await execGit('git add CHANGELOG.md version.json packages apps/storybook');
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
      res[tmp.toLowerCase()] = value;
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

export const getGitStatus = async (module = 'main') => {
  try {
    const stdout = await execGit(`git ${module !== 'main' ? `-C ${module}` : ''} status -s`);

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

export const getGitModules = async () => {
  try {
    const output = await execGit(`git submodule --quiet foreach --recursive 'echo $path'`);
    const lines = output.trim().split('\n')?.filter(Boolean);

    return lines;
  } catch (e) {
    throw e;
  }
};

export const gitAddChanges = async (fileName = '-A', module = 'main') => {
  try {
    await execGit(`git ${module !== 'main' ? `-C ${module}` : ''} add ${fileName}`);
    return await getGitStatus(module);
  } catch (e) {
    throw e;
  }
};

export const gitResetChanges = async (fileName = '', module = 'main') => {
  try {
    await execGit(
      `git ${module !== 'main' ? `-C ${module}` : ''} reset ${fileName ? `-- ${fileName}` : ''}`
    );
    return await getGitStatus(module);
  } catch (e) {
    throw e;
  }
};

export const gitDiscardChange = async (fileName = '.', module = 'main') => {
  try {
    await execGit(`git  ${module !== 'main' ? `-C ${module}` : ''} restore ${fileName}`);

    if (fileName === '.') {
      await execGit(`git clean -df`);
    }

    return await getGitStatus(module);
  } catch (e) {
    throw e;
  }
};

export const getFileFromCommit = async (fileName: string, commit = 'HEAD', module = 'main') => {
  try {
    const fileContent = await execGit(
      `git ${module !== 'main' ? `-C ${module}` : ''} show ${commit}:${fileName}`
    );

    return fileContent;
  } catch (e) {
    throw e;
  }
};

export const getGitTree = async () => {
  let command = `git log --all --date-order --pretty="%H|%P|%d|%s"`;
  const stdout = await execGit(command);

  const commitMessages = stdout.split('\n');

  return {
    main: commitMessages.map(commit => {
      const hash = commit.split('|')[0];
      const parent = commit.split('|')[1];
      const subject = commit.split('|')[2];

      return { hash, subject };
    }),
  };
};

const convertCommitsToObject = (stdout: string) => {
  const pattern = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\!)?(\(.+\))?(\!)?:(.+)$/;

  const commitMessages = stdout.split('----separation----\n');
  const commitObjects: Commit[] = [];

  for (const commit of commitMessages) {
    const hash = commit.split('|')[0];
    const header = commit.split('|')[1];
    const body = commit.split('|')[2]?.split('\n');

    const footers = getFooterFromCommit(body);
    const matches = header.match(pattern);

    if (!matches) {
      continue;
    }

    const type = matches[1] as CommitType;
    const isBreaking = Boolean(matches[2] || matches[4]);
    const scope = matches[3]?.replace(/\(|\)/g, '') ?? undefined;
    const subject = matches[5];

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
};