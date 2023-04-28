import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { execCommand, getCurrentBranchName } from "./utility";

interface IPrData {
    number: number;
}

export async function createPullRequest(
    createPrForBranchName: string
): Promise<exec.ExecOutput | null> {
    return new Promise<exec.ExecOutput | null>((resolve, reject) => {
        if (!createPrForBranchName) {
            core.info(
                "No branch name provided so skipping pull request creation."
            );
            return resolve(null);
        }

        core.info("Create pull request...");
        return getCurrentBranchName()
            .then(currentBranchName =>
                createOrUpdatePr(currentBranchName, currentBranchName)
            )
            .then(resolve)
            .catch(reject);
    });
}

function createOrUpdatePr(
    createPrForBranchName: string,
    currentBranchName: string
): Promise<exec.ExecOutput> {
    return execCommand(
        `gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body-file CHANGELOG.md`,
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
                return updatePr(prNumber);
            }
        )
    );
}

function updatePr(prNumber: string): Promise<exec.ExecOutput> {
    return execCommand(
        `gh pr edit ${prNumber} --body-file CHANGELOG.md`,
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
