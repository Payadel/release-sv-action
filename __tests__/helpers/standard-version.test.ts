import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks.utility";
import {
    getReleaseCommand,
    runDry,
    standardVersionRelease,
} from "../../src/helpers/standard-version";

jest.mock("@actions/exec");

describe("getReleaseCommand", () => {
    it("test with params", async () => {
        let skipChangelog = false;
        let inputVersion: string | undefined = undefined;
        let result = getReleaseCommand(skipChangelog, inputVersion);
        expect(result).toContain("standard-version");

        skipChangelog = false;
        inputVersion = "1.0.0";
        result = getReleaseCommand(skipChangelog, inputVersion);
        expect(result).toContain(` --release-as ${inputVersion}`);

        skipChangelog = true;
        inputVersion = undefined;
        result = getReleaseCommand(skipChangelog, inputVersion);
        expect(result).toContain(" --skip.changelog");
    });
});

describe("runDry", () => {
    jest.mock("@actions/exec");

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("success", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: "command --dry-run",
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(runDry("command --dry-run")).resolves.toBe("Ok");
        await expect(runDry("command")).resolves.toBe("Ok");
    });

    it("fail", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [])
        );

        await expect(runDry("command --dry-run")).rejects.toThrow(
            "Execute 'command --dry-run' failed."
        );
    });
});

describe("standardVersionRelease", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should run command and return new version", async () => {
        const newVersion = "1.0.0";

        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command: `standard-version --release-as ${newVersion} --skip.changelog`,
                    success: true,
                    resolve: {
                        stdout:
                            `✔ bumping version in package.json from 0.0.0 to ${newVersion}\n` +
                            "✔ committing package.json\n" +
                            `✔ tagging release v${newVersion}\n` +
                            "ℹ Run `git push --follow-tags origin dev && npm publish` to publish",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        await expect(
            standardVersionRelease("never", "", "1.0.0")
        ).resolves.toBe("1.0.0");
    });
});
