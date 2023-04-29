import * as exec from "@actions/exec";
import * as core from "@actions/core";
import path from "path";
import fs from "fs";

export function getCurrentBranchName(): Promise<string> {
    return execCommand(
        "git rev-parse --abbrev-ref HEAD",
        "Detect current branch name failed."
    ).then(result => result.stdout.trim());
}

export function getInputOrDefault(
    name: string,
    default_value: string | null = "",
    trimWhitespace = true,
    required = false
): string | null {
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
    const input = getInputOrDefault(name, "", true, required)?.toLowerCase();
    if (!input || input === "") return defaultValue;
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

export function readFile(fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!fs.existsSync(fileName)) {
            return reject(new Error(`Can not find '${fileName}'.`));
        }
        resolve(fs.readFileSync(fileName, "utf8").trim());
    });
}

export function readChangelogSection(
    changelog_file: string,
    pattern: RegExp,
    version?: string
): Promise<string> {
    return readFile(changelog_file).then(content => {
        const lines = content.split("\n");

        // Find headers
        const headerLines: { line: string; index: number }[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i]))
                headerLines.push({ line: lines[i], index: i });
        }
        if (headerLines.length === 0) {
            throw new Error(
                "Can not find or detect any changelog header.\n" +
                    "You can update regex or report this issue with details."
            );
        }

        let targetIndex: number;
        if (version) {
            // Find target header (with specific version)
            targetIndex = headerLines.findIndex(line =>
                new RegExp(`\\b${version.toLowerCase()}\\b`).test(line.line)
            );
            if (targetIndex < 0) {
                throw new Error(
                    `Can not find or detect any changelog with version ${version}.\n` +
                        "You can update regex or report this issue with details."
                );
            }
        } else {
            targetIndex = 0;
        }

        const startLineIndex = headerLines[targetIndex].index;
        const endLineIndex =
            targetIndex + 1 < headerLines.length
                ? headerLines[targetIndex + 1].index
                : lines.length;

        return lines.slice(startLineIndex, endLineIndex).join("\n");
    });
}
