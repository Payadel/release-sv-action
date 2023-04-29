import * as core from "@actions/core";
import { GenerateChangelogOptions, getInputs } from "./inputs";
import {
    createReleaseFile,
    execCommand,
    installStandardVersionPackage,
    operateWhen,
    push,
    readChangelogSection,
    setGitConfigs,
} from "./utility";
import { createPullRequest } from "./prHelper";
import { IOutputs, setOutputs } from "./outputs";
import { readVersion } from "./version";
import * as exec from "@actions/exec";

const run = (): Promise<void> =>
    mainProcess()
        .then(() => core.info("Operation completed successfully."))
        .catch(error => {
            core.error("Operation failed.");
            core.setFailed(
                error instanceof Error ? error.message : error.toString()
            );
        });

export default run;

function mainProcess(): Promise<void> {
    return getInputs().then(inputs => {
        const outputs: IOutputs = {};
        return installStandardVersionPackage()
            .then(() => setGitConfigs(inputs.gitEmail, inputs.gitUsername))
            .then(() =>
                standardVersionRelease(
                    inputs.generateChangelog,
                    inputs.inputVersion,
                    inputs.changelogVersionRegex
                )
            )
            .then(() =>
                releaseFiles(
                    inputs.skipReleaseFile,
                    inputs.releaseDirectory,
                    inputs.releaseFileName
                ).then(
                    releaseFileName =>
                        (outputs.releaseFileName = releaseFileName ?? "")
                )
            )
            .then(() =>
                operateWhen(
                    !inputs.isTestMode,
                    push,
                    "The test mode is enabled so skipping push."
                )
            )
            .then(() =>
                readVersion("./package.json").then(version => {
                    outputs.version = version;
                    return version;
                })
            )
            .then(newVersion =>
                readChangelogSection(
                    "CHANGELOG.md",
                    inputs.changelogVersionRegex,
                    newVersion
                )
                    .then(changelog => {
                        outputs.changelog = changelog;
                        return changelog;
                    })
                    .then(changelog =>
                        createPr(
                            inputs.createPrForBranchName,
                            inputs.isTestMode,
                            changelog
                        ).then(
                            prLink => (outputs.pullRequestUrl = prLink ?? "")
                        )
                    )
            )
            .then(() => setOutputs(outputs));
    });
}

function standardVersionRelease(
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

function needGenerateChangelog(
    generateChangelogOption: GenerateChangelogOptions,
    inputVersion: string,
    changelogVersionRegex: RegExp
): Promise<boolean> {
    switch (generateChangelogOption) {
        case "never":
            return Promise.resolve(false);
        case "always":
            return Promise.resolve(true);
        case "auto":
            return detectNewVersion(inputVersion).then(newVersion =>
                getNewestChangelogVersion(changelogVersionRegex).then(
                    newestChangelogVersion =>
                        newVersion.toLowerCase() ===
                        newestChangelogVersion.toLowerCase()
                )
            );
        default:
            throw new Error(
                `The generate changelog option (${generateChangelogOption}) is not supported.`
            );
    }
}

function detectNewVersion(inputVersion: string): Promise<string> {
    const releaseCommand = getReleaseCommand(inputVersion, true);
    return runDry(releaseCommand).then(parseNewVersionFromText);
}

function getReleaseCommand(
    inputVersion: string,
    skipChangelog: boolean
): string {
    let releaseCommand = "standard-version";
    if (inputVersion) releaseCommand += ` --release-as ${inputVersion}`;
    if (skipChangelog) releaseCommand += " --skip.changelog";
    return releaseCommand;
}

function runDry(command: string): Promise<string> {
    if (!command.toLowerCase().includes("--dry-run")) command += "--dry-run";
    return execCommand(command).then(output => output.stdout.trim());
}

function parseNewVersionFromText(text: string): string {
    const regex = /v(\d+\.\d+\.\d+)/;
    const match = text.match(regex);
    if (match) return match[1];
    throw new Error(`Can not detect new version from ${text}`);
}

function getNewestChangelogVersion(pattern: RegExp): Promise<string> {
    return readChangelogSection("CHANGELOG.md", pattern);
}

function createPr(
    createPrForBranchName: string,
    isTestMode = false,
    body: string
): Promise<string | null> {
    if (isTestMode) {
        core.info(
            "The test mode is enabled so skipping pull request creation."
        );
        return Promise.resolve(null);
    }
    if (!createPrForBranchName) {
        core.info("No branch name provided so skipping pull request creation.");
        return Promise.resolve(null);
    }

    return createPullRequest(createPrForBranchName, body);
}

function releaseFiles(
    skipReleaseFile: boolean,
    releaseDirectory: string,
    releaseFileName: string
): Promise<string | null> {
    if (skipReleaseFile) {
        core.info(
            "Skip release file is requested so skip create release file."
        );
        return Promise.resolve(null);
    }
    return createReleaseFile(releaseDirectory, releaseFileName);
}
