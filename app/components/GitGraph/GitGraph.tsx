import { Gitgraph } from "@gitgraph/react";
import { getLatestTag, getCommitMessages } from "../../../src/helpers/git";
import './style.css';


export const GitGraph = () => {

    const addGitGraph = (gitgraph: any) => {
        // const latestTag = await getLatestTag();	
        // const [commitMessages] = await Promise.all([
		// 	getCommitMessages(latestTag.tag),
		// ]);
        const master = gitgraph.branch("master");
        master.commit("Init the project");
        master
        .commit("Add README")
        .commit("Add tests")
        .commit("Implement feature");
        master.tag("v1.0");
        const newFeature = gitgraph.branch("new-feature");
        newFeature.commit("Implement an awesome feature");
        master.commit("Hotfix a bug");
        newFeature.commit("Fix tests");
        master.merge(newFeature, "Release new version");
    };

    return <div className="git-graph">
        <Gitgraph>{(gitgraph) => addGitGraph(gitgraph)}</Gitgraph>;
    </div>;
}