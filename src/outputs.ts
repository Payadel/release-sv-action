import * as core from "@actions/core";

export interface IActionOutputs {
    version: string;
    changelog: string;
    "release-filename"?: string;
    "pull-request-url"?: string;
}

export function setOutputs(data: IActionOutputs): void {
    for (let key of Object.keys(data)) core.setOutput(key, data[key]);
}
