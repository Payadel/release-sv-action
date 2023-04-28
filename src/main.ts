import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { execBashCommand, getCurrentBranchName } from "./utility";
import { createPullRequest } from "./prHelper";
import { GetInputs } from "./inputs";

async function main(): Promise<void> {
    try {
        await GetInputs().then(inputs => {
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
                );
        });
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

async function setGitConfigs(
    email: string,
    username: string
): Promise<exec.ExecOutput> {
    core.info("Config git...");

    return exec
        .getExecOutput(`git config --global user.email "${email}"`)
        .then(() =>
            exec.getExecOutput(`git config --global user.name "${username}"`)
        );
}

async function installStandardVersionPackage(): Promise<exec.ExecOutput> {
    core.info("Install standard-version npm package...");

    return exec.getExecOutput("npm install -g standard-version");
}

async function release(
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

    return exec.getExecOutput(releaseCommand);
}

async function push(isTestMode: boolean): Promise<exec.ExecOutput> {
    if (isTestMode)
        return exec.getExecOutput(
            "echo 'Test mode is enable so skipping push...'"
        );

    core.info("Push...");
    return getCurrentBranchName().then(currentBranchName =>
        exec.getExecOutput(`git push --follow-tags origin ${currentBranchName}`)
    );
}

async function readVersion(): Promise<string> {
    return exec
        .getExecOutput("node -p -e \"require('./package.json').version\"")
        .then(result => result.stdout.trim())
        .then(version => {
            core.info(`Version: ${version}`);
            return version;
        });
}

async function createReleaseFile(
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

main();
