import { IInputs } from "./inputs";
import { DEFAULT_CHANGELOG_HEADER_REGEX } from "./helpers/changelog";

export const SEMANTIC_VERSION_REGEX =
    /(0|[1-9]\d*)(\.\d+){0,2}(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/;

export const DEFAULT_INPUTS: IInputs = {
    inputVersion: "",
    ignoreSameVersionError: false,
    ignoreLessVersionError: false,
    createPrForBranchName: "",
    generateChangelog: "auto",
    skipReleaseFile: true,
    releaseDirectory: ".",
    releaseFileName: "release",
    isTestMode: false,
    gitEmail: "github-action@github.com",
    gitUsername: "Github Action",
    versionRegex: SEMANTIC_VERSION_REGEX,
    changelogHeaderRegex: DEFAULT_CHANGELOG_HEADER_REGEX,
};
