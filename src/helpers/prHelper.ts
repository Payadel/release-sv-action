import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { execCommand } from "./utility";
import { getCurrentBranchName } from "./git";

export function createPullRequest(
    createPrForBranchName: string,
    body: string,
    testMode = false
): Promise<string> {
    return getCurrentBranchName()
        .then(currentBranchName =>
            createOrUpdatePr(
                createPrForBranchName,
                currentBranchName,
                body,
                testMode
            )
        )
        .then(output =>
            getPrLink(
                output.stdout,
                `Failed to extract pull request URL from command output.\nOutput: ${output.stdout}\n${output.stderr}`
            )
        );
}

function createOrUpdatePr(
    createPrForBranchName: string,
    currentBranchName: string,
    body: string,
    testMode = false
): Promise<exec.ExecOutput> {
    createPrForBranchName = encodeDoubleQuotation(createPrForBranchName);
    currentBranchName = encodeDoubleQuotation(currentBranchName);
    body = encodeDoubleQuotation(body);
    const command = `gh pr create -B "${createPrForBranchName}" -H "${currentBranchName}" --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "${body}"`;

    if (testMode) {
        core.info(
            `The test mode is enabled so skipping create pull request and return fake output. Command: ${command}`
        );
        return Promise.resolve<exec.ExecOutput>({
            stdout: `Creating pull request for ${currentBranchName} into ${createPrForBranchName} in user/repo\nhttps://github.com/user/repo/pull/1000`,
            exitCode: 0,
            stderr: "",
        });
    }

    return execCommand(
        command,
        `Create pull request from ${currentBranchName} to ${createPrForBranchName} with title 'Merge ${currentBranchName} into ${createPrForBranchName}' failed.`,
        [],
        {
            silent: true,
            ignoreReturnCode: true,
        }
    ).then(output => {
        if (output.exitCode === 0) return output;

        const message = `${output.stdout}\n${output.stderr}`;
        if (message.toLowerCase().includes("already exists")) {
            return getPrLink(
                message,
                `I tried to make a pull request from ${currentBranchName} to ${createPrForBranchName} but it didn't work. It seems that this pull request exists. I tried to find the link in the message, but I didn't succeed.\nMain message: ${message}`
            ).then(prLink => updatePr(prLink, body));
        }
        throw new Error(message);
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
        `Update pull request '${prLinkOrNumber}' failed.`,
        [],
        { silent: true }
    );
}

function encodeDoubleQuotation(text: string): string {
    return text.replace(/"/g, '"');
}
