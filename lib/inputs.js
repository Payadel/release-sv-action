"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInputs = exports.getInputsOrDefaults = void 0;
const utility_1 = require("./helpers/utility");
const version_1 = require("./helpers/version");
const git_1 = require("./helpers/git");
const fs_1 = __importDefault(require("fs"));
function getInputsOrDefaults(defaultInputs) {
    return new Promise(resolve => resolve({
        inputVersion: (0, utility_1.getInputOrDefault)("version", defaultInputs.inputVersion),
        versionRegex: getRegexOrDefault("version-regex", defaultInputs.versionRegex),
        ignoreLessVersionError: (0, utility_1.getBooleanInputOrDefault)("ignore-same-version-error", defaultInputs.ignoreLessVersionError),
        ignoreSameVersionError: (0, utility_1.getBooleanInputOrDefault)("ignore-less-version-error", defaultInputs.ignoreSameVersionError),
        generateChangelog: getGenerateChangelog(defaultInputs.generateChangelog),
        isTestMode: (0, utility_1.getBooleanInputOrDefault)("is-test-mode", defaultInputs.isTestMode),
        gitEmail: (0, utility_1.getInputOrDefault)("git-email", defaultInputs.gitEmail),
        gitUsername: (0, utility_1.getInputOrDefault)("git-user-name", defaultInputs.gitUsername),
        skipReleaseFile: (0, utility_1.getBooleanInputOrDefault)("skip-release-file", defaultInputs.skipReleaseFile),
        releaseDirectory: (0, utility_1.getInputOrDefault)("release-directory", defaultInputs.releaseDirectory),
        releaseFileName: (0, utility_1.getInputOrDefault)("release-file-name", defaultInputs.releaseFileName),
        createPrForBranchName: (0, utility_1.getInputOrDefault)("create-pr-for-branch", defaultInputs.createPrForBranchName),
        changelogHeaderRegex: getRegexOrDefault("changelog-header-regex", defaultInputs.changelogHeaderRegex),
    }));
}
exports.getInputsOrDefaults = getInputsOrDefaults;
function getGenerateChangelog(default_value) {
    var _a, _b;
    const generateChangelog = (_b = (_a = (0, utility_1.getInputOrDefault)("generate-changelog", undefined)) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : default_value;
    switch (generateChangelog) {
        case "auto":
        case "always":
        case "never":
            return generateChangelog;
        default:
            throw new Error(`The input generate-changelog '${generateChangelog}' is not valid. Supported values are auto, enable, disable`);
    }
}
function getRegexOrDefault(name, default_regex = undefined) {
    const versionRegexStr = (0, utility_1.getInputOrDefault)(name, undefined);
    if (versionRegexStr)
        return new RegExp(versionRegexStr);
    return default_regex ? new RegExp(default_regex) : undefined;
}
function validateInputs(inputs, currentVersion) {
    return new Promise((resolve, reject) => {
        if (!inputs.inputVersion)
            return resolve();
        return (0, version_1.versionMustValid)(inputs.inputVersion, currentVersion, inputs.ignoreSameVersionError, inputs.ignoreLessVersionError)
            .then(resolve)
            .catch(reject);
    })
        .then(() => {
        if (!fs_1.default.existsSync(inputs.releaseDirectory)) {
            return Promise.reject(new Error(`The directory '${inputs.releaseDirectory}' does not exists.`));
        }
        return Promise.resolve();
    })
        .then(() => {
        if (!inputs.createPrForBranchName)
            return Promise.resolve();
        return (0, git_1.ensureBranchNameIsValid)(inputs.createPrForBranchName);
    });
}
exports.validateInputs = validateInputs;
//# sourceMappingURL=inputs.js.map