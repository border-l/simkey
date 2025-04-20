const parseSection = require("./parseSection")
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")
const getArray = require("../types/getArray")
const evaluateExpr = require("../helpers/evaluateExpr")
const getBalanced = require('../helpers/getBalanced')

// Handles Vectors section
function parseVectors(context) {
    parseSection(context, (tokens, token, i, section, next) => {
        // Check the variable name is valid
        if (!checkVariableName(token)) {
            ThrowError(1100, { AT: token })
        }

        // Get list of variables and check for duplicates
        // const others = Object.keys(context.variables)
        // if (others.includes(token)) {
        //     ThrowError(1500, { AT: token })
        // }

        if (context.tokens[i + 1] !== "=") {
            ThrowError(1600, { AT: token, SECTION: "VECTORS" })
        }

        if (context.tokens[i + 2] === undefined) {
            ThrowError(1010, { AT: token + " (and missing any valid assignment)" })
        }

        let value
        let stopIndex

        if (context.tokens[i + 2][0] === "[") {
            const [vector, newIndex] = getArray(context, i + 2, true)
            for (let x = 0; x < vector.length; x++) {
                vector[x] = evaluateExpr(context, vector[x])
            }
            value = vector
            stopIndex = newIndex
        }

        else if (context.tokens[i + 2][0] === "(") {
            const [expr, newIndex] = getBalanced(i + 2, context.tokens)
            value = [evaluateExpr(context, expr), 0]
            stopIndex = newIndex
        }

        else {
            value = [evaluateExpr(context, context.tokens[i + 2]), 0]
            stopIndex = i + 2
        }

        if (context.tokens[stopIndex + 1] === "|" && context.tokens[stopIndex + 2] === "INPUT") {
            context.inputVectors[token] = value
            stopIndex += 2
        }

        context.variables[token] = value
        return stopIndex
    }, (section) => section === "VECTORS")
}

module.exports = parseVectors