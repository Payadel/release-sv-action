"use strict";
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareVersions = exports.readVersion = exports.isVersionValid = void 0;
const fs_1 = __importDefault(require("fs"));
const utility_1 = require("./utility");
const SEMANTIC_VERSION_REGEX = /^(0|[1-9]\d*)(\.\d+){0,2}(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
function isVersionValid(version) {
    return SEMANTIC_VERSION_REGEX.test(version);
}
exports.isVersionValid = isVersionValid;
function readVersion(package_path) {
    return new Promise((resolve, reject) => {
        if (!fs_1.default.existsSync(package_path)) {
            return reject(new Error(`Can not find package.json in '${package_path}'.`));
        }
        return (0, utility_1.execCommand)(`node -p -e "require('${package_path}').version"`, `Read version from '${package_path}' failed.`).then(version => resolve(version.stdout.trim()));
    });
}
exports.readVersion = readVersion;
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
//# sourceMappingURL=version.js.map