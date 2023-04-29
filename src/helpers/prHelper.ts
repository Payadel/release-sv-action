import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { execCommand } from "./utility";
import { getCurrentBranchName } from "./git";

interface IPrData {
    number: number;
}

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
    ).catch(e =>
        tryFindActivePr(createPrForBranchName, currentBranchName).then(
            prNumber => {
                if (!prNumber) {
                    throw new Error(
                        `Can not create pull request and can not find any active PR to update.\n${e.toString()}`
                    );
                }

                core.info(
                    "Can not create pull request because it is exist. Try update it."
                );
                return updatePr(prNumber, body);
            }
        )
    );
}

function getPrLink(str: string): string | null {
    const regex = /(https*:\/\/)?github\.com\/\S+\/\S+\/pull\/\d+/;
    const urlMatch = str.match(regex);
    return urlMatch ? urlMatch[0] : null;
}

function updatePr(prNumber: string, body: string): Promise<exec.ExecOutput> {
    return execCommand(
        `gh pr edit ${prNumber} --body ${body}`,
        `Update pull request with '${prNumber}' failed.`
    );
}

function tryFindActivePr(
    targetBranchName: string,
    currentBranchName: string
): Promise<string | null> {
    return execCommand(
        `gh pr list -B ${targetBranchName} -H ${currentBranchName} --state open --json number`,
        `Trying to find active PR for ${targetBranchName} from ${currentBranchName} failed.`
    )
        .then(result => JSON.parse(result.stdout))
        .then((json: IPrData[]) => {
            switch (json.length) {
                case 0:
                    return null;
                case 1:
                    return json[0].number.toString();
                default:
                    throw new Error("More than one pull requests found.");
            }
        });
}
