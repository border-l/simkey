const parseSection = require("./parseSection")
const ThrowError = require("../errors/ThrowError")
const path = require("path")

// Handles export section
function parseExports(context) {
    // Current label
    let current = path.parse(context.fileName).name

    parseSection(context, (tokens, token, i, section, next) => {
        // Changing labels
        if (token.at(-1) === ":") {
            current = token.slice(0, -1)
            return i
        }
        // Should be function otherwise
        if (token[0] !== "@")  ThrowError(1140, { AT: token })

        // Put function under label
        if (!context.model.EXPORTS[current]) context.model.EXPORTS[current] = []
        context.model.EXPORTS[current].push(token)
        return i
    }, (section) => section === "EXPORTS")
    console.log(context.model.EXPORTS)
}

module.exports = parseExports