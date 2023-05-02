import * as exec from "@actions/exec";
import { execCommand } from "./utility";
import { getCurrentBranchName } from "./git";

export function createPullRequest(
    createPrForBranchName: string,
    body: string
): Promise<string> {
    return getCurrentBranchName()
        .then(currentBranchName =>
            createOrUpdatePr(createPrForBranchName, currentBranchName, body)
        )
        .then(output =>
            getPrLink(
                output.stdout,
                `Failed to extract pull request URL from command output.\nOutput: ${output.stdout}`
            )
        );
}

function createOrUpdatePr(
    createPrForBranchName: string,
    currentBranchName: string,
    body: string
): Promise<exec.ExecOutput> {
    createPrForBranchName = encodeDoubleQuotation(createPrForBranchName);
    currentBranchName = encodeDoubleQuotation(currentBranchName);
    body = encodeDoubleQuotation(body);

    return execCommand(
        `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`,
        `Create pull request from ${currentBranchName} to ${createPrForBranchName} with title 'Merge ${currentBranchName} into ${createPrForBranchName}' failed.`
    ).catch(e => {
        const message = e instanceof Error ? e.message : e.toString();
        if (message.toLowerCase().includes("already exists")) {
            return getPrLink(
                message,
                `I tried to make a pull request from ${currentBranchName} to ${createPrForBranchName} but it didn't work. It seems that this pull request exists. I tried to find the link in the message, but I didn't succeed.`
            ).then(prLink => updatePr(prLink, body));
        }
        throw e;
    });
}

function getPrLink(str: string, errorMessage?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const regex = /(https*:\/\/)?github\.com\/\S+\/\S+\/pull\/\d+/;
        const urlMatch = str.match(regex);
        return urlMatch
            ? resolve(urlMatch[0])
            : reject(errorMessage ? new Error(errorMessage) : undefined);
    });
}

function updatePr(
    prLinkOrNumber: string,
    body: string
): Promise<exec.ExecOutput> {
    prLinkOrNumber = encodeDoubleQuotation(prLinkOrNumber);
    body = encodeDoubleQuotation(body);
    return execCommand(
        `gh pr edit "${prLinkOrNumber}" --body "${body}"`,
        `Update pull request '${prLinkOrNumber}' failed.`
    );
}

function encodeDoubleQuotation(text: string): string {
    return text.replace(/"/g, '"');
}
