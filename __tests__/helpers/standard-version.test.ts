import * as exec from "@actions/exec";
import { mockGetExecOutput } from "../mocks.utility";
import {
    getReleaseCommand,
    runDry,
    standardVersionRelease,
} from "../../src/helpers/standard-version";

jest.mock("@actions/exec");

describe("getReleaseCommand", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

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

    it("success", async () => {
        jest.spyOn(exec, "getExecOutput").mockImplementation(command =>
            mockGetExecOutput(command, [
                {
                    command:
                        "standard-version --release-as 1.0.0 --skip.changelog",
                    success: true,
                    resolve: {
                        stdout: "Ok",
                        exitCode: 0,
                        stderr: "",
                    },
                },
            ])
        );

        const output = await standardVersionRelease("never", "", "1.0.0");
        expect(output.stdout).toBe("Ok");
    });
});
