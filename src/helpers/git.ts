import { execCommand } from "./utility";
import * as exec from "@actions/exec";

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

export function push(): Promise<exec.ExecOutput> {
    return getCurrentBranchName().then(currentBranchName =>
        execCommand(`git push --follow-tags origin ${currentBranchName}`)
    );
}
