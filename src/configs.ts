import { IInputs } from "./inputs";
import { DEFAULT_CHANGELOG_HEADER_REGEX } from "./helpers/changelog";
import { SEMANTIC_VERSION_REGEX } from "./helpers/version";

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
