import fs from "fs";
import path from "path";
import {
    isNeedGenerateChangelog,
    readChangelogSection,
} from "../../src/helpers/changelog";
import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks.utility";

function createChangelog(directory: string): string {
    const changelogFile = path.join(directory, "CHANGELOG.md");
    const changelogData = `# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.3](https://github.com/Payadel/changelog-sv-action/compare/v0.0.2...v0.0.3) (2023-04-27)

### Features

* add \`ignore-same-version-error\` input to ignore same version error ([22898f7](https://github.com/Payadel/changelog-sv-action/commit/22898f7a4466db581497f8d832ebcbae47a53b6c))


### Development: CI/CD, Build, etc

* **deps:** bump Payadel/release-sv-action from 0.2.1 to 0.2.2 ([8f84614](https://github.com/Payadel/changelog-sv-action/commit/8f846147fab9213cff470114c234ce814206c204))

### 0.0.1 (2023-03-17)

### Features

* add base
  codes ([e20fe7c](https://github.com/Payadel/changelog-sv-action/commit/e20fe7c4a10eb59f821a4b83155b8702970fe871))
* try install the standard-version package in the first
  script ([9c931a8](https://github.com/Payadel/changelog-sv-action/commit/9c931a8a98ddc9d8e9653426074347f06ad7624c))

### Documents

* add Payadel readme
  template ([8b9a806](https://github.com/Payadel/changelog-sv-action/commit/8b9a806273d73b3aa90859cd42f7029d174a1474))
`;
    fs.writeFileSync(changelogFile, changelogData);
    return changelogFile;
}

describe("readChangelogSection", () => {
    let tempDir;
    let changelogFile;

    beforeEach(() => {
        // Create temp directory and changelog file
        tempDir = fs.mkdtempSync("/tmp/");
        changelogFile = createChangelog(tempDir);
    });

    afterEach(async () => {
        // Remove temp directory and files
        await fs.rmSync(tempDir, { recursive: true });
    });

    it("should read the changelog section 0.0.3", async () => {
        const version = "0.0.3";
        const expectedSection = `### [0.0.3](https://github.com/Payadel/changelog-sv-action/compare/v0.0.2...v0.0.3) (2023-04-27)

### Features

* add \`ignore-same-version-error\` input to ignore same version error ([22898f7](https://github.com/Payadel/changelog-sv-action/commit/22898f7a4466db581497f8d832ebcbae47a53b6c))


### Development: CI/CD, Build, etc

* **deps:** bump Payadel/release-sv-action from 0.2.1 to 0.2.2 ([8f84614](https://github.com/Payadel/changelog-sv-action/commit/8f846147fab9213cff470114c234ce814206c204))
`;

        const section = await readChangelogSection(changelogFile, version);

        expect(section).toBe(expectedSection);
    });

    it("should read latest version", async () => {
        const expectedSection = `### [0.0.3](https://github.com/Payadel/changelog-sv-action/compare/v0.0.2...v0.0.3) (2023-04-27)

### Features

* add \`ignore-same-version-error\` input to ignore same version error ([22898f7](https://github.com/Payadel/changelog-sv-action/commit/22898f7a4466db581497f8d832ebcbae47a53b6c))


### Development: CI/CD, Build, etc

* **deps:** bump Payadel/release-sv-action from 0.2.1 to 0.2.2 ([8f84614](https://github.com/Payadel/changelog-sv-action/commit/8f846147fab9213cff470114c234ce814206c204))
`;

        const section = await readChangelogSection(changelogFile);

        expect(section).toBe(expectedSection);
    });

    it("should read the changelog section 0.0.1", async () => {
        const version = "0.0.1";
        const expectedSection = `### 0.0.1 (2023-03-17)

### Features

* add base
  codes ([e20fe7c](https://github.com/Payadel/changelog-sv-action/commit/e20fe7c4a10eb59f821a4b83155b8702970fe871))
* try install the standard-version package in the first
  script ([9c931a8](https://github.com/Payadel/changelog-sv-action/commit/9c931a8a98ddc9d8e9653426074347f06ad7624c))

### Documents

* add Payadel readme
  template ([8b9a806](https://github.com/Payadel/changelog-sv-action/commit/8b9a806273d73b3aa90859cd42f7029d174a1474))`;

        const section = await readChangelogSection(changelogFile, version);

        expect(section).toBe(expectedSection);
    });

    it("should throw an error if can not find any changelog header", async () => {
        const version = "2.0.0";
        const pattern = /fake/;

        await expect(
            readChangelogSection(changelogFile, version, pattern)
        ).rejects.toThrow(
            new RegExp("Can not find or detect any changelog header.")
        );
    });

    it("should throw an error if the changelog header cannot be found", async () => {
        const version = "2.0.0";

        await expect(
            readChangelogSection(changelogFile, version)
        ).rejects.toThrow(
            new RegExp(
                "Can not find or detect any changelog with version 2.0.0."
            )
        );
    });
});

describe("isNeedGenerateChangelog", () => {
    it("simple inputs", async () => {
        let result = await isNeedGenerateChangelog("always", "", "");
        expect(result).toBe(true);

        result = await isNeedGenerateChangelog("never", "", "");
        expect(result).toBe(false);
    });
});

describe("isNeedGenerateChangelog-auto", () => {
    jest.mock("@actions/exec");
    let tempDir;
    let changelogFile;

    beforeEach(() => {
        jest.resetAllMocks();

        // Create temp directory and changelog file
        tempDir = fs.mkdtempSync("/tmp/");
        changelogFile = createChangelog(tempDir);
    });

    afterEach(async () => {
        // Remove temp directory and files
        await fs.rmSync(tempDir, { recursive: true });
    });

    it("auto detection.", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command:
                        "standard-version --release-as 100.100.100 --skip.changelog --dry-run",
                    success: true,
                    resolve: {
                        stdout:
                            "✔ bumping version in package.json from 0.2.2 to 100.100.100\n" +
                            "✔ bumping version in package-lock.json from 0.2.2 to 100.100.100\n" +
                            "✔ committing package-lock.json and package.json\n" +
                            "✔ tagging release v100.100.100\n" +
                            "ℹ Run `git push --follow-tags origin dev && npm publish` to publish\n",
                        stderr: "",
                        exitCode: 0,
                    },
                },
            ])
        );

        const result = await isNeedGenerateChangelog(
            "auto",
            changelogFile,
            "100.100.100"
        );

        expect(result).toBe(true);
    });
});
