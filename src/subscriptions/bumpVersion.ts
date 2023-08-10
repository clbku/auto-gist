import * as vscode from "vscode";
import { readFile, writeFile, getFilePath } from "../helpers/file";
import { commitVersion, getCommitMessages, getGitHost, getLatestTag } from "../helpers/git";
import { COMMANDS } from '../constant';
import { Commit, CommitType } from '../type';

const typeMapping = {
  feat: 'Features',
  fix: 'Bugs fixed',
  docs: 'Documents',
  style: 'Styles',
  refactor: 'Refactors',
  perf: 'Performances',
  test: 'Testing',
  build: 'Build',
  ci: 'CI/CD',
  chore: 'Chores',
  revert: 'Reverts',
};

const subscription = async (data: any) => {
  const {
    version: customVersion,
    autoTag,
    filter = [],
    versionPrefix,
    types = ['fix', 'feat'],
  } = data;
  try {
    const latestTag = await getLatestTag(versionPrefix);

    const [commitMessages, host] = await Promise.all([
      getCommitMessages(latestTag.tag),
      getGitHost(),
    ]);

    const commitGroups: Record<CommitType, string[]> = (Object.keys(typeMapping) as any).reduce(
      (pre: Record<CommitType, Commit[]>, cur: CommitType) => {
        pre[cur] = [];
        return pre;
      },
      {}
    );

    const breakingChanges = [];
    const submodules: Record<string, string[]> = {};
    let filteredCommits = commitMessages;

    if (filter.length > 0) {
      filteredCommits = [];
      for (const commit of commitMessages) {
        const { footer } = commit;
        for (const customFilter of filter) {
          if (footer && footer[customFilter.toLowerCase()] !== undefined) {
            filteredCommits.push(commit);
          }
        }
      }
    }

    for (const commit of filteredCommits) {
      const { hash, type, scope, subject, isBreaking, footer, submodule } = commit;

      let ticketUrl = `${host}/commit/${hash}`;
      if (footer?.mantis) {
        ticketUrl = `https://testing.vietbando.net/mantisbt/view.php?id=${footer.mantis}`;
      }
      if (footer?.jira) {
        ticketUrl = `https://vietbando.atlassian.net/browse/${footer.jira}`;
      }

      const formattedMessage =
        `${submodule && isBreaking ? '- ⚡ ' : '- '}` +
        (scope
          ? `**${scope}:** ${subject} ([\`${
              footer?.jira ?? footer?.mantis ?? hash.slice(0, 6)
            }\`](${ticketUrl}))`
          : `${subject} ([\`${
              footer?.jira ?? footer?.mantis ?? hash.slice(0, 6)
            }\`](${ticketUrl}))`);

      if (submodule) {
        submodules[submodule]
          ? submodules[submodule].push(formattedMessage)
          : (submodules[submodule] = [formattedMessage]);
      } else if (isBreaking) {
        breakingChanges.push(formattedMessage);
      } else {
        if ((types as string[]).includes(type)) {
          commitGroups[type].push(formattedMessage);
        }
      }
    }

    let newVersion = customVersion;

    if (!newVersion) {
      const { version: currentVersion } = latestTag;
      let [major, minor, build] = currentVersion.split('.').map(Number);

      if (breakingChanges.length) {
        major += 1;
        minor = 0;
        build = 0;
      } else if (commitGroups.feat.length) {
        minor += 1;
        build = 0;
      } else {
        build += 1;
      }

      newVersion = `${major}.${minor}.${build}`;
    }

    const currentChangelog = readFile('./CHANGELOG.md');
    const newChangelog =
      `# ${versionPrefix}${newVersion} (${new Date().toISOString().slice(0, 10)})\n\n` +
      (breakingChanges.length > 0
        ? `## ⚡⚡⚡BREAKING CHANGES⚡⚡⚡\n\n${breakingChanges.join('\n')}\n\n`
        : '') +
      Object.keys(commitGroups)
        .map(group => {
          return commitGroups[group as CommitType].length > 0
            ? `## ${typeMapping[group as CommitType]}\n\n${commitGroups[group as CommitType].join(
                '\n'
              )}\n\n`
            : '';
        })
        .join('') +
      `## Packages\n\n${Object.keys(submodules)
        .map(submodule => {
          return submodules[submodule].length > 0
            ? ` ### ${submodule}\n\n${submodules[submodule].join('\n')}\n\n`
            : '';
        })
        .join('')}\n\n`;
    // (features.length > 0 ?  +
    // (chores.length > 0 ? `## Chores\n\n${chores.join('\n')}\n\n` : '') +
    // (fixes.length > 0 ? `## Bugs fixed\n\n${fixes.join('\n')}\n\n` : '');

    writeFile('./CHANGELOG.md', `${newChangelog}${currentChangelog}`);
    writeFile('./version.json', `{"version": "${newVersion}"}`);

    await commitVersion(newVersion, autoTag, versionPrefix);

    vscode.window.showTextDocument(vscode.Uri.file(getFilePath('./CHANGELOG.md')));

    vscode.window.showInformationMessage(`Complete!`);
  } catch (e: any) {
    vscode.window.showErrorMessage(`Error: ${e.message}`);
    return;
  }
};

export const bumpVersion = vscode.commands.registerCommand(
	COMMANDS.BUMP_VERSION,
	subscription
);