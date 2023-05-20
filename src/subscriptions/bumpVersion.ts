import * as vscode from "vscode";
import { readFile, writeFile, getFilePath } from "../helpers/file";
import { commitVersion, getCommitMessages, getGitHost, getLatestTag } from "../helpers/git";
import { COMMANDS } from "../constant";
import { getPrefix } from "../helpers/prefix";

const VERSION_PREFIX = getPrefix("webviewReact", "userApiVersion", "c4i2/v");


const subscription = async (data: any) => {
	const { version: customVersion, autoTag, filter } = data;
	try {
		const latestTag = await getLatestTag();	

		const [commitMessages, host] = await Promise.all([
			getCommitMessages(latestTag.tag),
			getGitHost()
		]);

		const features = [];
		const fixes = [];
		const chores = [];
		const breakingChanges = [];
		let filteredCommits = commitMessages;

		if (filter !== "") {
			filteredCommits = [];
			for (const commit of commitMessages) {
				const { footer } = commit;
				for (const customFilter of filter) {
					if (footer && footer[customFilter] !== undefined) {
						filteredCommits.push(commit);
					}
				}

			}
		}
		
		for (const commit of filteredCommits) {
			const { hash, type, scope, subject, isBreaking, footer } = commit;

			let ticketUrl = `${host}/commit/${hash}`;
			if (footer?.mantisId) {
				ticketUrl = `https://testing.vietbando.net/mantisbt/view.php?id=${footer.mantisId}`;
			}
			if (footer?.jiraTicket) {
				ticketUrl = `https://vietbando.atlassian.net/browse/${footer.jiraTicket}`;
			}

			const formattedMessage = scope
				? `- **${scope}:** ${subject} ([\`${footer?.jiraTicket ?? footer?.mantisId ?? hash.slice(0, 6)}\`](${ticketUrl}))`
				: `- ${subject} ([\`${footer?.jiraTicket ?? footer?.mantisId ?? hash.slice(0, 6)}\`](${ticketUrl}))`;

			if (isBreaking) {
				breakingChanges.push(formattedMessage);
			}
			else {
				switch (type) {
					case 'feat': features.push(formattedMessage); break;
					case 'chore': chores.push(formattedMessage); break;
					case 'fix': fixes.push(formattedMessage); break;
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
			} else if (features.length) {
				minor += 1;
				build = 0;
			} else {
				build += 1;
			}

			newVersion = `${major}.${minor}.${build}`;
		}

		const currentChangelog = readFile('./CHANGELOG.md');
		const newChangelog = `# ${VERSION_PREFIX}${newVersion} (${new Date().toISOString().slice(0, 10)})\n\n` +
			(breakingChanges.length > 0 ? `## ⚡⚡⚡BREAKING CHANGES⚡⚡⚡\n\n${breakingChanges.join('\n')}\n\n` : '') +
			(features.length > 0 ? `## Features\n\n${features.join('\n')}\n\n` : '') +
			(chores.length > 0 ? `## Chores\n\n${chores.join('\n')}\n\n` : '') +
			(fixes.length > 0 ? `## Bugs fixed\n\n${fixes.join('\n')}\n\n` : '');

		writeFile("./CHANGELOG.md", `${newChangelog}${currentChangelog}`);
		writeFile("./version.json", `{"version": "${newVersion}"}`);

		await commitVersion(newVersion, autoTag);

		vscode.window.showTextDocument(vscode.Uri.file(getFilePath("./CHANGELOG.md")));

		vscode.window.showInformationMessage(
			`Complete!`
		);
	}
	catch (e: any) {
		vscode.window.showErrorMessage(
			`Error: ${e.message}`
		);
		return;
	}
};

export const bumpVersion = vscode.commands.registerCommand(
	COMMANDS.BUMP_VERSION,
	subscription
);