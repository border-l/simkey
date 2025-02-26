const fs = require('fs')
const path = require('path')

// Get settings and use assigned letters
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'))
const sectionMap = {
    "O": "SETTINGS",
    "M": "MACRO",
    "I": "IMPORTS",
    "D": "MODES",
    "F": "FUNCS",
    "S": "SWITCHES",
    "V": "VECTORS"
}


// Generate tests
function generate() {
    clear()
    const { tests } = settings

    for (const testName of Object.keys(tests)) {
        const test = tests[testName]
        const list = parseList(test.code)
        
        saveTest(testName, test.desc, list)
    }
}


// Gets lists for sections
function parseList(listString) {
    const parsed = {}
    const list = listString.split(" ")

    for (const item of list) {
        const section = sectionMap[item[0]]
        const name = item.slice(2)

        if (!parsed[section]) parsed[section] = []
        parsed[section].push(name)
    }

    return parsed
}


// Gather code and save test
function saveTest(name, desc, sections) {
    let code = `# ${desc} #\n\n`

    for (const section in sections) {
        code += `<${section}>\n`
    
        for (const block of sections[section]) {
            code += "\t" + getCode(`/${section}/${block}.simkey`).replaceAll("\n", "\n\t") + "\n"
        }

        code += "\n"
    }
    
    dump(name, code)
}


// Gets code block from file
function getCode(file) {
    return fs.readFileSync(`${path.join(__dirname, settings["code-blocks"])}/${file}`, 'utf8')
}


// Saves file under title in the correct directory
function dump(title, code) {
    fs.writeFileSync(`${path.join(__dirname, settings["dump-tests"])}/${title}.simkey`, code)
}


// Clear the test dump directories
function clear() {
    for (const file of fs.readdirSync(path.join(__dirname, settings["dump-tests"]))) {
        fs.unlinkSync(`${path.join(__dirname, settings["dump-tests"])}/${file}`)
    }
}


generate()