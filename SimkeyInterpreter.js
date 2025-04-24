const autoImport = require("./interpreter/importing/autoImport")
const tokenize = require("./interpreter/organize/tokenize")
const clearComments = require("./interpreter/organize/clearComments")

const parseImports = require("./interpreter/sections/parseImports")
const parseExports = require("./interpreter/sections/parseExports")
const parseMeta = require("./interpreter/sections/parseMeta")
const parseInputs = require('./interpreter/sections/parseInputs')

const organize = require("./interpreter/organize/organize")
const checkFunctionReferences = require("./interpreter/helpers/checkFunctionReferences")

const run = require("./interpreter/interpret/run")
const getExport = require("./interpreter/importing/getExport")
const ThrowError = require("./interpreter/errors/ThrowError")
const fs = require("fs")


class Interpreter {
    #Interpreter

    // Script information and built-in functions
    #script
    #tokens
    #model
    #funcs
    #fileName

    // References to check after organization
    #checkLater
    #variables
    #constants
    #tables

    // For passing private fields to other functions
    #context

    constructor(fileName) {
        this.#Interpreter = Interpreter
        this.#fileName = fileName
        this.#script = fs.readFileSync(fileName, 'utf-8')
        this.#tokens = []
        this.#checkLater = []
        this.#variables = {}
        this.#constants = []
        this.#tables = { "TABLE": [] }
        this.#funcs = {}
        this.#model = {
            "IMPORTS": {},
            "EXPORTS": {},
            "META": {
                "NAME": "",
                "MODE": "$DEFAULT",
                "SWITCHES": [],
                "REPEAT": "OFF",
                "SHORTCUT": "NONE"
            },
            "INPUTS": {
                "MODES": [],
                "SWITCHES": [],
                "STRINGS": [],
                "VECTORS": {}
            },
            "MACRO": []
        }
        this.#initContext()

        // Call functions to fill model information (#organize is called in compile)
        autoImport(this.#context, `${__dirname}/imports/std/.autoimport`)
        autoImport(this.#context, `${process.cwd()}/.autoimport`)

        // Tokenize and clear all the comments
        tokenize(this.#context)
        clearComments(this.#context)

        parseInputs(this.#context)
        parseImports(this.#context)
        parseExports(this.#context)
        parseMeta(this.#context)

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
                    case 'model':
                        this.#model = set
                        break
                    case 'funcs':
                        this.#funcs = set
                        break
                    case 'variables':
                        this.#variables = set
                        break
                    case 'constants':
                        this.#constants = set
                        break
                    case 'tables':
                        this.#tables = set
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
        this.#context.funcs = this.#funcs
        this.#context.variables = this.#variables
        this.#context.constants = this.#constants
        this.#context.tables = this.#tables
    }

    run() {
        run(this.#context)
    }

    getExport(name) {
        return getExport(this.#context, name)
    }
}

module.exports = Interpreter