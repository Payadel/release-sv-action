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
    skipChangelog: boolean;
    skipReleaseFile: boolean;
    releaseDirectory: string;
    releaseFileName: string;
    createPrForBranchName: string;
    changelogVersionRegex: RegExp;
}

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
                isTestMode: getBooleanInputOrDefault("is-test-mode", false),
                gitEmail: getInputOrDefault(
                    "git-email",
                    "github-action@github.com"
                )!,
                gitUsername: getInputOrDefault(
                    "git-user-name",
                    "Github Action"
                )!,
                skipChangelog: getBooleanInputOrDefault("skip-changelog", true),
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
