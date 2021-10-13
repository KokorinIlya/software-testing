const uuid = require('uuid')
const assert = require('assert/strict')
const bcrypt = require('bcrypt')

function createServerState() {
    return {
        chats: {},
        pendingRequestId: null,
        users: {}
    }
}

function connect(serverState) {
    const userId = uuid.v4()
    if (serverState.pendingRequestId == null) {
        const newChatId = uuid.v4()
        serverState.pendingRequestId = newChatId
        serverState.chats[newChatId] = {
            userAId: userId,
            userBId: null,
            messages: [],
            finished: false
        }
        const response = {
            newChatId: newChatId,
            userId: userId
        }
        return [response, 200]
    } else {
        const userId = uuid.v4()
        serverState.chats[serverState.pendingRequestId].userBId = userId
        const response = {
            existingChatId: serverState.pendingRequestId,
            userId: userId,
            partnerId: serverState.chats[serverState.pendingRequestId].userAId
        }
        serverState.pendingRequestId = null
        return [response, 200]
    }
}

function checkChatAccess(serverState, chatId, userId) {
    const chat = serverState.chats[chatId]

    if (chat !== undefined) {
        assert(chat.userAId !== null)
        if (chat.userAId === userId || chat.userBId === userId) {
            return [chat, 200]
        } else {
            const result = {
                error: "You don't have permission to access this chat"
            }
            return [result, 403]
        }
    } else {
        const result = {
            error: "Chat doesn't exist"
        }
        return [result, 404]
    }
}

function getChat(serverState, chatId, userId) {
    return checkChatAccess(serverState, chatId, userId)
}

function sendMessage(serverState, chatId, userId, message) {
    const [maybeChat, code] = checkChatAccess(serverState, chatId, userId)
    if (code !== 200) {
        return [maybeChat, code]
    }
    if (maybeChat.finished) {
        const result = {
            error: 'Cannot send messages to the finished chat'
        }
        return [result, 400]
    }
    if (maybeChat.userBId === null) {
        const result = {
            error: 'Cannot send messages to the chat without the second participant'
        }
        return [result, 400]
    }

    const newMessage = {
        authorId: userId,
        text: message
    }
    maybeChat.messages.push(newMessage)
    const result = {
        status: 'OK'
    }
    return [result, 200]
}

function finishChat(serverState, chatId, userId) {
    const [maybeChat, code] = checkChatAccess(serverState, chatId, userId)
    if (code !== 200) {
        return [maybeChat, code]
    }
    if (maybeChat.finished) {
        const result = {
            error: 'Cannot finish already finished chat'
        }
        return [result, 400]
    }
    maybeChat.finished = true
    if (chatId === serverState.pendingRequestId) {
        assert(maybeChat.userBId === null)
        serverState.pendingRequestId = null
    }
    const result = {
        status: 'OK'
    }
    return [result, 200]
}

async function registerUser(serverState, login, password) {
    const user = serverState.users[login]
    if (user !== undefined) {
        const result = {
            status: 'error'
        }
        return [result, 403]
    }
    const saltRounds = 10
    const curHash = await bcrypt.hash(password, saltRounds)
    serverState.users[login] = {
        passHash: curHash,
        savedChats: []
    }
    const result = {
        status: 'OK'
    }
    return [result, 200]
}

async function checkAuthorization(serverState, login, password) {
    const user = serverState.users[login]
    if (user === undefined) {
        const result = {
            status: 'error'
        }
        return [result, 403]
    }
    const isEq = await bcrypt.compare(password, user.passHash)
    if (isEq) {
        const result = {
            status: 'OK'
        }
        return [result, 200]
    } else {
        const result = {
            status: 'error'
        }
        return [result, 403]
    }
}

module.exports.checkAuthorization = checkAuthorization
module.exports.registerUser = registerUser
module.exports.finishChat = finishChat
module.exports.sendMessage = sendMessage
module.exports.connect = connect
module.exports.getChat = getChat
module.exports.createServerState = createServerState