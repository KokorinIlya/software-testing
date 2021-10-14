const express = require('express')
const chatManager = require('./chat_manager')
const cors = require ('cors')

function serverMain(port) {
    const app = express();
    app.use(cors());
    app.use(express.json())
    app.options('http://localhost', cors());

    const serverState = chatManager.createServerState()

    app.get("/chat/:chatId", (req, res) => {
        // noinspection JSUnresolvedVariable
        const chatId = req.params.chatId
        const userId = req.query.userId
        const [response, code] = chatManager.getChat(serverState, chatId, userId)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.post("/connect",  (req, res) => {
        const [response, code] = chatManager.connect(serverState)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.post("/send/:chatId",  (req, res) => {
        // noinspection JSUnresolvedVariable
        const chatId = req.params.chatId
        const userId = req.body.userId
        const message = req.body.message
        const [response, code] = chatManager.sendMessage(serverState, chatId, userId, message)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.post("/close/:chatId", (req, res) => {
        // noinspection JSUnresolvedVariable
        const chatId = req.params.chatId
        const userId = req.body.userId
        const [response, code] = chatManager.finishChat(serverState, chatId, userId)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.post("/register", async (req, res) => {
        // noinspection JSUnresolvedVariable
        const login = req.body.login
        const password = req.body.password
        const [response, code] = await chatManager.registerUser(serverState, login, password)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.post("/login", async (req, res) => {
        // noinspection JSUnresolvedVariable
        const login = req.body.login
        const password = req.body.password
        const [response, code] = await chatManager.checkAuthorization(serverState, login, password)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.listen(port);
}

module.exports.serverMain = serverMain