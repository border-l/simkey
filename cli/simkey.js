const { Command } = require('commander');
const program = new Command();
const Compiler = require("../SimkeyCompiler")
const { exec } = require('child_process')
const path = __dirname
const version = "1.0.0"

// Runs the KeyC file
async function run(fileName, repeat) {
    exec(`RunKeyC.exe ${fileName} ${repeat ? repeat : 1}`, (error) => {
        if (error) {
            console.error("Error: " + error.message)
        }
    })
}

// Compiles a file
async function compile(fileName, dump, options) {
    const compiler = new Compiler(fileName);
    let settingsObject = {}
    for (const option of options) {
        settingsObject["$" + option] = true
    }
    compiler.setSettings(settingsObject)
    return compiler.compile(dump)
}

// Compiles a file then runs it
async function compileAndRun(fileName, repeat, dump, options) {
    await compile(fileName, dump, options);
    await run(dump, repeat);
}

program
    .name('simkey')
    .description('CLI for compiling and running simkey files')
    .version(version);

// Command for compiling a file
program
    .command('c <fileName>')
    .description('Compile a file')
    .option('-d, --dump <file>', 'File to dump output')
    .option('-o, --options <options...>', 'Compilation options')
    .action((fileName, cmd) => {
        if (!fileName.endsWith(".simkey")) fileName += ".simkey"
        const options = cmd.options || [];
        const defaultName = (fileName.slice(fileName.lastIndexOf("/") + 1, -7) + ".keyc")
        const dump = (cmd.dump ? (cmd.dump.endsWith(".keyc") ? cmd.dump : (cmd.dump.endsWith("/") ? cmd.dump + defaultName : cmd.dump + ".keyc")) : '') || 
                    defaultName;
        compile(fileName, dump, options);
    });

// Command for running a file
program
    .command('r <fileName>')
    .description('Run a file')
    .option('-r, --repeat <repeat>', 'Times to repeat')
    .action((fileName, cmd) => {
        if (fileName.endsWith(".simkey")) fileName.replace(".simkey", ".keyc")
        if (!fileName.endsWith(".keyc")) fileName += ".keyc"
        const repeat = cmd.repeat || 1;
        run(fileName, repeat);
    });

// Command for compiling and running a file
program
    .command('car <fileName>')
    .description('Compile and then run a file')
    .option('-o, --options <options...>', 'Compilation options')
    .option('-d, --dump <file>', 'File to dump output')
    .option('-r, --repeat <repeat>', 'Times to repeat')
    .action((fileName, cmd) => {
        if (!fileName.endsWith(".simkey")) fileName += ".simkey"
        const options = cmd.options || [];
        const dump = cmd.dump || (fileName.substring(0, fileName.indexOf(".")) + ".keyc");
        const repeat = cmd.repeat || 1;
        compileAndRun(fileName, repeat, dump, options);
    });

program.parse(process.argv);
