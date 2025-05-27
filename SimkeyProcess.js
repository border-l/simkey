/* Represents a process running a Simkey script that will be exitted if the SimkeyInterpreter has an abrupt exit */
const Interpreter = require("./SimkeyInterpreter")
let instance = null

process.on("message", async message => {
    try {
        switch (message.type) {
            case "start":
                instance = new Interpreter(message.msg.fileName, message.msg.debug)
                process.send({ type: "STARTED" })
                break

            case "get":
                if (message.msg === "inputs") {
                    process.send({ type: message.msg, msg: instance.getInputs() })
                }

                else {
                    process.send({ type: message.msg, msg: instance.getMeta() })
                }

                break

            case "set":
                instance.setInputs(message.msg)
                process.send({ type: "SET" })
                break

            case "run":
                await instance.run(message.msg.repeat)
                process.send({ type: "COMPLETED" })
                process.exit()
        }
    }

    catch (err) {
        process.send({ type: "ERROR", msg: err.message })
        process.exit()
    }
})