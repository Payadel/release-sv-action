import { IInputs } from "./inputs";

export const DEFAULT_CHANGELOG_VERSION_REGEX =
    /#+[ ]+((\[[^\\]]+\]\([^)]+\))|[^ ]+)[ ]+\([^)]+\)/;

export const SEMANTIC_VERSION_REGEX =
    /^(0|[1-9]\d*)(\.\d+){0,2}(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export const DEFAULT_INPUTS: IInputs = {
    isTestMode: false,
    gitEmail: "github-action@github.com",
    gitUsername: "Github Action",
    inputVersion: "",
    versionRegex: SEMANTIC_VERSION_REGEX,
    ignoreSameVersionError: false,
    ignoreLessVersionError: false,
    generateChangelog: "auto",
    skipReleaseFile: true,
    releaseDirectory: ".",
    releaseFileName: "release",
    createPrForBranchName: "",
    changelogVersionRegex: DEFAULT_CHANGELOG_VERSION_REGEX,
    currentVersion: "",
};
