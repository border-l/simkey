const instructionRunner = require("./instructionRunner")
const robot = require("../robot/robot")

const endSymbol = Symbol("END_STRING")
const nextSymbol = Symbol("NEXT_SYMBOL")
const returnSymbol = Symbol("RETURN_STRING")

// Interprets the file
async function run(context) {
    // Get instruction list and set object for info shared between imports
    const instructionList = context.model.MACRO
    const def = [100, 100]
    const heldKeys = []

    // Setup functions
    for (const key in context.model.IMPORTS) {
        await context.model.IMPORTS[key].SETUP()
    }

    const passedInfo = {
        DEF: def,
        HELD: heldKeys,
        CONTEXT: context,
        ROBOT: robot,
        RUN: instructionRunner,
        SYMBOLS: { END: endSymbol, NEXT: nextSymbol, RETURN: returnSymbol },
        YIELD: {
            END: (val) => val === endSymbol,
            NEXT: (val) => val === nextSymbol,
            RETURN: (val) => Array.isArray(val) && val[0] === returnSymbol
        },
        SHARED: {}
    }

    let completed = false

    // Interpret list
    instructionRunner(passedInfo, instructionList).then(() => {
        completed = true
    })

    // Check if completed or interrupted
    while (true) {
        if (context.SIGNAL) process.exit(0)
        if (completed) break
        await new Promise(r => setTimeout(r, 10))
    }

    // Release all held down keys
    for (const key of heldKeys) {
        robot.send([key, false])
    }

    // Cleanup functions
    for (const key in context.model.IMPORTS) {
        await context.model.IMPORTS[key].CLEANUP(passedInfo)
    }
}

module.exports = run