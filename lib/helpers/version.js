"use strict";
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectNewVersion = exports.compareVersions = exports.readVersionFromNpm = exports.versionMustValid = exports.SEMANTIC_VERSION_REGEX = void 0;
const fs_1 = __importDefault(require("fs"));
const utility_1 = require("./utility");
const standard_version_1 = require("./standard-version");
const core = __importStar(require("@actions/core"));
exports.SEMANTIC_VERSION_REGEX = /^(0|[1-9]\d*)(\.\d+){0,2}(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
function versionMustValid(inputVersion, currentVersion, ignoreSameVersionError = false, ignoreLessVersionError = false, versionRegex) {
    return new Promise((resolve, reject) => {
        const pattern = versionRegex
            ? new RegExp(versionRegex)
            : exports.SEMANTIC_VERSION_REGEX;
        core.debug(`Test ${inputVersion} with ${pattern.source}.`);
        if (!pattern.test(inputVersion)) {
            return reject(new Error(`The version format '${inputVersion}' is not valid. If you want, you can change 'version-regex'.`));
        }
        if (!ignoreSameVersionError &&
            inputVersion.toLowerCase() === currentVersion.toLowerCase()) {
            return reject(new Error(`The input version '${inputVersion}' is same to the current version. If you want, you can set 'ignore-same-version-error' to ignore this error."`));
        }
        if (!ignoreLessVersionError &&
            compareVersions(inputVersion, currentVersion) < 0) {
            return reject(new Error(`The input version '${inputVersion}' is less than the current version '${currentVersion}'.  If you want, you can set 'ignore-less-version-error' to ignore this error.`));
        }
        return resolve();
    });
}
exports.versionMustValid = versionMustValid;
function readVersionFromNpm(package_path) {
    return new Promise((resolve, reject) => {
        if (!fs_1.default.existsSync(package_path)) {
            return reject(new Error(`Can not find package.json in '${package_path}'.`));
        }
        if (!package_path.includes("/"))
            package_path = `./${package_path}`;
        core.debug(`Read version from ${package_path}`);
        return (0, utility_1.execCommand)(`node -p -e "require('${package_path}').version"`, `Read version from '${package_path}' failed.`).then(version => resolve(version.stdout.trim()));
    });
}
exports.readVersionFromNpm = readVersionFromNpm;
/**
 * Compare two semantic version numbers and return a number indicating their order.
 *
 * @param {string} version1 - The first version number to compare.
 * @param {string} version2 - The second version number to compare.
 *
 * @returns {number} Returns -1 if version1 is less than version2, 0 if they are equal, or 1 if version1 is greater than version2.
 */
function compareVersions(version1, version2) {
    const v1 = version1.split(".");
    const v2 = version2.split(".");
    for (let i = 0; i < v1.length || i < v2.length; i++) {
        const num1 = parseInt(v1[i], 10) || 0;
        const num2 = parseInt(v2[i], 10) || 0;
        if (num1 > num2) {
            return 1;
        }
        else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}
exports.compareVersions = compareVersions;
function detectNewVersion(inputVersion) {
    if (inputVersion)
        return Promise.resolve(inputVersion);
    const releaseCommand = (0, standard_version_1.getReleaseCommand)(true, inputVersion);
    return (0, standard_version_1.runDry)(releaseCommand).then(parseNewVersionFromText);
}
exports.detectNewVersion = detectNewVersion;
function parseNewVersionFromText(text) {
    const regex = /v(\d+\.\d+\.\d+)/;
    const match = text.match(regex);
    if (match)
        return match[1];
    throw new Error(`Can not detect new version from ${text}`);
}
//# sourceMappingURL=version.js.map