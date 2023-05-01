import * as core from "@actions/core";
import { IActionOutputs, setOutputs } from "../src/outputs";

jest.mock("@actions/core");

describe("setOutputs", () => {
    it("should set all outputs", () => {
        const data: IActionOutputs = {
            version: "1.0",
            changelog: "changelog",
            "release-filename": "release-filename",
            "pull-request-url": "url",
        };

        jest.spyOn(core, "setOutput");

        setOutputs(data);

        for (let key of Object.keys(data))
            expect(core.setOutput).toHaveBeenCalledWith(key, data[key]);
    });
});
