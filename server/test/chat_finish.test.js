const chatManager = require('../chat_manager')

describe('users can finish chats', () => {
    let serverState

    beforeEach(() => {
        serverState = chatManager.createServerState()
    })

    test('chat member can finish chat without the second participant', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId

        const [response, code] = chatManager.finishChat(serverState, chatId, aId)
        expect(code).toBe(200)
        expect(response).toEqual(
            {
                status: 'OK'
            }
        )
        expect(serverState.chats).toEqual(
            {
                [chatId]: {
                    userAId: aId,
                    userBId: null,
                    messages: [],
                    finished: true
                }
            }
        )
    })

    // noinspection DuplicatedCode
    test('first chat member can finish the chat with the second participant', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)
        const chatId = firstConnectResult.newChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        const [response, code] = chatManager.finishChat(serverState, chatId, aId)
        expect(code).toBe(200)
        expect(response).toEqual(
            {
                status: 'OK'
            }
        )
        expect(serverState.chats).toEqual(
            {
                [chatId]: {
                    userAId: aId,
                    userBId: bId,
                    messages: [],
                    finished: true
                }
            }
        )
    })

    // noinspection DuplicatedCode
    test('second chat member can finish the chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)
        const chatId = secondConnectResult.existingChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        const [response, code] = chatManager.finishChat(serverState, chatId, bId)
        expect(code).toBe(200)
        expect(response).toEqual(
            {
                status: 'OK'
            }
        )
        expect(serverState.chats).toEqual(
            {
                [chatId]: {
                    userAId: aId,
                    userBId: bId,
                    messages: [],
                    finished: true
                }
            }
        )
    })

    test('chat members can fetch the finished chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)
        const chatId = secondConnectResult.existingChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        chatManager.sendMessage(serverState, chatId, bId, "Hello, a!")
        chatManager.sendMessage(serverState, chatId, aId, "Hello, b!")
        chatManager.finishChat(serverState, chatId, bId)

        Array.from([aId, bId]).forEach((curUId) => {
            const [curGetChatResult, curStatusCode] = chatManager.getChat(serverState, chatId, curUId)

            expect(curStatusCode).toBe(200)
            expect(curGetChatResult).toEqual(
                {
                    chat: {
                        userAId: aId,
                        userBId: bId,
                        messages: [
                            {
                                authorId: bId,
                                text: "Hello, a!"
                            },
                            {
                                authorId: aId,
                                text: "Hello, b!"
                            }
                        ],
                        finished: true
                    }
                }
            )
        })
    })

    test('both chat members cannot send messages to the finished chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)
        const chatId = secondConnectResult.existingChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        chatManager.finishChat(serverState, chatId, bId)

        Array.from([aId, bId]).forEach((curUId) => {
            const [response, code] = chatManager.sendMessage(serverState, chatId, curUId, "msg")
            expect(code).toBe(400)
            expect(response).toEqual(
                {
                    error: expect.anything()
                }
            )

        })
    })

    test('the only chat member cannot send messages to the finished chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const chatId = firstConnectResult.newChatId
        const aId = firstConnectResult.userId

        chatManager.finishChat(serverState, chatId, aId)

        const [response, code] = chatManager.sendMessage(serverState, chatId, aId, "msg")
        expect(code).toBe(400)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    test('chats with single participant can be finished at-most-once', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId

        const [firstResponse, firstCode] = chatManager.finishChat(serverState, chatId, aId)
        expect(firstCode).toBe(200)
        expect(firstResponse).toEqual(
            {
                status: 'OK'
            }
        )
        const [secondResponse, secondCode] = chatManager.finishChat(serverState, chatId, aId)
        expect(secondCode).toBe(400)
        expect(secondResponse).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    // noinspection DuplicatedCode
    test('chats with two participants can be finished at-most-once', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId
        chatManager.connect(serverState)

        const [firstResponse, firstCode] = chatManager.finishChat(serverState, chatId, aId)
        expect(firstCode).toBe(200)
        expect(firstResponse).toEqual(
            {
                status: 'OK'
            }
        )
        const [secondResponse, secondCode] = chatManager.finishChat(serverState, chatId, aId)
        expect(secondCode).toBe(400)
        expect(secondResponse).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    test('users cannot finish other users chats with single participant', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId

        const [response, code] = chatManager.finishChat(serverState, chatId, aId + '_42')
        expect(code).toBe(403)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    test('users cannot finish other users chats with two participants', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId
        chatManager.connect(serverState)

        const [response, code] = chatManager.finishChat(serverState, chatId, aId + '_42')
        expect(code).toBe(403)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    test('users are not connected to finished chat with one participant', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId
        expect(serverState.pendingRequestId).toEqual(chatId)

        const [response, code] = chatManager.finishChat(serverState, chatId, aId)
        expect(serverState.chats[chatId]).toEqual(
            {
                userAId: aId,
                userBId: null,
                messages: [],
                finished: true
            }
        )
        expect(code).toBe(200)
        expect(response).toEqual(
            {
                status: 'OK'
            }
        )
        expect(serverState.pendingRequestId).toBeNull()
        const [newConnectRes] = chatManager.connect(serverState)
        const newChatId = newConnectRes.newChatId
        expect(newChatId).not.toEqual(chatId)
    })
})