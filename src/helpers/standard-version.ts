import { execCommand } from "./utility";
import * as exec from "@actions/exec";
import { GenerateChangelogOptions } from "../inputs";
import { isNeedGenerateChangelog } from "./changelog";

export function installStandardVersionPackage(): Promise<exec.ExecOutput> {
    return execCommand(
        "npm install -g standard-version",
        "Can not install standard version npm package."
    );
}

export function getReleaseCommand(
    skipChangelog: boolean,
    inputVersion?: string
): string {
    let releaseCommand = "standard-version";
    if (inputVersion) releaseCommand += ` --release-as ${inputVersion}`;
    if (skipChangelog) releaseCommand += " --skip.changelog";
    return releaseCommand;
}

export function runDry(command: string): Promise<string> {
    const dryFlag = " --dry-run";
    if (!command.toLowerCase().includes(dryFlag)) command += dryFlag;
    return execCommand(command).then(output => output.stdout.trim());
}

export function standardVersionRelease(
    generateChangelogOption: GenerateChangelogOptions,
    changelog_file: string,
    inputVersion?: string,
    changelogHeaderRegex?: RegExp
): Promise<exec.ExecOutput> {
    return isNeedGenerateChangelog(
        generateChangelogOption,
        changelog_file,
        inputVersion,
        changelogHeaderRegex
    )
        .then(needCreateChangelog =>
            getReleaseCommand(!needCreateChangelog, inputVersion)
        )
        .then(releaseCommand => execCommand(releaseCommand));
}
