import { compareVersions, isVersionValid, readVersion } from "../src/version";
import fs, { mkdtempSync, writeFileSync } from "fs";
import { join } from "path";

describe("isVersionValid", () => {
    test("should return true for valid version strings", () => {
        expect(isVersionValid("1")).toBe(true);
        expect(isVersionValid("1.0")).toBe(true);
        expect(isVersionValid("1.0.0")).toBe(true);
        expect(isVersionValid("1.2.3-alpha")).toBe(true);
        expect(isVersionValid("2.0.0-beta")).toBe(true);
        expect(isVersionValid("3.1.4-rc.1.2.3")).toBe(true);
        expect(isVersionValid("0.0.4")).toBe(true);
        expect(isVersionValid("0.0.0")).toBe(true);
        expect(isVersionValid("10.20.30")).toBe(true);
        expect(isVersionValid("1.1.2-prerelease+meta")).toBe(true);
        expect(isVersionValid("1.1.2+meta")).toBe(true);
        expect(isVersionValid("1.0.0-alpha.beta")).toBe(true);
        expect(isVersionValid("1.0.0-alpha.1")).toBe(true);
        expect(isVersionValid("1.0.0-rc.1+build.1")).toBe(true);
        expect(isVersionValid("10.2.3-DEV-SNAPSHOT")).toBe(true);
        expect(isVersionValid("1.2.3-SNAPSHOT-123")).toBe(true);
        expect(isVersionValid("2.0.0+build.1848")).toBe(true);
        expect(isVersionValid("2.0.1-alpha.1227")).toBe(true);
        expect(isVersionValid("1.2-SNAPSHOT")).toBe(true);
    });

    test("should return false for invalid version strings", () => {
        expect(isVersionValid("invalid")).toBe(false);
        expect(isVersionValid("1.0.0.0")).toBe(false);
        expect(isVersionValid("01.1.1")).toBe(false);
        expect(isVersionValid("01")).toBe(false);
        expect(isVersionValid("1.0.0-alpha_beta")).toBe(false);
        expect(isVersionValid("1.2.3.DEV")).toBe(false);
        expect(isVersionValid("1.2.3-0123")).toBe(false);
        expect(isVersionValid("9.8.7-whatever+meta+meta")).toBe(false);
    });
});

describe("readVersion", () => {
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
        const version = await readVersion(packageJsonPath);
        expect(version).toBe("1.0.0");
    });

    test("give invalid path, should throw error", async () => {
        await expect(readVersion("invalid path")).rejects.toThrow(
            "Can not find package.json in 'invalid path'"
        );
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
        expect(compareVersions("0", "1")).toBe(-1);
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
        expect(compareVersions("1", "0")).toBe(1);
        expect(compareVersions("1", "0.0")).toBe(1);
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
