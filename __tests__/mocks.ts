import * as exec from "@actions/exec";

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
