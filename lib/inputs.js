"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const utility_1 = require("./utility");
const version_1 = require("./version");
function getInputs() {
    return new Promise((resolve, reject) => {
        const version = (0, utility_1.getInputOrDefault)("version", "", true, false);
        if (version && !(0, version_1.isVersionValid)(version))
            return reject(new Error("The input version is not valid."));
        return resolve({
            version,
            isTestMode: (0, utility_1.getBooleanInputOrDefault)("is-test-mode", false),
            gitEmail: (0, utility_1.getInputOrDefault)("git-email", "github-action@github.com"),
            gitUsername: (0, utility_1.getInputOrDefault)("git-user-name", "Github Action"),
            skipChangelog: (0, utility_1.getBooleanInputOrDefault)("skip-changelog", true),
            skipReleaseFile: (0, utility_1.getBooleanInputOrDefault)("skip-release-file", true),
            releaseDirectory: (0, utility_1.getInputOrDefault)("release-directory", "."),
            releaseFileName: (0, utility_1.getInputOrDefault)("release-file-name", "release"),
            createPrForBranchName: (0, utility_1.getInputOrDefault)("create-pr-for-branch", ""),
        });
    });
}
exports.getInputs = getInputs;
//# sourceMappingURL=inputs.js.map