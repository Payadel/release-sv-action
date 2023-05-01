import * as exec from "@actions/exec";
import * as core from "@actions/core";

export interface IExpectedCommand {
    command: string;
    success: boolean;
    resolve?: {
        stdout: string;
        stderr: string;
        exitCode: number;
    };
    rejectMessage?: string;
}

export function mockGetExecOutput(
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

export function mockGetInput(
    name: string,
    inputs: { [key: string]: any },
    options?: core.InputOptions | undefined
) {
    name = name.toLowerCase();
    const targetName = Object.keys(inputs).find(
        key => key.toLowerCase() == name
    );
    let result = targetName ? inputs[targetName] : "";

    if (options && options.required && !result)
        throw new Error(`Input required and not supplied: ${name}`);
    if (options && options.trimWhitespace) result = result.trim();
    return result;
}
