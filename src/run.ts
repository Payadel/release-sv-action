import * as core from "@actions/core";
import { getInputs } from "./inputs";
import { createReleaseFile, execCommand, operateWhen, push } from "./utility";
import { createPullRequest } from "./prHelper";
import * as exec from "@actions/exec";

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
        return installStandardVersionPackage()
            .then(() => setGitConfigs(inputs.gitEmail, inputs.gitUsername))
            .then(() => svRelease(inputs.version, inputs.skipChangelog))
            .then(() =>
                operateWhen(
                    !inputs.skipReleaseFile,
                    () =>
                        createReleaseFile(
                            inputs.releaseDirectory,
                            inputs.releaseFileName
                        ),
                    "Skip release file is requested so skip create release file."
                )
            )
            .then(() =>
                operateWhen(
                    !inputs.isTestMode,
                    push,
                    "The test mode is enabled so skipping push."
                )
            )
            .then(() => {
                operateWhen(
                    !inputs.isTestMode,
                    () => createPullRequest(inputs.createPrForBranchName),
                    "The test mode is enabled so skipping pull request creation."
                );
            })
            .then(() => Promise.resolve());
    });
}

function setGitConfigs(
    email: string,
    username: string
): Promise<exec.ExecOutput> {
    return execCommand(`git config --global user.email "${email}"`).then(() =>
        execCommand(`git config --global user.name "${username}"`)
    );
}

function installStandardVersionPackage(): Promise<exec.ExecOutput> {
    return execCommand(
        "npm install -g standard-version",
        "Can not install standard version npm package."
    );
}

function svRelease(
    version: string,
    skipChangelog: boolean
): Promise<exec.ExecOutput> {
    let releaseCommand = "standard-version";
    if (version) releaseCommand += ` --release-as ${version}`;
    if (skipChangelog) releaseCommand += " --skip.changelog";

    return execCommand(releaseCommand);
}
