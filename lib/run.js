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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
    return __awaiter(this, void 0, void 0, function* () {
        let inputs = yield _getValidatedInputs(default_inputs, package_json_file);
        if (inputs.isTestMode)
            core.warning("The test mode is enabled.");
        const outputs = {
            version: "",
            changelog: "",
            "release-filename": "",
            "pull-request-url": "",
        };
        yield (0, standard_version_1.installStandardVersionPackage)();
        let newVersion = yield _standardVersionRelease(inputs.gitEmail, inputs.gitUsername, inputs.generateChangelog, changelog_file, inputs.inputVersion, inputs.changelogHeaderRegex);
        yield _releaseFiles(inputs.skipReleaseFile, inputs.releaseDirectory, inputs.releaseFileName, outputs);
        yield (0, git_1.push)(inputs.isTestMode);
        let changelog = yield _changelog(changelog_file, newVersion, outputs, inputs.changelogHeaderRegex);
        yield _createPr(outputs, changelog, inputs.createPrForBranchName, inputs.isTestMode);
        outputs.version = newVersion;
        return (0, outputs_1.setOutputs)(outputs);
    });
}
function _getValidatedInputs(default_inputs, package_json_file) {
    return __awaiter(this, void 0, void 0, function* () {
        let inputs = yield (0, inputs_1.getInputsOrDefaults)(default_inputs);
        yield _validateInputs(inputs, package_json_file);
        return inputs;
    });
}
function _standardVersionRelease(gitEmail, gitUsername, generateChangelog, changelog_file, inputVersion, changelogHeaderRegex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, git_1.setGitConfigs)(gitEmail, gitUsername);
        return yield (0, standard_version_1.standardVersionRelease)(generateChangelog, changelog_file, inputVersion, changelogHeaderRegex);
    });
}
function _validateInputs(inputs, package_json_file) {
    return __awaiter(this, void 0, void 0, function* () {
        let currentVersion = yield (0, version_1.readVersionFromNpm)(package_json_file);
        yield (0, inputs_1.validateInputs)(inputs, currentVersion);
        return core.info("Inputs validated successfully.");
    });
}
function _createPr(outputs, body, createPrForBranchName, isTestMode = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!createPrForBranchName) {
            core.info("No branch name provided so skipping pull request creation.");
            return Promise.resolve(null);
        }
        let prLink = yield (0, prHelper_1.createPullRequest)(createPrForBranchName, body, isTestMode);
        return (outputs["pull-request-url"] = prLink !== null && prLink !== void 0 ? prLink : "");
    });
}
function _releaseFiles(skipReleaseFile, releaseDirectory, releaseFileName, outputs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (skipReleaseFile) {
            core.info("Skip release file is requested so skip create release file.");
            return Promise.resolve(null);
        }
        let releaseFileName1 = yield (0, utility_1.createReleaseFile)(releaseDirectory, releaseFileName);
        return (outputs["release-filename"] = releaseFileName1 !== null && releaseFileName1 !== void 0 ? releaseFileName1 : "");
    });
}
function _changelog(changelog_file, newVersion, outputs, changelogHeaderRegex) {
    return __awaiter(this, void 0, void 0, function* () {
        let changelog = yield (0, changelog_1.readChangelogSection)(changelog_file, newVersion, changelogHeaderRegex);
        outputs.changelog = changelog;
        return changelog;
    });
}
//# sourceMappingURL=run.js.map