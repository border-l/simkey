const fs = require("fs")
const path = require("path")

// For running simkey commands
const { execSync } = require('child_process')

// Styling console output
const chalk = require("chalk")

// Directories from settings.json
let { "dump-results": dump, "dump-tests": testDir, tests, expected } = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'))

// Pass and fail str arrays
const passes = []
const fails = []

// Resolve relative paths (primarily for github Action)
dump.fail = path.join(__dirname, dump.fail)
dump.pass = path.join(__dirname, dump.pass)
dump.overview = path.join(__dirname, dump.overview)
dump.keyc = path.join(__dirname, dump.keyc)

testDir = path.join(__dirname, testDir)
expected = path.join(__dirname, expected)

// Run, I will never comment on this garbage
function runCases() {
    // Empty files first
    fs.writeFileSync(dump.fail, "")
    fs.writeFileSync(dump.pass, "")
    fs.writeFileSync(dump.overview, "")

    // Counting which test (not considering options)
    let count = 0

    // Load cases, start tests
    const cases = fs.readdirSync(testDir)
    console.log(chalk.yellow("RUNNING TESTS..."))

    for (const testCase of cases) {
        // Getting test options (slice to remove .simkey)
        const testSettings = tests[testCase.slice(0, -7)]
        if (!testSettings) continue

        count++

        // Output overall test being performed
        const options = testSettings.options || [["DEFAULT"]]
        console.log(chalk.bold("     " + count + " - " + chalk.cyan(testCase)))

        // Loop through each group of options
        for (let i = 0; i < options.length; i++) {
            // Flag
            let passed = true

            // Get options for this specific test
            const optionL = options[i]
            const optionString = ` [${optionL.join(",")}] `

            try {
                // Name for keyc file
                const keycName = testCase.replace(".simkey", `_${i}.keyc`)

                // Use simkey command to compile (directly uses simkey js cli location)
                execSync(`${path.resolve(__dirname, '../cli/simkey')} c ${path.resolve(`${testDir}/${testCase}`)} -d ${path.resolve(dump.keyc)}/${keycName} -o ${optionL.join(" ")}`, { stdio: 'pipe' })

                // Did not error, failed
                if (testSettings.expected === "ERROR") {
                    saveToFail(testCase + optionString + "FAILED, CODE DID NOT ERROR AS EXPECTED.")
                    passed = false
                }

                // Did not error as expected
                else if (fs.readFileSync(`${dump.keyc}/${keycName}`, 'utf8').replaceAll("\r", "") === fs.readFileSync(`${expected}/${keycName}`, 'utf8').replaceAll("\r", "")) {
                    saveToPass(testCase + optionString + "PASSED, CODE MATCHED EXPECTED.")
                }

                // No error but code is not the same, failed
                else {
                    saveToFail(testCase + optionString + "FAILED, CODE OUTPUT DID NOT MATCH EXPECTED.")
                    passed = false
                }
            }

            catch (error) {
                // Error output
                const stderr = error.stderr

                // Find relevant error message
                let errorMessage = stderr.slice(stderr.indexOf("Error: "))
                errorMessage = errorMessage.slice(0, errorMessage.indexOf("\n"))

                // Error & passed
                if (testSettings.expected === "ERROR") {
                    saveToPass(testCase + optionString + "PASSED, ERRORED AS EXPECTED: " + errorMessage)
                }

                // Error, failed
                else {
                    saveToFail(testCase + optionString + "FAILED, ERROR: " + stderr)
                    passed = false
                }
            }

            // Log the message
            console.log(formatSpecificTestMessage(count, i, optionL, passed))
        }

        // Empty line for space
        console.log()
    }

    // Save to overview file
    saveOverview()

    // Done tests
    console.log(chalk.yellow("COMPLETED TESTS."))

    // Set readme badge
    setReadmeTestBadge()

    // Notice for github action
    console.log(`::notice file=overview.txt::All tests passed: ${passes.length}/${passes.length + fails.length}`)
}


// Setting the badge in readme to passed or failed
function setReadmeTestBadge() {
    // Relevant shield.io badges
    const failBadge = 'https://img.shields.io/badge/Tests-Failed-red'
    const passBadge = 'https://img.shields.io/badge/Tests-Passed-brightgreen'

    // Get file and current readme content
    const readmeFile = path.resolve(__dirname, '../README.md')
    let readmeContent = fs.readFileSync(readmeFile, 'utf8')

    if (fails.length > 0) {
        // Error annotation for github action
        console.log(`::error file=overview.txt::Tests failed. Passed: ${passes.length}/${passes.length + fails.length}`)

        // Change to failBadge, write to file
        readmeContent = readmeContent.replace(/https:\/\/img\.shields\.io\/badge\/Tests-[A-Za-z]*-[a-z]*/g, failBadge)
        fs.writeFileSync(readmeFile, readmeContent)
        
        // Throw error to get caught in github action
        throw new Error(`Test failure: Only passed ${passes.length} out of total ${passes.length + fails.length} tests passed.`)
    }

    // Change to passBadge, write to file
    readmeContent = readmeContent.replace(/https:\/\/img\.shields\.io\/badge\/Tests-[A-Za-z]*-[a-z]*/g, passBadge)
    fs.writeFileSync(readmeFile, readmeContent)
}


// For formatting the specific tests, ex. 18.0 [DEFAULT]    ✔
function formatSpecificTestMessage(count, i, options, passed) {
    // Formatting constants
    const MAX_WIDTH = 60
    const TRUNCATED_SUFFIX = "..."
    const SPACE_FIRST = 10

    // Message "layout"
    let msg = ` `.repeat(SPACE_FIRST) + `${chalk.whiteBright(`${count}.${i}:`)} ${chalk.blueBright(`[${options.join(",")}]`)}`

    // Truncate if the message is too long
    if (msg.length > MAX_WIDTH) {
        msg = msg.slice(0, MAX_WIDTH - TRUNCATED_SUFFIX.length) + TRUNCATED_SUFFIX
    }

    // Pad the message to align properly
    msg = msg.padEnd(MAX_WIDTH + 1)

    // Check mark or x if passed or not
    msg += (passed ? chalk.bold.green(" ✔") : chalk.bold.red(" ✖"))

    return msg
}


// Fail
function saveToFail(text) {
    fails.push(text.slice(0, text.indexOf("]") + 1).replace(".simkey", ""))
    fs.writeFileSync(dump.fail, fs.readFileSync(dump.fail, 'utf8') + text + "\n")
}


// Pass
function saveToPass(text) {
    passes.push(text.slice(0, text.indexOf("]") + 1).replace(".simkey", ""))
    fs.writeFileSync(dump.pass, fs.readFileSync(dump.pass, 'utf8') + text + "\n")
}


// Overview
function saveOverview() {
    overview = "Successful tests: " + `${passes.length}/${passes.length + fails.length}`
        + "\nTests: " + [...passes, ...fails].join(", ")
        + "\n\tPASSED: " + passes.join(", ")
        + "\n\tFAILED: " + fails.join(", ")
    fs.writeFileSync(dump.overview, overview)
}


runCases()