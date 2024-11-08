import { execCommand } from "./utility";
import * as exec from "@actions/exec";
import * as core from "@actions/core";

export async function getCurrentBranchName(): Promise<string> {
    const result = await execCommand(
        "git rev-parse --abbrev-ref HEAD",
        "Detect current branch name failed."
    );
    return result.stdout.trim();
}

export async function getGitRootDir(): Promise<string> {
    const output = await execCommand(
        "git rev-parse --show-toplevel",
        "find git root directory failed."
    );
    return output.stdout.trim();
}

export async function setGitConfigs(
    email: string,
    username: string
): Promise<exec.ExecOutput> {
    await execCommand(`git config --global user.email "${email}"`);
    return await execCommand(`git config --global user.name "${username}"`);
}

export async function push(testMode = false): Promise<exec.ExecOutput> {
    const currentBranchName = await getCurrentBranchName();
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
}

export async function ensureBranchNameIsValid(
    branchName: string
): Promise<void> {
    const isExistInLocal = await isBranchNameExistsInLocal(branchName);
    if (isExistInLocal) return;
    const isExistInRemote = await isBranchNameExistsInRemote(branchName);
    if (isExistInRemote) return;
    throw new Error(`The branch '${branchName}' is not valid.`);
}

export async function isBranchNameExistsInLocal(
    branchName: string
): Promise<boolean> {
    const output = await execCommand(
        `git show-ref --verify refs/heads/${branchName}`,
        `Failed to check is branch '${branchName}' exists in local.`,
        [],
        { ignoreReturnCode: true }
    );
    if (output.exitCode === 0) return true;
    const message = `${output.stderr}\n${output.stdout}`;
    if (message.toLowerCase().includes(" - not a valid ref")) return false;
    throw new Error(`An unknown error occurred.\n${message}`);
}

export async function isBranchNameExistsInRemote(
    branchName: string
): Promise<boolean> {
    const output = await execCommand(
        `git ls-remote --quiet --heads --exit-code origin ${branchName}`,
        `Failed to check is branch '${branchName}' exists in remote.`,
        [],
        { ignoreReturnCode: true }
    );
    if (output.exitCode === 0) return true;
    if (output.exitCode === 2) return false;
    const message = `${output.stderr}\n${output.stdout}`;
    throw new Error(`An unknown error occurred.\n${message}`);
}
