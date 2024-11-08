import { getBooleanInputOrDefault, getInputOrDefault } from "./helpers/utility";
import { versionMustValid } from "./helpers/version";
import { ensureBranchNameIsValid } from "./helpers/git";
import fs from "fs";

export interface IInputs {
    inputVersion?: string;
    ignoreSameVersionError: boolean;
    ignoreLessVersionError: boolean;
    createPrForBranchName?: string;
    generateChangelog: GenerateChangelogOptions;
    skipReleaseFile: boolean;
    releaseDirectory: string;
    releaseFileName: string;
    isTestMode: boolean;
    gitEmail: string;
    gitUsername: string;
    versionRegex?: RegExp;
    changelogHeaderRegex?: RegExp;
}

export type GenerateChangelogOptions = "always" | "never" | "auto";

export function getInputsOrDefaults(defaultInputs: IInputs) {
    return new Promise<IInputs>(resolve =>
        resolve({
            inputVersion: getInputOrDefault(
                "version",
                defaultInputs.inputVersion
            ),
            versionRegex: getRegexOrDefault(
                "version-regex",
                defaultInputs.versionRegex
            ),
            ignoreLessVersionError: getBooleanInputOrDefault(
                "ignore-same-version-error",
                defaultInputs.ignoreLessVersionError
            )!,
            ignoreSameVersionError: getBooleanInputOrDefault(
                "ignore-less-version-error",
                defaultInputs.ignoreSameVersionError
            )!,
            generateChangelog: getGenerateChangelog(
                defaultInputs.generateChangelog
            ),
            isTestMode: getBooleanInputOrDefault(
                "is-test-mode",
                defaultInputs.isTestMode
            )!,
            gitEmail: getInputOrDefault("git-email", defaultInputs.gitEmail)!,
            gitUsername: getInputOrDefault(
                "git-user-name",
                defaultInputs.gitUsername
            )!,
            skipReleaseFile: getBooleanInputOrDefault(
                "skip-release-file",
                defaultInputs.skipReleaseFile
            )!,
            releaseDirectory: getInputOrDefault(
                "release-directory",
                defaultInputs.releaseDirectory
            )!,
            releaseFileName: getInputOrDefault(
                "release-file-name",
                defaultInputs.releaseFileName
            )!,
            createPrForBranchName: getInputOrDefault(
                "create-pr-for-branch",
                defaultInputs.createPrForBranchName
            ),
            changelogHeaderRegex: getRegexOrDefault(
                "changelog-header-regex",
                defaultInputs.changelogHeaderRegex
            ),
        })
    );
}

function getGenerateChangelog(
    default_value: GenerateChangelogOptions
): GenerateChangelogOptions {
    const generateChangelog =
        getInputOrDefault("generate-changelog", undefined)?.toLowerCase() ??
        default_value;
    switch (generateChangelog) {
        case "auto":
        case "always":
        case "never":
            return generateChangelog;
        default:
            throw new Error(
                `The input generate-changelog '${generateChangelog}' is not valid. Supported values are auto, enable, disable`
            );
    }
}

function getRegexOrDefault(
    name: string,
    default_regex: string | RegExp | undefined = undefined
): RegExp | undefined {
    const versionRegexStr = getInputOrDefault(name, undefined);
    if (versionRegexStr) return new RegExp(versionRegexStr);
    return default_regex ? new RegExp(default_regex) : undefined;
}

export async function validateInputs(
    inputs: IInputs,
    currentVersion: string
): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        if (!inputs.inputVersion) return resolve();

        return versionMustValid(
            inputs.inputVersion,
            currentVersion,
            inputs.ignoreSameVersionError,
            inputs.ignoreLessVersionError
        )
            .then(resolve)
            .catch(reject);
    });
    if (!fs.existsSync(inputs.releaseDirectory)) {
        await Promise.reject(
            new Error(
                `The directory '${inputs.releaseDirectory}' does not exists.`
            )
        );
    }
    await Promise.resolve();
    if (!inputs.createPrForBranchName) return Promise.resolve();
    return ensureBranchNameIsValid(inputs.createPrForBranchName);
}
