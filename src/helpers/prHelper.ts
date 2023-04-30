import * as exec from "@actions/exec";
import { execCommand } from "./utility";
import { getCurrentBranchName } from "./git";

export async function createPullRequest(
    createPrForBranchName: string,
    body: string
): Promise<string> {
    return getCurrentBranchName()
        .then(currentBranchName =>
            createOrUpdatePr(createPrForBranchName, currentBranchName, body)
        )
        .then(output => {
            const link = getPrLink(output.stdout);
            if (!link)
                throw new Error(
                    `Failed to extract pull request URL from command output.\nOutput: ${output.stdout}`
                );
            return link;
        });
}

function createOrUpdatePr(
    createPrForBranchName: string,
    currentBranchName: string,
    body: string
): Promise<exec.ExecOutput> {
    return execCommand(
        `gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body ${body}`,
        `Create pull request from ${currentBranchName} to ${createPrForBranchName} with title 'Merge ${currentBranchName} into ${createPrForBranchName}' failed.`
    ).catch(e => {
        const message = e instanceof Error ? e.message : e.toString();
        if (message.toLowerCase().includes("already exists")) {
            const prLink = getPrLink(message);
            if (!prLink) {
                throw new Error(
                    `I tried to make a pull request from ${currentBranchName} to ${createPrForBranchName} but it didn't work. It seems that this pull request exists. I tried to find the link in the message, but I didn't succeed.`
                );
            }
            return updatePr(prLink, body);
        }
        return e;
    });
}

function getPrLink(str: string): string | null {
    const regex = /(https*:\/\/)?github\.com\/\S+\/\S+\/pull\/\d+/;
    const urlMatch = str.match(regex);
    return urlMatch ? urlMatch[0] : null;
}

function updatePr(
    prLinkOrNumber: string,
    body: string
): Promise<exec.ExecOutput> {
    return execCommand(
        `gh pr edit ${prLinkOrNumber} --body ${body}`,
        `Update pull request '${prLinkOrNumber}' failed.`
    );
}
