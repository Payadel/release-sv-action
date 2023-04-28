// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string

import fs from "fs";
import { execCommand } from "./utility";

const SEMANTIC_VERSION_REGEX =
    /^(0|[1-9]\d*)(\.\d+){0,2}(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export function isVersionValid(version: string): boolean {
    return SEMANTIC_VERSION_REGEX.test(version);
}

export function readVersion(package_path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!fs.existsSync(package_path)) {
            return reject(
                new Error(`Can not find package.json in '${package_path}'.`)
            );
        }
        return execCommand(
            `node -p -e "require('${package_path}').version"`,
            `Read version from '${package_path}' failed.`
        ).then(version => resolve(version.stdout.trim()));
    });
}

/**
 * Compare two semantic version numbers and return a number indicating their order.
 *
 * @param {string} version1 - The first version number to compare.
 * @param {string} version2 - The second version number to compare.
 *
 * @returns {number} Returns -1 if version1 is less than version2, 0 if they are equal, or 1 if version1 is greater than version2.
 */
export function compareVersions(version1, version2): number {
    const v1 = version1.split(".");
    const v2 = version2.split(".");

    for (let i = 0; i < v1.length || i < v2.length; i++) {
        const num1 = parseInt(v1[i], 10) || 0;
        const num2 = parseInt(v2[i], 10) || 0;

        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
}
