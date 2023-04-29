import * as core from "@actions/core";

export interface IOutputs {
    version?: string;
    releaseFileName?: string;
    pullRequestUrl?: string;
    changelog?: string;
}

export function setOutputs(data: IOutputs): void {
    core.setOutput("version", data.version);
    core.setOutput("pull-request-url", data.pullRequestUrl);
    core.setOutput("release-filename", data.releaseFileName);
    core.setOutput("changelog", data.changelog);
}
