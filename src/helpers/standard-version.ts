import { execCommand } from "./utility";
import * as exec from "@actions/exec";
import { GenerateChangelogOptions } from "../inputs";
import { needGenerateChangelog } from "./changelog";

export function installStandardVersionPackage(): Promise<exec.ExecOutput> {
    return execCommand(
        "npm install -g standard-version",
        "Can not install standard version npm package."
    );
}

export function getReleaseCommand(
    inputVersion: string,
    skipChangelog: boolean
): string {
    let releaseCommand = "standard-version";
    if (inputVersion) releaseCommand += ` --release-as ${inputVersion}`;
    if (skipChangelog) releaseCommand += " --skip.changelog";
    return releaseCommand;
}

export function runDry(command: string): Promise<string> {
    if (!command.toLowerCase().includes("--dry-run")) command += "--dry-run";
    return execCommand(command).then(output => output.stdout.trim());
}

export function standardVersionRelease(
    generateChangelogOption: GenerateChangelogOptions,
    inputVersion: string,
    changelogVersionRegex: RegExp
): Promise<exec.ExecOutput> {
    return needGenerateChangelog(
        generateChangelogOption,
        inputVersion,
        changelogVersionRegex
    )
        .then(needCreateChangelog =>
            getReleaseCommand(inputVersion, !needCreateChangelog)
        )
        .then(releaseCommand =>
            execCommand(releaseCommand, "Release standard-version failed.")
        );
}
