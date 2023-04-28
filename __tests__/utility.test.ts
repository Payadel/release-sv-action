import * as core from "@actions/core";
import { mockGetInput } from "./inputs.test";
import {
    execBashCommand,
    execCommand,
    getBooleanInputOrDefault,
    getInputOrDefault,
} from "../src/utility";

jest.mock("@actions/core");

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
});

describe("execBashCommand", () => {
    it("should execute a bash command and return the output", async () => {
        let result = await execBashCommand("echo 'Hello World' && exit 0");
        expect(result.stdout).toEqual("Hello World\n");
        expect(result.stderr).toEqual("");
        expect(result.exitCode).toEqual(0);

        result = await execBashCommand('echo "Hello World" && exit 0');
        expect(result.stdout).toEqual("Hello World\n");
        expect(result.stderr).toEqual("");
        expect(result.exitCode).toEqual(0);
    });

    it("give invalid command. throw error with exit code", async () => {
        await expect(execBashCommand("non_existent_command")).rejects.toThrow(
            "Execute '/bin/bash -c \"non_existent_command\"' failed.\nThe process '/bin/bash' failed with exit code 127"
        );
    });

    it("exit with non zero code, should throw error with exit code", async () => {
        await expect(
            execBashCommand("echo 'hello world' && exit 1")
        ).rejects.toThrow(
            "Execute '/bin/bash -c \"echo 'hello world' && exit 1\"' failed.\nThe process '/bin/bash' failed with exit code 1"
        );
    });

    it("give custom message, should throw error with exit code and custom message", async () => {
        const customMessage = "This is a custom message.";
        await expect(
            execBashCommand("echo 'hello world' && exit 1", customMessage)
        ).rejects.toThrow(
            `${customMessage}\nThe process '/bin/bash' failed with exit code 1`
        );
    });
});

describe("execCommand", () => {
    test("should execute command successfully", async () => {
        const output = await execCommand('echo "Hello World"');
        expect(output.stdout.trim()).toBe("Hello World");
        expect(output.stderr).toBeFalsy();
        expect(output.exitCode).toBe(0);
    });

    test("should throw an error when the command fails", async () => {
        await expect(execCommand("invalid-command")).rejects.toThrow(
            new RegExp("Execute 'invalid-command' failed.")
        );
    });

    test("should throw an error with custom error message when provided", async () => {
        const customMessage = "Custom error message";
        await expect(
            execCommand("invalid-command", customMessage)
        ).rejects.toThrow(new RegExp(customMessage));
    });
});
