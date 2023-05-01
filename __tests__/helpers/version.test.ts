import {
    compareVersions,
    detectNewVersion,
    readVersionFromNpm,
    versionMustValid,
} from "../../src/helpers/version";
import fs, { mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import { DEFAULT_INPUTS } from "../../src/configs";
import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks";

describe("readVersionFromNpm", () => {
    let tempDir: string;
    let packageJsonPath: string;

    beforeEach(() => {
        // Create a unique temporary directory with a random name
        tempDir = mkdtempSync("/tmp/test-");

        // Write a package.json file to the temporary directory
        packageJsonPath = join(tempDir, "package.json");
        const packageJson = { name: "test", version: "1.0.0" };
        writeFileSync(packageJsonPath, JSON.stringify(packageJson));
    });

    afterEach(() => {
        // Delete the temporary directory
        fs.rmSync(tempDir, { recursive: true });
    });

    test("should read version from package.json", async () => {
        const version = await readVersionFromNpm(packageJsonPath);
        expect(version).toBe("1.0.0");
    });

    test("give invalid path, should throw error", async () => {
        await expect(readVersionFromNpm("invalid path")).rejects.toThrow(
            "Can not find package.json in 'invalid path'"
        );
    });
});

describe("versionMustValid", () => {
    it("give valid inputs. expect not throw exception", () => {
        // Arrange
        const inputVersion = "1.2.3";
        const currentVersion = "1.0.0";
        const versionRegex = /^\d+\.\d+\.\d+$/;

        // Act & Assert
        expect(() =>
            versionMustValid(
                inputVersion,
                currentVersion,
                false,
                false,
                versionRegex
            )
        ).not.toThrow();
    });

    it("version not match with regex", () => {
        // Arrange
        const inputVersion = "abc";
        const currentVersion = "1.0.0";

        // Act & Assert
        expect(() =>
            versionMustValid(inputVersion, currentVersion, false, false)
        ).rejects.toThrow(
            "The version format 'abc' is not valid. If you want, you can change 'version-regex'."
        );
    });

    it("same input and current version without ignoreSameVersionError, expect throw error", () => {
        // Arrange
        const inputVersion = "1.0.0";
        const currentVersion = "1.0.0";
        const versionRegex = DEFAULT_INPUTS.versionRegex;
        const ignoreSameVersionError = false;

        // Act & Assert
        expect(() =>
            versionMustValid(
                inputVersion,
                currentVersion,
                ignoreSameVersionError,
                false,
                versionRegex
            )
        ).rejects.toThrow(Error);
    });

    it("same input and current version with ignoreSameVersionError, expect throw error", () => {
        // Arrange
        const inputVersion = "1.0.0";
        const currentVersion = "1.0.0";
        const versionRegex = DEFAULT_INPUTS.versionRegex;
        const ignoreSameVersionError = true;

        // Act & Assert
        expect(() =>
            versionMustValid(
                inputVersion,
                currentVersion,
                ignoreSameVersionError,
                false,
                versionRegex
            )
        ).not.toThrow();
    });

    it("Input version less than current version without ignoreLessVersionError. expect throw error", () => {
        // Arrange
        const inputVersion = "1.0.0";
        const currentVersion = "1.1.0";
        const versionRegex = DEFAULT_INPUTS.versionRegex;
        const ignoreLessVersionError = false;

        // Act & Assert
        expect(() =>
            versionMustValid(
                inputVersion,
                currentVersion,
                false,
                ignoreLessVersionError,
                versionRegex
            )
        ).rejects.toThrow(Error);
    });

    it("Input version less than current version with ignoreLessVersionError. expect throw error", () => {
        // Arrange
        const inputVersion = "1.0.0";
        const currentVersion = "1.1.0";
        const versionRegex = DEFAULT_INPUTS.versionRegex;
        const ignoreLessVersionError = true;

        // Act & Assert
        expect(() =>
            versionMustValid(
                inputVersion,
                currentVersion,
                false,
                ignoreLessVersionError,
                versionRegex
            )
        ).not.toThrow(Error);
    });
});

describe("compareVersions", () => {
    it("returns 0 when the versions are equal", () => {
        expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
        expect(compareVersions("1", "1")).toBe(0);
        expect(compareVersions("0", "0")).toBe(0);
        expect(compareVersions("1.0", "1.0")).toBe(0);
        expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
        expect(compareVersions("1.0.0-alpha", "1.0.0-alpha")).toBe(0);
    });

    it("returns -1 when the first version is less than the second", () => {
        expect(compareVersions("1.2.3", "1.2.4")).toBe(-1);
        expect(compareVersions("1.2.3", "1.3.0")).toBe(-1);
        expect(compareVersions("1.2.3", "2.0.0")).toBe(-1);
        expect(compareVersions("0", "1.0.0")).toBe(-1);
        expect(compareVersions("0.0", "1")).toBe(-1);
        expect(compareVersions("0.0.0-beta", "1")).toBe(-1);
        expect(compareVersions("0.10.10", "1")).toBe(-1);
        expect(compareVersions("1", "1.1")).toBe(-1);
        expect(compareVersions("1", "1.0.1")).toBe(-1);
    });

    it("returns 1 when the first version is greater than the second", () => {
        expect(compareVersions("1.2.4", "1.2.3")).toBe(1);
        expect(compareVersions("1.3.0", "1.2.3")).toBe(1);
        expect(compareVersions("2.0.0", "1.2.3")).toBe(1);
        expect(compareVersions("1.0.0", "0")).toBe(1);
        expect(compareVersions("1", "0.0.0")).toBe(1);
        expect(compareVersions("1", "0.0.0-beta")).toBe(1);
        expect(compareVersions("1", "0.10.10")).toBe(1);
        expect(compareVersions("1.1", "1")).toBe(1);
        expect(compareVersions("1.0.1", "1")).toBe(1);
    });

    it("treats missing parts as zeros", () => {
        expect(compareVersions("1.2", "1.2.0")).toBe(0);
        expect(compareVersions("1.2.0", "1.2")).toBe(0);
        expect(compareVersions("1", "1.0.0")).toBe(0);
        expect(compareVersions("1.0.0", "1")).toBe(0);
    });
});

describe("detectNewVersion", () => {
    jest.mock("@actions/exec");
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("give inputVersion", async () => {
        const inputVersion = "1.0.0";

        await expect(detectNewVersion(inputVersion)).resolves.toBe(
            inputVersion
        );
    });

    it("not give inputVersion", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "standard-version --skip.changelog --dry-run",
                    success: true,
                    resolve: {
                        stdout:
                            "✔ bumping version in package.json from 0.2.2 to 0.3.0\n" +
                            "✔ bumping version in package-lock.json from 0.2.2 to 0.3.0\n" +
                            "✔ committing package-lock.json and package.json\n" +
                            "✔ tagging release v0.3.0\n" +
                            "ℹ Run `git push --follow-tags origin dev && npm publish` to publish",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(detectNewVersion()).resolves.toBe("0.3.0");
    });
});
