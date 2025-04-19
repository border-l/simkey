const autoImport = require("./interpreter/importing/autoImport")
const tokenize = require("./interpreter/organize/tokenize")

const clearComments = require("./interpreter/organize/clearComments")

const parseVectors = require('./interpreter/sections/parseVectors')
const parseImports = require("./interpreter/sections/parseImports")
const parseExports = require("./interpreter/sections/parseExports")
const parseSettings = require("./interpreter/sections/parseSettings")
const parseModesAndSwitches = require("./interpreter/sections/parseModesAndSwitches")

const organize = require("./interpreter/organize/organize")
const checkFunctionReferences = require("./interpreter/helpers/checkFunctionReferences")

const run = require("./interpreter/interpret/run")
const setSettings = require("./interpreter/interpret/setSettings")
const setInputVectors = require('./interpreter/interpret/setInputVectors')

const ThrowError = require("./interpreter/errors/ThrowError")

const fs = require("fs")

class Interpreter {
    #Interpreter

    // Script information and built-in functions
    #script
    #tokens
    #model

    // New, for inputting vectors
    #inputVectors

    #fileName

    // References to check after organization
    #checkLater
    #settings

    // For passing private fields to other functions
    #context

    constructor(fileName) {
        this.#Interpreter = Interpreter
        this.#fileName = fileName
        this.#script = fs.readFileSync(fileName, 'utf-8')
        this.#tokens = []
        this.#checkLater = []
        this.#inputVectors = {}
        this.#settings = {}
        this.#model = {
            "IMPORTS": {},
            "EXPORTS": {},
            "SETTINGS": {
                "name": "",
                "mode": "$DEFAULT",
                "switches": [],
                "repeat": "OFF",
                "shortcut": "NONE"
            },
            "VECTORS": {},
            "MODES": ["$DEFAULT"],
            "SWITCHES": [],
            "FUNCS": {},
            "MACRO": []
        }
        this.#initContext()

        // Call functions to fill model information (#organize is called in compile)
        autoImport(this.#context, `${__dirname}/simkey-imports/std/.autoimport`)
        autoImport(this.#context, `${process.cwd()}/.autoimport`)

        // Tokenize and clear all the comments
        tokenize(this.#context)
        clearComments(this.#context)

        parseModesAndSwitches(this.#context)
        parseImports(this.#context)
        parseExports(this.#context)
        parseSettings(this.#context)
        parseVectors(this.#context)

        // Organize and check that function references are valid
        organize(this.#context)
        checkFunctionReferences(this.#context)

        // Imported function to scan over document and parse before this handling
        if (this.#model.IMPORTS["CALL.BEFORE"]) {
            this.#model.IMPORTS["CALL.BEFORE"](this.#tokens, this.#model)
        }
    }

    #initContext() {
        this.#context = {
            update: (property, set) => {
                switch (property) {
                    case 'fileName':
                        this.#fileName = set
                        break
                    case 'script':
                        this.#script = set
                    case 'tokens':
                        this.#tokens = set
                        break
                    case 'checkLater':
                        this.#checkLater = set
                        break
                    case 'inputVectors':
                        this.#inputVectors = set
                        break
                    case 'model':
                        this.#model = set
                        break
                    case 'settings':
                        this.#settings = set
                        break
                    default:
                        ThrowError(5300, { AT: property })
                }
                this.#getContext()
            }
        }
        this.#getContext()
    }

    #getContext() {
        this.#context.Interpreter = this.#Interpreter
        this.#context.fileName = this.#fileName
        this.#context.script = this.#script
        this.#context.tokens = this.#tokens
        this.#context.checkLater = this.#checkLater
        this.#context.model = this.#model
        this.#context.settings = this.#settings
        this.#context.inputVectors = this.#inputVectors
    }

    run(fileName) {
        run(this.#context, fileName)
    }

    setSettings(object) {
        setSettings(this.#context, object)
    }

    setInputVectors(object) {
        setInputVectors(this.#context, object)
    }

    getInputVectors() {
        return JSON.parse(JSON.stringify(this.#inputVectors))
    }

    getModes() {
        return JSON.parse(JSON.stringify(this.#model.MODES))
    }

    getSwitches() {
        return JSON.parse(JSON.stringify(this.#model.SWITCHES))
    }

    getSettings() {
        return JSON.parse(JSON.stringify(this.#model.SETTINGS))
    }

    getExport(name) {
        const thisExport = this.#model.EXPORTS[name]
        if (!thisExport) ThrowError(4305, { AT: name })

        const out = { IMPORTS: {}, FUNCS: {} }

        for (const func of thisExport) {
            if (this.#model.IMPORTS[func]) {
                out.IMPORTS[func] = this.#model.IMPORTS[func]
                out.IMPORTS[func.slice(1)] = this.#model.IMPORTS[func.slice(1)]
            }
            else if (this.#model.FUNCS[func]) {
                out.FUNCS[func] = this.#model.FUNCS[func]
            }
            else {
                ThrowError([...wasntfound])
            }
        }

        return out
    }
}

module.exports = Interpreter