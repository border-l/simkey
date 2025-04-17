const { Command } = require('commander');
const program = new Command();
const SimkeyInterpreter = require("../SimkeyInterpreter")
const version = "1.1.0"

async function run(fileName, repeat, options) {
    const simkey = new SimkeyInterpreter(fileName);
    let settingsObject = {}
    for (const option of options) {
        settingsObject["$" + option] = true
    }
    simkey.setSettings(settingsObject)
    return simkey.run()
}

program
    .name('simkey')
    .description('CLI for compiling and running simkey files')
    .version(version);

program
    .description('Run a file')
    .argument('<fileName>', 'Simkey file location')
    .option('-r, --repeat <repeat>', 'Times to repeat')
    .option('-o, --options <options...>', 'Mode/switch options')
    .action((fileName, cmd) => {
        fileName = fileName.endsWith(".simkey") ? fileName : fileName + ".simkey"
        run(fileName, cmd.repeat || 1, cmd.options || []);
    });

program.parse(process.argv);