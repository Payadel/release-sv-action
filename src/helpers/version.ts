// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string

import fs from "fs";
import { execCommand } from "./utility";
import { getReleaseCommand, runDry } from "./standard-version";
import * as core from "@actions/core";

export const SEMANTIC_VERSION_REGEX = new RegExp(
    "^(0|[1-9]\\d*)(\\.\\d+){0,2}(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$"
);

export function versionMustValid(
    inputVersion: string,
    currentVersion: string,
    ignoreSameVersionError = false,
    ignoreLessVersionError = false,
    versionRegex?: RegExp
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const pattern = versionRegex
            ? new RegExp(versionRegex)
            : SEMANTIC_VERSION_REGEX;

        core.debug(`Test ${inputVersion} with ${pattern.source}.`);
        if (!pattern.test(inputVersion)) {
            return reject(
                new Error(
                    `The version format '${inputVersion}' is not valid. If you want, you can change 'version-regex'.`
                )
            );
        }
        if (
            !ignoreSameVersionError &&
            inputVersion.toLowerCase() === currentVersion.toLowerCase()
        ) {
            return reject(
                new Error(
                    `The input version '${inputVersion}' is same to the current version. If you want, you can set 'ignore-same-version-error' to ignore this error."`
                )
            );
        }
        if (
            !ignoreLessVersionError &&
            compareVersions(inputVersion, currentVersion) < 0
        ) {
            return reject(
                new Error(
                    `The input version '${inputVersion}' is less than the current version '${currentVersion}'.  If you want, you can set 'ignore-less-version-error' to ignore this error.`
                )
            );
        }

        return resolve();
    });
}

export function readVersionFromNpm(package_path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!fs.existsSync(package_path)) {
            return reject(
                new Error(`Can not find package.json in '${package_path}'.`)
            );
        }
        if (!package_path.includes("/")) package_path = `./${package_path}`;
        core.debug(`Read version from ${package_path}`);

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
export function compareVersions(version1: string, version2: string): number {
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

export function detectNewVersion(inputVersion?: string): Promise<string> {
    if (inputVersion) return Promise.resolve(inputVersion);
    const releaseCommand = getReleaseCommand(true, inputVersion);
    return runDry(releaseCommand).then(parseNewVersionFromText);
}

export function parseNewVersionFromText(text: string): string {
    const regex = /✔ tagging release +v(\S+)/;
    const match = text.match(regex);
    if (match) return match[1];
    throw new Error(`Can not detect new version from ${text}`);
}
