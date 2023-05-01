"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INPUTS = void 0;
const changelog_1 = require("./helpers/changelog");
const version_1 = require("./helpers/version");
exports.DEFAULT_INPUTS = {
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
    versionRegex: version_1.SEMANTIC_VERSION_REGEX,
    changelogHeaderRegex: changelog_1.DEFAULT_CHANGELOG_HEADER_REGEX,
};
//# sourceMappingURL=configs.js.map