import { getBooleanInputOrDefault, getInputOrDefault } from "./utility";
import { readVersion, versionMustValid } from "./version";
import { DEFAULT_INPUTS } from "./configs";

export interface IInputs {
    isTestMode: boolean;
    gitEmail: string;
    gitUsername: string;
    inputVersion: string;
    currentVersion: string;
    versionRegex: RegExp;
    ignoreSameVersionError: boolean;
    ignoreLessVersionError: boolean;
    generateChangelog: GenerateChangelogOptions;
    changelogVersionRegex: RegExp;
    skipReleaseFile: boolean;
    releaseDirectory: string;
    releaseFileName: string;
    createPrForBranchName: string;
}

export type GenerateChangelogOptions = "always" | "never" | "auto";

export function getInputs(): Promise<IInputs> {
    return new Promise<IInputs>(resolve => {
        const versionRegex = new RegExp(
            getInputOrDefault("version-regex", null) ??
                DEFAULT_INPUTS.versionRegex
        );
        const ignoreSameVersionError = getBooleanInputOrDefault(
            "ignore-same-version-error",
            DEFAULT_INPUTS.ignoreSameVersionError
        );
        const ignoreLessVersionError = getBooleanInputOrDefault(
            "ignore-less-version-error",
            DEFAULT_INPUTS.ignoreLessVersionError
        );
        return readVersion("package.json").then(currentVersion => {
            const inputVersion = getInputOrDefault(
                "version",
                DEFAULT_INPUTS.inputVersion,
                true,
                false
            )!;
            if (inputVersion) {
                versionMustValid(
                    inputVersion,
                    currentVersion,
                    versionRegex,
                    ignoreSameVersionError,
                    ignoreLessVersionError
                );
            }

            return resolve({
                inputVersion,
                currentVersion,
                versionRegex,
                ignoreLessVersionError,
                ignoreSameVersionError,
                generateChangelog: getGenerateChangelog(),
                isTestMode: getBooleanInputOrDefault(
                    "is-test-mode",
                    DEFAULT_INPUTS.isTestMode
                ),
                gitEmail: getInputOrDefault(
                    "git-email",
                    DEFAULT_INPUTS.gitEmail
                )!,
                gitUsername: getInputOrDefault(
                    "git-user-name",
                    DEFAULT_INPUTS.gitUsername
                )!,
                skipReleaseFile: getBooleanInputOrDefault(
                    "skip-release-file",
                    DEFAULT_INPUTS.skipReleaseFile
                ),
                releaseDirectory: getInputOrDefault("release-directory", ".")!,
                releaseFileName: getInputOrDefault(
                    "release-file-name",
                    DEFAULT_INPUTS.releaseFileName
                )!,
                createPrForBranchName: getInputOrDefault(
                    "create-pr-for-branch",
                    DEFAULT_INPUTS.createPrForBranchName
                )!,
                changelogVersionRegex: new RegExp(
                    getInputOrDefault("changelog-version-regex", null) ??
                        DEFAULT_INPUTS.changelogVersionRegex
                ),
            });
        });
    });
}

function getGenerateChangelog(): GenerateChangelogOptions {
    const generateChangelog =
        getInputOrDefault("generate-changelog", null)?.toLowerCase() ?? "auto";
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
