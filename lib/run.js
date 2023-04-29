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
const utility_1 = require("./utility");
const prHelper_1 = require("./prHelper");
const outputs_1 = require("./outputs");
const run = () => mainProcess()
    .then(() => core.info("Operation completed successfully."))
    .catch(error => {
    core.error("Operation failed.");
    core.setFailed(error instanceof Error ? error.message : error.toString());
});
exports.default = run;
function mainProcess() {
    return (0, inputs_1.getInputs)().then(inputs => {
        const outputs = {};
        return (0, utility_1.installStandardVersionPackage)()
            .then(() => (0, utility_1.setGitConfigs)(inputs.gitEmail, inputs.gitUsername))
            .then(() => (0, utility_1.svRelease)(inputs.version, inputs.skipChangelog))
            .then(() => releaseFiles(inputs.skipReleaseFile, inputs.releaseDirectory, inputs.releaseFileName).then(releaseFileName => (outputs.releaseFileName = releaseFileName !== null && releaseFileName !== void 0 ? releaseFileName : "")))
            .then(() => (0, utility_1.operateWhen)(!inputs.isTestMode, utility_1.push, "The test mode is enabled so skipping push."))
            .then(() => createPr(inputs.createPrForBranchName, inputs.isTestMode).then(prLink => (outputs.pullRequestUrl = prLink !== null && prLink !== void 0 ? prLink : "")))
            .then(() => (0, outputs_1.setOutputs)(outputs));
    });
}
function createPr(createPrForBranchName, isTestMode = false) {
    if (isTestMode) {
        core.info("The test mode is enabled so skipping pull request creation.");
        return Promise.resolve(null);
    }
    if (!createPrForBranchName) {
        core.info("No branch name provided so skipping pull request creation.");
        return Promise.resolve(null);
    }
    return (0, prHelper_1.createPullRequest)(createPrForBranchName);
}
function releaseFiles(skipReleaseFile, releaseDirectory, releaseFileName) {
    if (skipReleaseFile) {
        core.info("Skip release file is requested so skip create release file.");
        return Promise.resolve(null);
    }
    return (0, utility_1.createReleaseFile)(releaseDirectory, releaseFileName);
}
//# sourceMappingURL=run.js.map