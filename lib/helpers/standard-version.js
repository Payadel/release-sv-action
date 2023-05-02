"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardVersionRelease = exports.runDry = exports.getReleaseCommand = exports.installStandardVersionPackage = void 0;
const utility_1 = require("./utility");
const changelog_1 = require("./changelog");
const version_1 = require("./version");
function installStandardVersionPackage() {
    return (0, utility_1.execCommand)("npm install -g standard-version", "Can not install standard version npm package.");
}
exports.installStandardVersionPackage = installStandardVersionPackage;
function getReleaseCommand(skipChangelog, inputVersion) {
    let releaseCommand = "standard-version";
    if (inputVersion)
        releaseCommand += ` --release-as ${inputVersion}`;
    if (skipChangelog)
        releaseCommand += " --skip.changelog";
    return releaseCommand;
}
exports.getReleaseCommand = getReleaseCommand;
function runDry(command) {
    const dryFlag = " --dry-run";
    if (!command.toLowerCase().includes(dryFlag))
        command += dryFlag;
    return (0, utility_1.execCommand)(command).then(output => output.stdout.trim());
}
exports.runDry = runDry;
function standardVersionRelease(generateChangelogOption, changelog_file, inputVersion, changelogHeaderRegex) {
    return (0, changelog_1.isNeedGenerateChangelog)(generateChangelogOption, changelog_file, inputVersion, changelogHeaderRegex)
        .then(needCreateChangelog => getReleaseCommand(!needCreateChangelog, inputVersion))
        .then(releaseCommand => (0, utility_1.execCommand)(releaseCommand))
        .then(output => (0, version_1.parseNewVersionFromText)(output.stdout));
}
exports.standardVersionRelease = standardVersionRelease;
//# sourceMappingURL=standard-version.js.map