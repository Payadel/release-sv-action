import fs, { mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import * as exec from "@actions/exec";
import {
    createReleaseFile,
    execBashCommand,
    execCommand,
    getBooleanInputOrDefault,
    getInputOrDefault,
    readFile,
} from "../../src/helpers/utility";
import { mockGetExecOutput, mockGetInput } from "../mocks.utility";
import * as core from "@actions/core";

describe("execBashCommand", () => {
    jest.mock("@actions/exec");

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
    beforeEach(() => {
        jest.resetAllMocks();
    });

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
        ).rejects.toThrow(customMessage);
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
    jest.mock("@actions/exec");

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

describe("getInputOrDefault", () => {
    jest.mock("@actions/core");

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should return input data", () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(name, { test: "test-value" }, options)
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
    jest.mock("@actions/core");

    beforeEach(() => {
        jest.resetAllMocks();
    });

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
                    {
                        test1: "true",
                        test2: "TruE",
                    },
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
                mockGetInput(name, { test1: "false", test2: "fALsE" }, options)
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
                    { test1: "false", test2: "invalid" },
                    options
                )
        );

        expect(() => getBooleanInputOrDefault("test2", true)).toThrow(
            "The value of 'test2' is not valid. It must be either true or false but got 'invalid'."
        );
    });
});
