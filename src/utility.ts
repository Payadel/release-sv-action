import * as exec from "@actions/exec";
import * as core from "@actions/core";
import path from "path";

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

export function createReleaseFile(
    releaseDir: string,
    releaseFilename: string
): Promise<string> {
    if (!releaseFilename.endsWith(".zip")) releaseFilename += ".zip";

    return getGitRootDir().then(rootDir => {
        const outputPath = path.join(rootDir, releaseFilename);
        return execBashCommand(
            `(cd ${releaseDir}; zip -r ${outputPath} .)`,
            `Can not create release file from ${releaseDir} to ${outputPath}'.`
        ).then(() => releaseFilename);
    });
}

function getGitRootDir(): Promise<string> {
    return execCommand(
        "git rev-parse --show-toplevel",
        "find git root directory failed."
    ).then(output => output.stdout.trim());
}

export function operateWhen(
    condition: boolean,
    func: () => any,
    elseMessage: string | null = null
): any {
    if (condition) return func();
    else if (elseMessage) core.info(elseMessage);
}

export function setGitConfigs(
    email: string,
    username: string
): Promise<exec.ExecOutput> {
    return execCommand(`git config --global user.email "${email}"`).then(() =>
        execCommand(`git config --global user.name "${username}"`)
    );
}

export function installStandardVersionPackage(): Promise<exec.ExecOutput> {
    return execCommand(
        "npm install -g standard-version",
        "Can not install standard version npm package."
    );
}

export function svRelease(
    version: string,
    skipChangelog: boolean
): Promise<exec.ExecOutput> {
    let releaseCommand = "standard-version";
    if (version) releaseCommand += ` --release-as ${version}`;
    if (skipChangelog) releaseCommand += " --skip.changelog";

    return execCommand(releaseCommand);
}
