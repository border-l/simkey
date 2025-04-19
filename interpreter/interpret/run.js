const instructionRunner = require("./instructionRunner")
const robot = require("../robot/robot")

const endSymbol = "INSTRUCTION_RUNNER_ENDING_STRING"

// Interprets the file
async function run(context) {
    // Settings must be set first
    if (!context.settings) {
        return false
    }

    // Get instruction list and set object for info shared between imports
    const instructionList = context.model.MACRO
    const def = [100, 100]
    const heldKeys = []

    // Interpret list
    await instructionRunner({
        DEF: def,
        HELD: heldKeys,
        CONTEXT: context,
        ROBOT: robot,
        RUN: instructionRunner,
        END_SYMBOL: endSymbol,
        SHARED: {}
    }, instructionList)

    // Release all held down keys
    for (const key of heldKeys) {
        robot.send([key, false])
    }
}

module.exports = run