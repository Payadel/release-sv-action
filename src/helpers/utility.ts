import * as exec from "@actions/exec";
import path from "path";
import fs from "fs";
import { getGitRootDir } from "./git";
import * as core from "@actions/core";

export function execBashCommand(
    command: string,
    errorMessage?: string
): Promise<exec.ExecOutput> {
    command = command.replace(/"/g, "'");
    return execCommand(`/bin/bash -c "${command}"`, errorMessage);
}

export function execCommand(
    command: string,
    errorMessage?: string
): Promise<exec.ExecOutput> {
    return exec.getExecOutput(command).catch(error => {
        const title = errorMessage || `Execute '${command}' failed.`;
        const message =
            error instanceof Error ? error.message : error.toString();
        throw new Error(`${title}\n${message}`);
    });
}

export function readFile(fileName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!fs.existsSync(fileName)) {
            return reject(new Error(`Can not find '${fileName}'.`));
        }
        resolve(fs.readFileSync(fileName, "utf8").trim());
    });
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
            `Can not create release file from '${releaseDir}' to '${outputPath}'.`
        ).then(() => releaseFilename);
    });
}

export function getInputOrDefault(
    name: string,
    default_value: string | undefined = undefined,
    trimWhitespace = true,
    required = false
): string | undefined {
    const input = core.getInput(name, {
        trimWhitespace,
        required,
    });
    if (!input || input === "") return default_value;
    return input;
}

export function getBooleanInputOrDefault(
    name: string,
    defaultValue: boolean | undefined = undefined,
    required = false
): boolean | undefined {
    const input = getInputOrDefault(
        name,
        undefined,
        true,
        required
    )?.toLowerCase();
    if (!input) return defaultValue;
    if (input === "true") return true;
    if (input === "false") return false;
    throw new TypeError(
        `The value of '${name}' is not valid. It must be either true or false but got '${input}'.`
    );
}
