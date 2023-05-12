import { exec } from 'child_process';
import { workspace } from 'vscode';
import { VERSION_PREFIX } from '../config';
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

export const getLatestTag = async (): Promise<{version: string, tag: string}> => {
    try {
        const stdout = await execGit(`git describe --abbrev=0 --tags --match "${VERSION_PREFIX}*"`);
        const tag = stdout.trim();
            
        return { version: tag.replace(VERSION_PREFIX, ''), tag };
    }
    catch (e) {
        throw e;
    }
};

export const getCommitMessages = async (to?: string, from = "HEAD"): Promise<Commit[]> => {
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
			const hash = commit.split("|")[0];
			const header = commit.split("|")[1];
            const body = commit.split("|")[2];

			const matches = header.match(pattern);

			if (!matches) {continue;}

			const type = matches[1] as CommitType;
			const isBreaking = Boolean(matches[2] || matches[4]);
			const scope = matches[3]?.replace(/\(|\)/g, '') ?? undefined;
			const subject = matches[5];

            const mantisRegex = /(refer-to-mantis|mantis):\s*(\d+)/i;
            const jiraRegex = /(refer-to-jira|jira):\s*([A-Z\d-]+)/i;

            const mantisMatch = body.toLowerCase().match(mantisRegex);
            const jiraMatch = body.toLowerCase().match(jiraRegex);

            if (mantisMatch || jiraMatch || isBreaking ) {
                commitObjects.push({
                    hash,
                    type,
                    scope,
                    subject,
                    isBreaking,
                    footer: {
                        mantisId: mantisMatch ? parseInt(mantisMatch[2]) : undefined,
                        jiraTicket: jiraMatch ? jiraMatch[2] : undefined
                    }
                });
            }
		}

        return commitObjects;
    }
    catch (e) {
        throw e;
    }
};

export const getGitHost = async (): Promise<string> => {
    try {
        const stdout = await execGit(`git config --get remote.origin.url`);
            
        return `https://${stdout.trim()
                .toString()
                .replace(/^git@([^:]+):/, '$1/')
                .replace(/\.git$/, '')}`;
    }
    catch (e) {
        throw e;
    }
};

export const commitVersion = async (newVersion: string, autoTag: boolean = false): Promise<void> => {
    try {
        await execGit("git add -A");
        await execGit(`git commit -m "chore: Bump to version ${newVersion}"`);
        autoTag && await execGit(`git tag -a -m "Tag for version ${newVersion}" "${VERSION_PREFIX}${newVersion}" `);
        // await execGit("git push --tags");
    }
    catch (e) {
        throw e;
    }
};