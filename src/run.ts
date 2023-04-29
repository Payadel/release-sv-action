import * as core from "@actions/core";
import { getInputs } from "./inputs";
import {
    createReleaseFile,
    installStandardVersionPackage,
    operateWhen,
    push,
    setGitConfigs,
    svRelease,
} from "./utility";
import { createPullRequest } from "./prHelper";
import { IOutputs, setOutputs } from "./outputs";

const run = (): Promise<void> =>
    mainProcess()
        .then(() => core.info("Operation completed successfully."))
        .catch(error => {
            core.error("Operation failed.");
            core.setFailed(
                error instanceof Error ? error.message : error.toString()
            );
        });

export default run;

function mainProcess(): Promise<void> {
    return getInputs().then(inputs => {
        const outputs: IOutputs = {};
        return installStandardVersionPackage()
            .then(() => setGitConfigs(inputs.gitEmail, inputs.gitUsername))
            .then(() => svRelease(inputs.version, inputs.skipChangelog))
            .then(() =>
                releaseFiles(
                    inputs.skipReleaseFile,
                    inputs.releaseDirectory,
                    inputs.releaseFileName
                ).then(
                    releaseFileName =>
                        (outputs.releaseFileName = releaseFileName ?? "")
                )
            )
            .then(() =>
                operateWhen(
                    !inputs.isTestMode,
                    push,
                    "The test mode is enabled so skipping push."
                )
            )
            .then(() =>
                createPr(inputs.createPrForBranchName, inputs.isTestMode).then(
                    prLink => (outputs.pullRequestUrl = prLink ?? "")
                )
            )
            .then(() => setOutputs(outputs));
    });
}

function createPr(
    createPrForBranchName: string,
    isTestMode = false
): Promise<string | null> {
    if (isTestMode) {
        core.info(
            "The test mode is enabled so skipping pull request creation."
        );
        return Promise.resolve(null);
    }
    if (!createPrForBranchName) {
        core.info("No branch name provided so skipping pull request creation.");
        return Promise.resolve(null);
    }

    return createPullRequest(createPrForBranchName);
}

function releaseFiles(
    skipReleaseFile: boolean,
    releaseDirectory: string,
    releaseFileName: string
): Promise<string | null> {
    if (skipReleaseFile) {
        core.info(
            "Skip release file is requested so skip create release file."
        );
        return Promise.resolve(null);
    }
    return createReleaseFile(releaseDirectory, releaseFileName);
}
