import * as core from "@actions/core";
import { GetInputs } from "./inputs";
import { execBashCommand, execCommand, push, readVersion } from "./utility";
import { createPullRequest } from "./prHelper";
import * as exec from "@actions/exec";

const run = (): Promise<void> =>
    GetInputs()
        .then(inputs => {
            return setGitConfigs(inputs.gitEmail, inputs.gitUsername)
                .then(() => installStandardVersionPackage())
                .then(() =>
                    release(
                        inputs.version,
                        inputs.skipChangelog,
                        inputs.isTestMode
                    )
                )
                .then(() =>
                    readVersion().then(version =>
                        core.setOutput("version", version)
                    )
                )
                .then(() =>
                    createReleaseFile(
                        inputs.releaseDirectory,
                        inputs.releaseFileName,
                        inputs.skipReleaseFile
                    )
                )
                .then(() => push(inputs.isTestMode))
                .then(() =>
                    createPullRequest(
                        inputs.createPrForBranchName,
                        inputs.isTestMode
                    )
                )
                .then(() => Promise.resolve());
        })
        .then(() => core.info("Operation completed successfully."))
        .catch(error => {
            core.error("Operation failed.");
            core.setFailed(
                error instanceof Error ? error.message : error.toString()
            );
        });

export default run;

function setGitConfigs(
    email: string,
    username: string
): Promise<exec.ExecOutput> {
    core.info("Config git...");

    return exec
        .getExecOutput(`git config --global user.email "${email}"`)
        .then(() => execCommand(`git config --global user.name "${username}"`));
}

function installStandardVersionPackage(): Promise<exec.ExecOutput> {
    core.info("Install standard-version npm package...");

    return execCommand("npm install -g standard-version");
}

function release(
    version: string,
    skipChangelog: boolean,
    isTestMode: boolean
): Promise<exec.ExecOutput> {
    core.info("Create release...");
    let releaseCommand = "standard-version";
    if (version) releaseCommand += ` --release-as ${version}`;
    if (skipChangelog) releaseCommand += " --skip.changelog";

    core.info(`Command: ${releaseCommand}`);
    if (isTestMode) core.setOutput("releaseCommand", releaseCommand);

    return execCommand(releaseCommand);
}

function createReleaseFile(
    directory: string,
    filename: string,
    skipReleaseFile: boolean
): Promise<exec.ExecOutput | null> {
    if (skipReleaseFile) {
        core.info(
            "Skip release file requested so skipping create release file."
        );
        core.setOutput("releaseFileName", "");
        return Promise.resolve(null);
    }

    core.info("Create release file...");
    const releaseFileName = `${filename}.zip`;
    core.setOutput("releaseFileName", releaseFileName);
    return execBashCommand(
        `(cd ${directory}; zip -r $(git rev-parse --show-toplevel)/${releaseFileName} .)`
    );
}
