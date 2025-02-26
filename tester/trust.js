const fs = require("fs")
const path = require("path")

// For running simkey commands
const { execSync } = require('child_process')

// Directories from settings.json
let { "dump-tests": testDir, tests, expected } = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'))

// Resolve relative paths
testDir = path.join(__dirname, testDir)
expected = path.join(__dirname, expected)

// Get cases from test directory
const cases = fs.readdirSync(testDir)

for (const testCase of cases) {
    // Get settings for test case
    const testSettings = tests[testCase.slice(0, -7)]

    // Don't run error causing ones
    if (!testSettings || testSettings.expected !== "FILE") continue

    // Get options for test case
    const options = testSettings.options || [["DEFAULT"]]

    // Go through each option
    for (let i = 0; i < options.length; i++) {
        // Get current option
        const optionL = options[i]
        const keycName = testCase.replace(".simkey", `_${i}.keyc`)

        // Compile simkey
        execSync(`simkey c ${path.resolve(`${testDir}/${testCase}`)} -d ${path.resolve(expected)}/${keycName} -o ${optionL.join(" ")}`, {stdio: "inherit"})
    }
}