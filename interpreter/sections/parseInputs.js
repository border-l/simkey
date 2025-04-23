const parseSection = require("./parseSection")
const getArray = require('../types/getArray')
const getString = require('../types/getString')
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")

// Handles inputs section
function parseInputs(context) {
    parseSection(context, (tokens, token, i, section, next) => {
        // variable name and type of input (as a key in model.INPUTS)
        const varn = tokens[i + 1]
        const type = token === "SWITCH" ? token + "ES" : token + "S"

        // Invalid name or already declared
        if (!checkVariableName(varn)) ThrowError()
        if (context.variables[varn]) ThrowError()

        // Same handling
        if (token === "MODE" || token === "SWITCH") {
            context.model.INPUTS[type].push(varn)
            context.variables[varn] = false
            context.constants.push(varn)
            return i + 1
        }

        // Takes bounds and array
        if (token === "VECTOR") {
            const bounds = tokens[i + 2].split(",").map(x => x === "" ? null : Number(x))

            // Bound validation (0 <= 1, 0 && 1 nums (so long as 1 not null), length < 2)
            if (bounds.length > 2) ThrowError()
            if (isNaN(bounds[0]) || (isNaN(bounds[1]) && bounds[1] !== null)) ThrowError()
            if (bounds[0] < 1 || (bounds[0] > bounds[1] && bounds[1] !== null)) ThrowError()

            const [array, index] = getArray(context, i + 3)
            if (index >= next) ThrowError()

            context.model.INPUTS[type][varn] = bounds
            context.variables[varn] = array
            context.constants.push(varn)
            return index
        }

        // Takes string
        if (token === "STRING") {
            const [string, index] = getString(context, i + 2)
            if (index >= next) ThrowError()

            context.model.INPUTS[type].push(varn)
            context.variables[varn] = string
            context.constants.push(varn)
            return index
        }

        ThrowError()
    }, (section) => section === "INPUTS")
}

module.exports = parseInputs