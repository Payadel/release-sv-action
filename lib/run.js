"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const inputs_1 = require("./inputs");
const utility_1 = require("./helpers/utility");
const prHelper_1 = require("./helpers/prHelper");
const outputs_1 = require("./outputs");
const version_1 = require("./helpers/version");
const standard_version_1 = require("./helpers/standard-version");
const git_1 = require("./helpers/git");
const changelog_1 = require("./helpers/changelog");
const run = (default_inputs, package_json_path, changelog_file) => mainProcess(default_inputs, package_json_path, changelog_file)
    .then(() => core.info("Operation completed successfully."))
    .catch(error => {
    core.error("Operation failed.");
    core.setFailed(error instanceof Error ? error.message : error.toString());
});
exports.default = run;
function mainProcess(default_inputs, package_json_file, changelog_file) {
    return _getValidatedInputs(default_inputs, package_json_file).then(inputs => {
        if (inputs.isTestMode)
            core.warning("The test mode is enabled.");
        const outputs = {
            version: "",
            changelog: "",
            "release-filename": "",
            "pull-request-url": "",
        };
        return (0, standard_version_1.installStandardVersionPackage)()
            .then(() => _standardVersionRelease(inputs.gitEmail, inputs.gitUsername, inputs.generateChangelog, changelog_file, inputs.inputVersion, inputs.changelogHeaderRegex))
            .then(newVersion => _releaseFiles(inputs.skipReleaseFile, inputs.releaseDirectory, inputs.releaseFileName, outputs)
            .then(() => (0, git_1.push)(inputs.isTestMode))
            .then(() => _changelog(changelog_file, newVersion, outputs, inputs.changelogHeaderRegex))
            .then(changelog => _createPr(outputs, changelog, inputs.createPrForBranchName, inputs.isTestMode))
            .then(() => (outputs.version = newVersion))
            .then(() => (0, outputs_1.setOutputs)(outputs)));
    });
}
function _getValidatedInputs(default_inputs, package_json_file) {
    return (0, inputs_1.getInputsOrDefaults)(default_inputs).then(inputs => _validateInputs(inputs, package_json_file).then(() => inputs));
}
function _standardVersionRelease(gitEmail, gitUsername, generateChangelog, changelog_file, inputVersion, changelogHeaderRegex) {
    return (0, git_1.setGitConfigs)(gitEmail, gitUsername).then(() => (0, standard_version_1.standardVersionRelease)(generateChangelog, changelog_file, inputVersion, changelogHeaderRegex));
}
function _validateInputs(inputs, package_json_file) {
    return (0, version_1.readVersionFromNpm)(package_json_file).then(currentVersion => (0, inputs_1.validateInputs)(inputs, currentVersion).then(() => core.info("Inputs validated successfully.")));
}
function _createPr(outputs, body, createPrForBranchName, isTestMode = false) {
    if (!createPrForBranchName) {
        core.info("No branch name provided so skipping pull request creation.");
        return Promise.resolve(null);
    }
    return (0, prHelper_1.createPullRequest)(createPrForBranchName, body, isTestMode).then(prLink => (outputs["pull-request-url"] = prLink !== null && prLink !== void 0 ? prLink : ""));
}
function _releaseFiles(skipReleaseFile, releaseDirectory, releaseFileName, outputs) {
    if (skipReleaseFile) {
        core.info("Skip release file is requested so skip create release file.");
        return Promise.resolve(null);
    }
    return (0, utility_1.createReleaseFile)(releaseDirectory, releaseFileName).then(releaseFileName => (outputs["release-filename"] = releaseFileName !== null && releaseFileName !== void 0 ? releaseFileName : ""));
}
function _changelog(changelog_file, newVersion, outputs, changelogHeaderRegex) {
    return (0, changelog_1.readChangelogSection)(changelog_file, newVersion, changelogHeaderRegex).then(changelog => {
        outputs.changelog = changelog;
        return changelog;
    });
}
//# sourceMappingURL=run.js.map