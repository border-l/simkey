const organize = require("../organize/organize")
const checkFunctionReferences = require("../helpers/checkFunctionReferences")
const getInstructionList = require("./getInstructionList")
const interpreter = require("./interpreter")
const [send] = require("../robot/robot")
// const runExpressionObject = require("./runExpressionObject")
// const checkValidImportReturn = require("../helpers/checkValidImportReturn")
// const solveConditional = require("./solveConditional")
// const handleSET = require("./handleSET")
// const ThrowError = require("../errors/ThrowError")

// Interprets the file
async function interpret(context) {
    // Settings must be set first
    if (!context.settings) {
        return
    }

    // Organize and check that function references are valid
    organize(context)
    checkFunctionReferences(context)

    // Get instruction list and set object for info shared between imports
    const instructionList = getInstructionList(context, context.model.MACRO, "MACRO")
    const def = [100, 100]
    const heldKeys = []

    await interpreter(context, {
        DEF: def,
        HELD: heldKeys,
        IMPORTS: context.model.IMPORTS,
        SETTINGS: context.settings,
        MODES: context.model.MODES,
        SWITCHES: context.model.SWITCHES,
        VECTORS: context.model.VECTORS,
        INTERPRET: interpreter,
        SHARED: {}
    }, instructionList)

    // Release all held down keys
    for (const key of heldKeys) {
        // code += "\nr" + (key.endsWith("|") ? key.substring(0, key.length - 1) : key)
        send([key, false])
    }
}

module.exports = interpret