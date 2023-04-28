import * as exec from "@actions/exec";
import * as core from "@actions/core";

export async function getCurrentBranchName(): Promise<string> {
    return exec
        .getExecOutput("git rev-parse --abbrev-ref HEAD")
        .then(result => result.stdout.trim());
}

export async function execBashCommand(
    command: string
): Promise<exec.ExecOutput> {
    return exec.getExecOutput(`/bin/bash -c "${command}"`);
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
