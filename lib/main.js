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
const exec = __importStar(require("@actions/exec"));
let isTestMode;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            isTestMode = getBooleanInputOrDefault("is_test_mode", false);
            const gitEmail = getInputOrDefault("git-email", "github-action@github.com");
            const gitUsername = getInputOrDefault("git-user-name", "Github Action");
            const inputVersion = getInputOrDefault("version", "");
            const skipChangelog = getBooleanInputOrDefault("skip-changelog", true);
            const releaseDirectory = getInputOrDefault("release_directory", ".");
            const releaseFilename = getInputOrDefault("release_file_name", "release");
            const createPrForBranchName = getInputOrDefault("create_pr_for_branch", "");
            yield setGitConfigs(gitEmail, gitUsername)
                .then(() => installStandardVersionPackage())
                .then(() => release(inputVersion, skipChangelog))
                .then(() => push())
                .then(() => readVersion().then(version => core.setOutput("version", version)))
                .then(() => createReleaseFile(releaseDirectory, releaseFilename))
                .then(() => createPr(createPrForBranchName));
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
function getInputOrDefault(name, defaultValue) {
    var _a;
    let input = (_a = core.getInput(name)) !== null && _a !== void 0 ? _a : defaultValue;
    if (input === "")
        input = defaultValue;
    core.info(`${name}: ${input}`);
    if (isTestMode)
        core.setOutput(name, input);
    return input;
}
function getBooleanInputOrDefault(name, defaultValue) {
    var _a;
    const input = (_a = core.getBooleanInput(name)) !== null && _a !== void 0 ? _a : defaultValue;
    core.info(`${name}: ${input}`);
    if (isTestMode)
        core.setOutput(name, input);
    return input;
}
function setGitConfigs(email, username) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("Config git...");
        return exec
            .getExecOutput(`git config --global user.email "${email}"`)
            .then(() => exec.getExecOutput(`git config --global user.name "${username}"`));
    });
}
function installStandardVersionPackage() {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("Install standard-version npm package...");
        return exec.getExecOutput("npm install -g standard-version");
    });
}
function release(version, skipChangelog) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("Create release...");
        let releaseCommand = "standard-version";
        if (version)
            releaseCommand += ` --release-as ${version}`;
        if (skipChangelog)
            releaseCommand += " --skip.changelog";
        core.info(`Command: ${releaseCommand}`);
        if (isTestMode)
            core.setOutput("releaseCommand", releaseCommand);
        return exec.getExecOutput(releaseCommand);
    });
}
function push() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isTestMode)
            return exec.getExecOutput("echo 'Test mode is enable so skipping push...'");
        core.info("Push...");
        return exec.getExecOutput("git push --follow-tags origin $(git rev-parse --abbrev-ref HEAD)");
    });
}
function readVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        return exec
            .getExecOutput("node -p -e \"require('./package.json').version\"")
            .then(result => result.stdout.trim())
            .then(version => {
            core.info(`Version: ${version}`);
            return version;
        });
    });
}
function createReleaseFile(directory, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info("Create release file...");
        return execBashCommand(`(cd ${directory}; zip -r $(git rev-parse --show-toplevel)/${filename}.zip .)`);
    });
}
function execBashCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        return exec.getExecOutput(`/bin/bash -c "${command}"`);
    });
}
function createPr(createPrForBranchName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!createPrForBranchName)
            return Promise.resolve(null);
        if (isTestMode) {
            core.info("Test mode is enable so skipping Create PR.");
            return Promise.resolve(null);
        }
        core.info("Create pull request...");
        return exec
            .getExecOutput("git rev-parse --abbrev-ref HEAD")
            .then(result => result.stdout.trim())
            .then(currentBranchName => exec.getExecOutput(`gh pr create -B ${createPrForBranchName} -H ${currentBranchName} --title "Merge ${currentBranchName} into ${createPrForBranchName}" --body "$(cat CHANGELOG.md)"`));
    });
}
main();
//# sourceMappingURL=main.js.map