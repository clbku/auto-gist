import { Gitgraph } from "@gitgraph/react";
import './style.css';
import { useEffect, useState, useRef } from "react";
import { CommonMessage } from "../../../src/type";
import { ReactSvgElement } from "@gitgraph/react/lib/types";
import ReactDOM, { createPortal } from "react-dom";
import * as d3 from "d3";


export const GitGraph = () => {
    const [gitGraph, setGitGraph] = useState<any>();

    console.log(gitGraph);

    const drawGitGraph = (gitGraphInstance: any) => {

        if (gitGraph) {
            Object.keys(gitGraph).forEach((branch: any) => {
                const currentBranch = gitGraphInstance.branch(branch);
                for (const commit of gitGraph[branch]) {
                    currentBranch.commit(commit.subject);
                }
            });
        }
    };

    useEffect(() => {
        vscode.postMessage<CommonMessage>({
            type: "get-commits",
            payload: {}
        });


        window.addEventListener('message', (e) => {
            if (e.data.type === 'get-commits') {
                setGitGraph(() => e.data.commits);
            }
        });
    }, []);

    if (!gitGraph) { return <>Loading...</>; };

    return <div className="git-graph">
        <GitGraphDrawer />
    </div>;
};

const data = {
    id: "commit_hash_1",
    message: "Initial commit",
    children: [
        {
            id: "commit_hash_2",
            message: "Add file1.js",
            children: [
                {
                    id: "commit_hash_3",
                    message: "Add file2.js",
                    children: []
                },
                {
                    id: "commit_hash_4",
                    message: "Update file1.js",
                    children: [
                        {
                            id: "commit_hash_5",
                            message: "Add file2.js",
                            children: []
                        },
                        {
                            id: "commit_hash_6",
                            message: "Add file2.js",
                            children: []
                        }
                    ]
                },
                {
                    id: "commit_hash_7",
                    message: "Add file2.js",
                    children: []
                }
            ]
        }
    ]
};


const GitGraphDrawer: React.FC = () => {
    const svgRef = useRef(null);
    const indexRef = useRef(0);

    useEffect(() => {
        // Draw nodes
        renderNode(data);
    }, []);

    const renderNode = (tree: any, col = 0, parentCoordinates: { x: number, y: number } | undefined = undefined) => {
        const svg = d3.select(svgRef.current);

        const coordinates = {
            x: col * 40 + 10,
            y: 600 - indexRef.current * 40 - 10
        };

        svg
            .append("circle")
            .attr("class", "node")
            .attr("r", 10)
            .attr("cx", col * 40 + 10)
            .attr("cy", 600 - indexRef.current * 40 - 10)
            .style("fill", "#1f77b4");

        if (parentCoordinates) {
            const curve = d3.line().curve(d3.curveBasis);
            const points: [number, number][] = [
                [parentCoordinates.x, parentCoordinates.y],
                [coordinates.x, parentCoordinates.y],
                [coordinates.x, coordinates.y]
            ];
            svg
                .append("path")
                .attr("d", curve(points))
                .attr("stroke", "black")
                // with multiple points defined, if you leave out fill:none,
                // the overlapping space defined by the points is filled with
                // the default value of 'black'
                .style("stroke", "#999")
                .style("stroke-opacity", 0.6)
                .style("stroke-width", "2px")
                .attr("fill", "none");
        }

        indexRef.current++;

        console.log(tree);

        for (let i = 0; i < tree.children.length; i++) {
            const child = tree.children[tree.children.length - 1 - i];
            renderNode(child, col + tree.children.length - 1 - i, coordinates);
        }
    };

    return (
        <svg
            ref={svgRef}
            width="600"
            height="600"
            style={{ background: "#8080804f" }}
        />
    );
};