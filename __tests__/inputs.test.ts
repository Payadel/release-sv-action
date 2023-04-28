import * as core from "@actions/core";
import { GetInputs } from "../src/inputs";

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

        const inputs = await GetInputs();

        expect(inputs.isTestMode).toBe(true);
        expect(inputs.gitEmail).toBe("test@example.com");
        expect(inputs.gitUsername).toBe("Test User");
        expect(inputs.version).toBe("1.2.3");
        expect(inputs.skipChangelog).toBe(false);
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

        const inputs = await GetInputs();

        expect(inputs.isTestMode).toBe(false);
        expect(inputs.gitEmail).toBe("github-action@github.com");
        expect(inputs.gitUsername).toBe("Github Action");
        expect(inputs.version).toBe("");
        expect(inputs.skipChangelog).toBe(true);
        expect(inputs.skipReleaseFile).toBe(true);
        expect(inputs.releaseDirectory).toBe(".");
        expect(inputs.releaseFileName).toBe("release");
        expect(inputs.createPrForBranchName).toBe("");
    });
});
