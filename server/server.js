const express = require('express')
const chatManager = require('./chat_manager')
const cors = require ('cors')

function serverMain(port) {
    const app = express();
    app.use(cors());
    app.options('http://localhost', cors());

    const serverState = chatManager.createServerState()

    app.get("/connect", function (req, res) {
        const [response, code] = chatManager.connect(serverState)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.get("/chat/:chatId", function (req, res) {
        // noinspection JSUnresolvedVariable
        const chatId = req.params.chatId
        const userId = req.query.userId
        const [response, code] = chatManager.getChat(serverState, chatId, userId)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.get("/send/:chatId", function (req, res) {
        // noinspection JSUnresolvedVariable
        const chatId = req.params.chatId
        const userId = req.query.userId
        const message = req.query.message
        const [response, code] = chatManager.sendMessage(serverState, chatId, userId, message)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.get("/close/:chatId", function (req, res) {
        // noinspection JSUnresolvedVariable
        const chatId = req.params.chatId
        const userId = req.query.userId
        const [response, code] = chatManager.finishChat(serverState, chatId, userId)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.get("/register", async function (req, res) {
        // noinspection JSUnresolvedVariable
        const login = req.query.login
        const password = req.query.password
        const [response, code] = await chatManager.registerUser(serverState, login, password)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.get("/login", async function (req, res) {
        // noinspection JSUnresolvedVariable
        const login = req.query.login
        const password = req.query.password
        const [response, code] = await chatManager.checkAuthorization(serverState, login, password)
        res.status(code)
        res.contentType("application/json")
        res.send(JSON.stringify(response))
    });

    app.listen(port);
}

module.exports.serverMain = serverMain