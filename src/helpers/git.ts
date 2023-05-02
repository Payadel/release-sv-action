import { execCommand } from "./utility";
import * as exec from "@actions/exec";
import * as core from "@actions/core";

export function getCurrentBranchName(): Promise<string> {
    return execCommand(
        "git rev-parse --abbrev-ref HEAD",
        "Detect current branch name failed."
    ).then(result => result.stdout.trim());
}

export function getGitRootDir(): Promise<string> {
    return execCommand(
        "git rev-parse --show-toplevel",
        "find git root directory failed."
    ).then(output => output.stdout.trim());
}

export function setGitConfigs(
    email: string,
    username: string
): Promise<exec.ExecOutput> {
    return execCommand(`git config --global user.email "${email}"`).then(() =>
        execCommand(`git config --global user.name "${username}"`)
    );
}

export function push(testMode = false): Promise<exec.ExecOutput> {
    return getCurrentBranchName().then(currentBranchName => {
        const command = `git push --follow-tags origin ${currentBranchName}`;

        if (testMode) {
            core.info(
                `Test mode is enabled so skipping push command and return fake output. Command: ${command}`
            );
            return Promise.resolve<exec.ExecOutput>({
                stdout: "OK!",
                stderr: "",
                exitCode: 0,
            });
        }

        return execCommand(command);
    });
}

export function ensureBranchNameIsValid(branchName: string): Promise<void> {
    return isBranchNameExistsInLocal(branchName).then(isExistInLocal => {
        if (isExistInLocal) return;
        return isBranchNameExistsInRemote(branchName).then(isExistInRemote => {
            if (isExistInRemote) return;
            throw new Error(`The branch '${branchName}' is not valid.`);
        });
    });
}

export function isBranchNameExistsInLocal(
    branchName: string
): Promise<boolean> {
    return execCommand(
        `git show-ref --verify refs/heads/${branchName}`,
        `Failed to check is branch '${branchName}' exists in local.`,
        [],
        { ignoreReturnCode: true }
    ).then(output => {
        if (output.exitCode === 0) return true;
        const message = `${output.stderr}\n${output.stdout}`;
        if (message.toLowerCase().includes(" - not a valid ref")) return false;
        throw new Error(`An unknown error occurred.\n${message}`);
    });
}

export function isBranchNameExistsInRemote(
    branchName: string
): Promise<boolean> {
    return execCommand(
        `git ls-remote --quiet --heads --exit-code origin ${branchName}`,
        `Failed to check is branch '${branchName}' exists in remote.`,
        [],
        { ignoreReturnCode: true }
    ).then(output => {
        if (output.exitCode === 0) return true;
        if (output.exitCode === 2) return false;
        const message = `${output.stderr}\n${output.stdout}`;
        throw new Error(`An unknown error occurred.\n${message}`);
    });
}
