import { getBooleanInputOrDefault, getInputOrDefault } from "./utility";
import { readVersion, versionMustValid } from "./version";
import {
    DEFAULT_CHANGELOG_VERSION_REGEX,
    SEMANTIC_VERSION_REGEX,
} from "./configs";

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
    skipReleaseFile: boolean;
    releaseDirectory: string;
    releaseFileName: string;
    createPrForBranchName: string;
    changelogVersionRegex: RegExp;
}

export type GenerateChangelogOptions = "always" | "never" | "auto";

export function getInputs(): Promise<IInputs> {
    return new Promise<IInputs>(resolve => {
        const versionRegex = new RegExp(
            getInputOrDefault("version-regex", null) ?? SEMANTIC_VERSION_REGEX
        );
        const ignoreSameVersionError = getBooleanInputOrDefault(
            "ignore-same-version-error",
            false
        );
        const ignoreLessVersionError = getBooleanInputOrDefault(
            "ignore-less-version-error",
            false
        );
        return readVersion("package.json").then(currentVersion => {
            const inputVersion = getInputOrDefault("version", "", true, false)!;
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
                isTestMode: getBooleanInputOrDefault("is-test-mode", false),
                gitEmail: getInputOrDefault(
                    "git-email",
                    "github-action@github.com"
                )!,
                gitUsername: getInputOrDefault(
                    "git-user-name",
                    "Github Action"
                )!,
                skipReleaseFile: getBooleanInputOrDefault(
                    "skip-release-file",
                    true
                ),
                releaseDirectory: getInputOrDefault("release-directory", ".")!,
                releaseFileName: getInputOrDefault(
                    "release-file-name",
                    "release"
                )!,
                createPrForBranchName: getInputOrDefault(
                    "create-pr-for-branch",
                    ""
                )!,
                changelogVersionRegex: new RegExp(
                    getInputOrDefault("changelog-version-regex", null) ??
                        DEFAULT_CHANGELOG_VERSION_REGEX
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
