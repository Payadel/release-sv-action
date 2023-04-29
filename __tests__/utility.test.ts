import * as core from "@actions/core";
import { mockGetInput } from "./inputs.test";
import {
    createReleaseFile,
    execBashCommand,
    execCommand,
    getBooleanInputOrDefault,
    getCurrentBranchName,
    getInputOrDefault,
    push,
    readChangelogSection,
    readFile,
    setGitConfigs,
} from "../src/helpers/utility";
import fs, { mkdtempSync, writeFileSync } from "fs";
import path, { join } from "path";
import { DEFAULT_CHANGELOG_VERSION_REGEX } from "../src/configs";
import * as exec from "@actions/exec";

jest.mock("@actions/core");
jest.mock("@actions/exec");

interface IExpectedCommand {
    command: string;
    success: boolean;
    resolve?: {
        stdout: string;
        stderr: string;
        exitCode: number;
    };
    rejectMessage?: string;
}

function mockGetExecOutput(
    command: string,
    expectedCommands: IExpectedCommand[]
): Promise<exec.ExecOutput> {
    command = command.toLowerCase();
    const target = expectedCommands.find(
        input => input.command.toLowerCase() === command
    );
    if (!target) return Promise.reject(new Error("Command not found."));
    return target.success
        ? Promise.resolve<exec.ExecOutput>(target.resolve!)
        : Promise.reject<exec.ExecOutput>(new Error(target.rejectMessage!));
}

describe("getCurrentBranchName", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("execute successful. expected return trim branch name", async () => {
        const currentBranchName = "test-branch";
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: `    ${currentBranchName}     \n`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        const execOutput = await getCurrentBranchName();
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            "git rev-parse --abbrev-ref HEAD"
        );
        expect(execOutput).toEqual(currentBranchName);
    });

    it("Throw error if execute fails", () => {
        (exec.getExecOutput as jest.Mock).mockRejectedValueOnce(
            new Error("Failed to execute command")
        );

        expect(getCurrentBranchName).rejects.toThrow(Error);
    });
});

describe("push function", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("pushes to the current branch with follow tags option", async () => {
        const currentBranchName = "test-branch";
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: `${currentBranchName}\n`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: "git push --follow-tags origin test-branch",
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        const execOutput = await push();
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            "git rev-parse --abbrev-ref HEAD"
        );
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            `git push --follow-tags origin ${currentBranchName}`
        );
        expect(execOutput).toEqual({
            stdout: "Ok",
            stderr: "",
            exitCode: 0,
        });
    });

    test("throws an error if getting the current branch name fails", async () => {
        (exec.getExecOutput as jest.Mock).mockRejectedValueOnce(
            new Error("Failed to execute command")
        );
        await expect(push()).rejects.toThrow(
            "Detect current branch name failed.\nFailed to execute command"
        );
    });

    test("throws an error if pushing to the remote fails", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --abbrev-ref HEAD",
                    success: true,
                    resolve: {
                        stdout: "test-branch\n",
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: "git push --follow-tags origin test-branch",
                    success: false,
                    rejectMessage: "Push failed.",
                },
            ])
        );

        await expect(push()).rejects.toThrow(
            "Execute 'git push --follow-tags origin test-branch' failed.\nPush failed."
        );
    });
});

describe("getInputOrDefault", () => {
    it("should return input data", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [{ key: "test", value: "test-value" }],
                    options
                )
        );

        const input = getInputOrDefault("test", "default");

        expect(input).toBe("test-value");
    });

    it("should return default value", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(name, [{ key: "test", value: "" }], options)
        );

        const input = getInputOrDefault("test", "default");

        expect(input).toBe("default");
    });
});

describe("getBooleanInputOrDefault", () => {
    it("should return default value", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(name, [{ key: "test", value: "" }], options)
        );

        const input = getBooleanInputOrDefault("test", true);

        expect(input).toBe(true);
    });

    it("should return true", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [
                        { key: "test1", value: "true" },
                        { key: "test2", value: "TruE" },
                    ],
                    options
                )
        );

        let input = getBooleanInputOrDefault("test1", false);
        expect(input).toBe(true);

        input = getBooleanInputOrDefault("test2", false);
        expect(input).toBe(true);
    });

    it("should return false", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [
                        { key: "test1", value: "false" },
                        { key: "test2", value: "fALsE" },
                    ],
                    options
                )
        );

        let input = getBooleanInputOrDefault("test1", true);
        expect(input).toBe(false);

        input = getBooleanInputOrDefault("test2", true);
        expect(input).toBe(false);
    });

    it("give invalid input. expect throw error", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [
                        { key: "test1", value: "false" },
                        { key: "test2", value: "invalid" },
                    ],
                    options
                )
        );

        expect(() => getBooleanInputOrDefault("test2", true)).toThrow(
            "The value of 'test2' is not valid. It must be either true or false but got 'invalid'."
        );
    });
});

describe("execBashCommand", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should execute a bash command and return the output", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "/bin/bash -c \"echo 'Hello World' && exit 0\"",
                    success: true,
                    resolve: {
                        stdout: "Hello World",
                        stderr: "",
                        exitCode: 0,
                    },
                },
            ])
        );

        let result = await execBashCommand("echo 'Hello World' && exit 0");
        expect(result.stdout).toEqual("Hello World");
        expect(result.stderr).toEqual("");
        expect(result.exitCode).toEqual(0);

        result = await execBashCommand('echo "Hello World" && exit 0');
        expect(result.stdout).toEqual("Hello World");
        expect(result.stderr).toEqual("");
        expect(result.exitCode).toEqual(0);
    });

    it("give invalid command. throw error with exit code", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [])
        );

        await expect(execBashCommand("non_existent_command")).rejects.toThrow(
            "Execute '/bin/bash -c \"non_existent_command\"' failed."
        );
    });
});

describe("execCommand", () => {
    test("should execute command successfully", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: 'echo "Hello World"',
                    success: true,
                    resolve: {
                        stdout: "Hello World",
                        stderr: "",
                        exitCode: 0,
                    },
                },
            ])
        );

        const output = await execCommand('echo "Hello World"');
        expect(output.stdout.trim()).toBe("Hello World");
        expect(output.stderr).toBeFalsy();
        expect(output.exitCode).toBe(0);
    });

    test("should throw an error when the command fails", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [])
        );

        await expect(execCommand("invalid-command")).rejects.toThrow(
            "Execute 'invalid-command' failed."
        );
    });

    test("should throw an error with custom error message when provided", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [])
        );

        const customMessage = "Custom error message";
        await expect(
            execCommand("invalid-command", customMessage)
        ).rejects.toThrow(new RegExp(customMessage));
    });
});

describe("readChangelogSection", () => {
    let tempDir;
    let changelogFile;

    beforeEach(async () => {
        // Create temp directory and changelog file
        tempDir = fs.mkdtempSync("/tmp/");
        changelogFile = path.join(tempDir, "CHANGELOG.md");
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
        await fs.writeFileSync(changelogFile, changelogData);
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

        const section = await readChangelogSection(
            changelogFile,
            new RegExp(DEFAULT_CHANGELOG_VERSION_REGEX),
            version
        );

        expect(section).toBe(expectedSection);
    });

    it("should read latest version", async () => {
        const expectedSection = `### [0.0.3](https://github.com/Payadel/changelog-sv-action/compare/v0.0.2...v0.0.3) (2023-04-27)

### Features

* add \`ignore-same-version-error\` input to ignore same version error ([22898f7](https://github.com/Payadel/changelog-sv-action/commit/22898f7a4466db581497f8d832ebcbae47a53b6c))


### Development: CI/CD, Build, etc

* **deps:** bump Payadel/release-sv-action from 0.2.1 to 0.2.2 ([8f84614](https://github.com/Payadel/changelog-sv-action/commit/8f846147fab9213cff470114c234ce814206c204))
`;

        const section = await readChangelogSection(
            changelogFile,
            new RegExp(DEFAULT_CHANGELOG_VERSION_REGEX)
        );

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

        const section = await readChangelogSection(
            changelogFile,
            new RegExp(DEFAULT_CHANGELOG_VERSION_REGEX),
            version
        );

        expect(section).toBe(expectedSection);
    });

    it("should throw an error if can not find any changelog header", async () => {
        const version = "2.0.0";
        const pattern = /^\#\# \[(.*)\]/;

        await expect(
            readChangelogSection(changelogFile, pattern, version)
        ).rejects.toThrow(
            new RegExp("Can not find or detect any changelog header.")
        );
    });

    it("should throw an error if the changelog header cannot be found", async () => {
        const version = "2.0.0";
        const pattern = new RegExp(DEFAULT_CHANGELOG_VERSION_REGEX);

        await expect(
            readChangelogSection(changelogFile, pattern, version)
        ).rejects.toThrow(
            new RegExp(
                "Can not find or detect any changelog with version 2.0.0."
            )
        );
    });
});

describe("readFile", () => {
    let tempDir: string;
    let filePath: string;
    const content = "sample content";

    beforeEach(() => {
        // Create a unique temporary directory with a random name
        tempDir = mkdtempSync("/tmp/test-");

        // Write a package.json file to the temporary directory
        filePath = join(tempDir, "file.txt");
        writeFileSync(filePath, `    ${content}   `);
    });

    afterEach(() => {
        // Delete the temporary directory
        fs.rmSync(tempDir, { recursive: true });
    });

    test("should read file and return text with trim", async () => {
        const content = await readFile(filePath);
        expect(content).toBe(content);
    });

    test("give invalid path, should throw error", async () => {
        await expect(readFile("invalid path")).rejects.toThrow(
            "Can not find 'invalid path'."
        );
    });
});

describe("createReleaseFile", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("execute successful", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --show-toplevel",
                    success: true,
                    resolve: {
                        stdout: `path/to/git`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command:
                        '/bin/bash -c "(cd releasedir; zip -r path/to/git/releasefilename.zip .)"',
                    success: true,
                    resolve: {
                        stdout: `OK`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        let releaseFilename = await createReleaseFile(
            "releaseDir",
            "releaseFileName"
        );
        expect(releaseFilename).toEqual("releaseFileName.zip");

        releaseFilename = await createReleaseFile(
            "releaseDir",
            "releaseFileName.zip"
        );
        expect(releaseFilename).toEqual("releaseFileName.zip");
    });

    it("Throw error if execute fails", () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [])
        );
        expect(
            createReleaseFile("releaseDir", "releaseFileName")
        ).rejects.toThrow("ind git root directory failed.");

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "git rev-parse --show-toplevel",
                    success: true,
                    resolve: {
                        stdout: `path/to/git`,
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        expect(
            createReleaseFile("releaseDir", "releaseFileName")
        ).rejects.toThrow(
            "Can not create release file from 'releaseDir' to 'path/to/git/releaseFileName.zip'."
        );
    });
});

describe("setGitConfigs", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("success operation", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: 'git config --global user.email "email"',
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
                {
                    command: 'git config --global user.name "username"',
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await setGitConfigs("email", "username");
        expect(exec.getExecOutput).toBeCalledTimes(2);
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            'git config --global user.email "email"'
        );
        expect(exec.getExecOutput).toHaveBeenCalledWith(
            `git config --global user.name "username"`
        );
    });
});
