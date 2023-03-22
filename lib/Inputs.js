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
exports.Inputs = void 0;
const core = __importStar(require("@actions/core"));
class Inputs {
    static Get() {
        return new Promise((resolve, reject) => {
            try {
                const inputs = {
                    isTestMode: Inputs.getBooleanInputOrDefault("is_test_mode", false),
                    gitEmail: Inputs.getInputOrDefault("git-email", "github-action@github.com"),
                    gitUsername: Inputs.getInputOrDefault("git-user-name", "Github Action"),
                    inputVersion: Inputs.getInputOrDefault("version", ""),
                    skipChangelog: Inputs.getBooleanInputOrDefault("skip-changelog", true),
                    skipReleaseFile: Inputs.getBooleanInputOrDefault("skip_release_file", true),
                    releaseDirectory: Inputs.getInputOrDefault("release_directory", "."),
                    releaseFilename: Inputs.getInputOrDefault("release_file_name", "release"),
                    createPrForBranchName: Inputs.getInputOrDefault("create_pr_for_branch", ""),
                };
                resolve(inputs);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    static exportInputsInTestMode(inputs) {
        for (const key of Object.getOwnPropertyNames(inputs)) {
            core.setOutput(key, inputs[key]);
        }
    }
    static getInputOrDefault(name, defaultValue) {
        var _a;
        let input = (_a = core.getInput(name)) !== null && _a !== void 0 ? _a : defaultValue;
        if (input === "")
            input = defaultValue;
        core.info(`${name}: ${input}`);
        return input;
    }
    static getBooleanInputOrDefault(name, defaultValue) {
        var _a;
        const input = (_a = core.getBooleanInput(name)) !== null && _a !== void 0 ? _a : defaultValue;
        core.info(`${name}: ${input}`);
        return input;
    }
}
exports.Inputs = Inputs;
//# sourceMappingURL=Inputs.js.map