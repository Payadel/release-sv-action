import * as core from "@actions/core";
import {
    getBooleanInputOrDefault,
    getInputOrDefault,
    getInputs,
} from "../src/inputs";

jest.mock("@actions/core");

export function mockGetInput(
    name: string,
    inputs: { key: string; value: string }[],
    options?: core.InputOptions | undefined
) {
    name = name.toLowerCase();
    const target = inputs.find(input => input.key.toLowerCase() === name);
    let result = target ? target.value : "";

    if (options && options.required && !result)
        throw new Error(`Input required and not supplied: ${name}`);
    if (options && options.trimWhitespace) result = result.trim();
    return result;
}

async function assertValidVersion(inputVersion: string): Promise<void> {
    jest.spyOn(core, "getInput").mockImplementation(
        (name: string, options?: core.InputOptions | undefined) =>
            mockGetInput(
                name,
                [{ key: "version", value: inputVersion }],
                options
            )
    );
    const inputs = await getInputs();
    expect(inputs.inputVersion).toBe(inputVersion);
}

describe("version", () => {
    it("give valid input, should return version", async () => {
        await assertValidVersion(""); // Empty is valid
        await assertValidVersion("1");
        await assertValidVersion("1.0");
        await assertValidVersion("1.0.0");
        await assertValidVersion("1.2-alpha");
        await assertValidVersion("1.2.3-beta.4");
        await assertValidVersion("1.0.0-rc.1.2");
    });

    it("give invalid input, should reject promise", async () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [{ key: "version", value: "invalid" }],
                    options
                )
        );
        await expect(getInputs()).rejects.toThrow(
            "The input version is not valid."
        );
    });

    it("Input version must be trim", async () => {
        const version = "1.2-alpha";
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [{ key: "version", value: `    ${version}    ` }],
                    options
                )
        );

        const inputs = await getInputs();

        expect(inputs.inputVersion).toBe(version);
    });
});

describe("GetInputs", () => {
    it("should return expected inputs", async () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(
                    name,
                    [
                        {
                            key: "git-email",
                            value: "test@example.com",
                        },
                        {
                            key: "git-user-name",
                            value: "Test User",
                        },
                        {
                            key: "version",
                            value: "1.2.3",
                        },
                        {
                            key: "release-directory",
                            value: "dist",
                        },
                        {
                            key: "release-file-name",
                            value: "my-release",
                        },
                        {
                            key: "create-pr-for-branch",
                            value: "main",
                        },
                        {
                            key: "is-test-mode",
                            value: "true",
                        },
                        {
                            key: "skip-changelog",
                            value: "false",
                        },
                        {
                            key: "skip-release-file",
                            value: "false",
                        },
                    ],
                    options
                )
        );

        const inputs = await getInputs();

        expect(inputs.isTestMode).toBe(true);
        expect(inputs.gitEmail).toBe("test@example.com");
        expect(inputs.gitUsername).toBe("Test User");
        expect(inputs.inputVersion).toBe("1.2.3");
        // expect(inputs.skipChangelog).toBe(false); //TODO: ***
        expect(inputs.skipReleaseFile).toBe(false);
        expect(inputs.releaseDirectory).toBe("dist");
        expect(inputs.releaseFileName).toBe("my-release");
        expect(inputs.createPrForBranchName).toBe("main");
    });

    it("should return default inputs", async () => {
        jest.spyOn(core, "getInput").mockImplementation(
            (name: string, options?: core.InputOptions | undefined) =>
                mockGetInput(name, [], options)
        );

        const inputs = await getInputs();

        expect(inputs.isTestMode).toBe(false);
        expect(inputs.gitEmail).toBe("github-action@github.com");
        expect(inputs.gitUsername).toBe("Github Action");
        expect(inputs.inputVersion).toBe("");
        // expect(inputs.skipChangelog).toBe(true); //TODO: ***
        expect(inputs.skipReleaseFile).toBe(true);
        expect(inputs.releaseDirectory).toBe(".");
        expect(inputs.releaseFileName).toBe("release");
        expect(inputs.createPrForBranchName).toBe("");
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
