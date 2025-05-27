/* Serves as a wrapper around SimkeyInterpreter to avoid the effect of process.exit when abruptly ending script */
const { fork } = require("child_process")


class Simkey {
    #simkeyProcess
    #fileName
    #debug

    #meta
    #inputs

    #metaPromise
    #inputsPromise

    #setPromise
    #resolveSet

    #runPromise
    #resolveRun
    #rejectRun


    constructor(fileName, debug = false) {
        this.#fileName = fileName
        this.#debug = debug

        this.#inputs = null
        this.#meta = null

        let resolveMeta, resolveInputs
        this.#metaPromise = new Promise(res => resolveMeta = res)
        this.#inputsPromise = new Promise(res => resolveInputs = res)

        this.#simkeyProcess = fork("./SimkeyProcess.js", { stdio: "inherit" })
        this.#simkeyProcess.send({ type: "start", msg: { fileName: this.#fileName, debug: this.#debug } })

        this.#simkeyProcess.on("message", message => {
            if (message.type === "ERROR") this.#rejectRun(message.msg)
            if (message.type === "COMPLETED") this.#resolveRun(message.type)

            if (message.type === "STARTED") {
                this.#simkeyProcess.send({ type: "get", msg: "inputs" })
                this.#simkeyProcess.send({ type: "get", msg: "meta" })
            }

            if (message.type === "SET") {
                this.#resolveSet()
            }

            if (message.type === "inputs") {
                resolveInputs()
                this.#inputs = message.msg
            }

            if (message.type === "meta") {
                resolveMeta()
                this.#meta = message.msg
            }
        })

        this.#simkeyProcess.on("exit", _ => {
            this.#resolveRun("EXITTED")
        })
    }


    run(repeat = false) {
        if (this.#simkeyProcess === null) return
        this.#runPromise = new Promise((res, rej) => {
            this.#resolveRun = res
            this.#rejectRun = rej
        })
        this.#simkeyProcess.send({ type: "run", msg: { repeat: repeat } })
        return this.#runPromise
    }


    stop() {
        if (this.#simkeyProcess === null) return
        this.#simkeyProcess.send({ type: "stop" })
        this.#simkeyProcess = null
    }


    async getMeta() {
        await this.#metaPromise
        return this.#meta
    }


    async getInputs() {
        await this.#inputsPromise
        return this.#inputs
    }


    async setInputs(inputs) {
        if (this.#simkeyProcess === null) return
        this.#setPromise = new Promise(res => this.#resolveSet = res)
        this.#simkeyProcess.send({ type: "set", msg: inputs })
        await this.#setPromise
    }
}


module.exports = Simkey