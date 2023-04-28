import * as exec from "@actions/exec";
import * as core from "@actions/core";

export function getCurrentBranchName(): Promise<string> {
    return execCommand(
        "git rev-parse --abbrev-ref HEAD",
        "Detect current branch name failed."
    ).then(result => result.stdout.trim());
}

export function getInputOrDefault(
    name: string,
    default_value = "",
    trimWhitespace = true,
    required = false
): string {
    const input = core.getInput(name, {
        trimWhitespace,
        required,
    });
    if (!input || input === "") return default_value;
    return input;
}

export function getBooleanInputOrDefault(
    name: string,
    defaultValue: boolean,
    required = false
): boolean {
    const input = getInputOrDefault(name, "", true, required).toLowerCase();
    if (input === "") return defaultValue;
    if (input === "true") return true;
    if (input === "false") return false;
    throw new TypeError(
        `The value of ${name} is not valid. It must be either true or false but got ${input}`
    );
}

export function execBashCommand(
    command: string,
    errorMessage: string | null = null
): Promise<exec.ExecOutput> {
    command = command.replace(/"/g, "'");
    return execCommand(`/bin/bash -c "${command}"`, errorMessage);
}

export function execCommand(
    command: string,
    errorMessage: string | null = null
): Promise<exec.ExecOutput> {
    return exec.getExecOutput(command).catch(error => {
        const title = errorMessage || `Execute '${command}' failed.`;
        const message =
            error instanceof Error ? error.message : error.toString();
        throw new Error(`${title}\n${message}`);
    });
}

export function push(): Promise<exec.ExecOutput> {
    return getCurrentBranchName().then(currentBranchName =>
        execCommand(`git push --follow-tags origin ${currentBranchName}`)
    );
}
