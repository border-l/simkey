const findBracket = require("../helpers/findBracket")
const findNextSection = require("../helpers/findNextSection")
const combineTillNext = require("../helpers/combineTillNext")
const parseImportedFunctionCall = require("./parseImportedFunctionCall")
const parseConditional = require("./parseConditional")
const parseExpression = require("./parseExpression")
const getArray = require("../types/getArray")
const ThrowError = require("../errors/ThrowError")
const checkVariableName = require("../helpers/checkVariableName")
const asnOperators = require('./operators')
const getBalanced = require('../helpers/getBalanced')

// Parses the bodies of functions & macro section (split it up)
function parseInnards(context, index, section) {
    const firstToken = context.tokens[index]
    const parsed = []
    let finalIndex

    // Find final index depending on bracket
    if (firstToken === "{") {
        finalIndex = findBracket(context, index)
    }
    else {
        finalIndex = findNextSection(context, index)
    }

    // No valid final index found
    if (finalIndex === -1) {
        ThrowError(1015, { AT: `Token: ${firstToken}, Context: ${context}` })
    }

    let i = index + 1
    for (; i < finalIndex; i++) {
        const token = context.tokens[i]

        // Skip past comments
        if (token === "#") {
            const [_, newIndex] = combineTillNext(context, "#", i, true)
            i = newIndex
            continue
        }

        // Variable assignment
        if (token[0] === "$" && asnOperators[context.tokens[i + 1]]) {
            if (!checkVariableName(token, true)) ThrowError(1100, { AT: token + " (in assignment)" })
            const operator = asnOperators[context.tokens[i + 1]]

            // Assigning to output of a function
            if (context.tokens[i + 2][0] === "@") {
                parsed.push(["ASSN", token, operator, "ASSN NEXT INSTRUCTION"])
                i++
            }

            // Assigning to whole vector
            else if (context.tokens[i + 2][0] === "[") {
                const [vector, newIndex] = getArray(context, i + 2, true)
                parsed.push(["ASSN", token, operator, vector])
                i = newIndex
            }

            // Assigning to expression with spaces
            else if (context.tokens[i + 2][0] === "(") {
                const [expr, newIndex] = getBalanced(i + 2, context.tokens)
                parsed.push(["ASSN", token, operator, expr])
                i = newIndex
            }

            // Assigning to expression without spaces
            else {
                parsed.push(["ASSN", token, operator, context.tokens[i + 2]])
                i += 2
            }

            continue
        }

        // Token is referring to a function
        if (token.charAt(0) === "@") {
            // Conditional "functions" handling
            if (token === "@if") {
                const [condParsed, newIndex] = parseConditional(context, i, section, parseInnards)
                parsed.push(condParsed)
                i = newIndex - 1
                continue
            }
            if (token === "@elseif" || token === "@else") {
                ThrowError(1040, { AT: token })
            }

            // Return statement
            if (token === "@return") {
                // Assigning to output of a function
                if (context.tokens[i + 1][0] === "@") {
                    parsed.push(["RET", "RET NEXT INSTRUCTION"])
                    i++
                }

                // Assigning to whole vector
                else if (context.tokens[i + 1][0] === "[") {
                    const [vector, newIndex] = getArray(context, i + 1, true)
                    parsed.push(["RET", vector])
                    i = newIndex
                }

                // Assigning to expression with spaces
                else if (context.tokens[i + 1][0] === "(") {
                    const [expr, newIndex] = getBalanced(i + 1, context.tokens)
                    parsed.push(["RET", expr])
                    i = newIndex
                }

                // Assigning to expression without spaces
                else {
                    parsed.push(["RET", context.tokens[i + 1]])
                    i += 1
                }

                continue
            }

            // Defined functions (this is somewhat repetitive later on, clean up later)
            if (context.model.FUNCS[token]) {
                if (context.model.FUNCS[token][1].length > 0) {
                    const [array, newIndex] = getArray(context, i + 1, false)
                    parsed.push([token, array])
                    i = newIndex
                    continue
                }

                parsed.push([token, []])
                continue
            }

            if (token === "@end") {
                parsed.push("@end")
                return [parsed, i]
            }

            // Imported functions
            if (context.model.IMPORTS[token]) {
                i = parseImportedFunctionCall(context, token, parsed, i, parseInnards)
                continue
            }

            // Doesnt fit above categories, check later
            if (!context.checkLater.includes(token)) {
                context.checkLater.push(token)
            }

            // Yet to be defined
            if (context.tokens.length > (i + 1) && context.tokens[i + 1].startsWith("[")) {
                const [array, newIndex] = getArray(context, i + 1, false)
                parsed.push([token, array])
                i = newIndex
                continue
            }

            parsed.push([token, []])
            continue
        }

        // None of the above means it is an expression
        const parsedExpression = parseExpression(context, token)

        // Invalid expression [This seems impossible? [Why would it be?]]
        if (!parsedExpression) {
            ThrowError(1110, { AT: token })
        }

        parsed.push(parsedExpression)
    }

    // Code went past block
    if (i > finalIndex) {
        ThrowError(1400, { AT: context.tokens[index - 1] + " " + context.tokens[index] })
    }

    // Parsed block and final index
    return [parsed, finalIndex]
}

module.exports = parseInnards