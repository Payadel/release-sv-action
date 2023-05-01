"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockGetInput = exports.mockGetExecOutput = void 0;
function mockGetExecOutput(command, expectedCommands) {
    command = command.toLowerCase();
    const target = expectedCommands.find(input => input.command.toLowerCase() === command);
    if (!target)
        return Promise.reject(new Error("Command not found."));
    return target.success
        ? Promise.resolve(target.resolve)
        : Promise.reject(new Error(target.rejectMessage));
}
exports.mockGetExecOutput = mockGetExecOutput;
function mockGetInput(name, inputs, options) {
    name = name.toLowerCase();
    const targetName = Object.keys(inputs).find(key => key.toLowerCase() == name);
    let result = targetName ? inputs[targetName] : "";
    if (options && options.required && !result)
        throw new Error(`Input required and not supplied: ${name}`);
    if (options && options.trimWhitespace)
        result = result.trim();
    return result;
}
exports.mockGetInput = mockGetInput;
//# sourceMappingURL=mocks.js.map