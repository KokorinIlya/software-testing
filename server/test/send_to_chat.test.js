const chatManager = require('../chat_manager')

describe('sending messages to chats', () => {
    let serverState

    beforeEach(() => {
        serverState = chatManager.createServerState()
    })

    test('chat members can send messages to the chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)

        const chatId = firstConnectResult.newChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        const [aResponse, aStatusCode] = chatManager.sendMessage(serverState,
            chatId, aId, "Hello, b!")
        expect(aStatusCode).toBe(200)
        expect(aResponse).toEqual(
            {
                status: expect.anything()
            }
        )
        expect(serverState.chats).toEqual(
            {
                [chatId]: {
                    userAId: aId,
                    userBId: bId,
                    messages: [
                        {
                            authorId: aId,
                            text: "Hello, b!"
                        }
                    ],
                    finished: false
                }
            }
        )

        const [bResponse, bStatusCode] = chatManager.sendMessage(serverState,
            chatId, bId, "Hello, a!")
        expect(bStatusCode).toBe(200)
        expect(bResponse).toEqual(
            {
                status: expect.anything()
            }
        )

        expect(serverState.chats).toEqual(
            {
                [chatId]: {
                    userAId: aId,
                    userBId: bId,
                    messages: [
                        {
                            authorId: aId,
                            text: "Hello, b!"
                        },
                        {
                            authorId: bId,
                            text: "Hello, a!"
                        }
                    ],
                    finished: false
                }
            }
        )
    })

    test('chat members can read messages, sent to the chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)

        const chatId = firstConnectResult.newChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        chatManager.sendMessage(serverState, chatId, aId, "Hello, b!")
        chatManager.sendMessage(serverState, chatId, bId, "Hello, a!")

        Array.from([aId, bId]).forEach((curUId) => {
            const [curGetChatResult, curStatusCode] = chatManager.getChat(serverState, chatId, curUId)

            expect(curStatusCode).toBe(200)
            expect(curGetChatResult).toEqual(
                {
                    userAId: aId,
                    userBId: bId,
                    messages: [
                        {
                            authorId: aId,
                            text: "Hello, b!"
                        },
                        {
                            authorId: bId,
                            text: "Hello, a!"
                        }
                    ],
                    finished: false
                }
            )
        })
    })

    test('chat member can send multiple messages to the chat', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)

        const chatId = firstConnectResult.newChatId
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId

        chatManager.sendMessage(serverState, chatId, aId, "Hello, 1!")
        chatManager.sendMessage(serverState, chatId, aId, "Hello, 2!")
        chatManager.sendMessage(serverState, chatId, aId, "Hello, 3!")
        chatManager.sendMessage(serverState, chatId, aId, "Hello, 4!")

        expect(serverState.chats).toEqual(
            {
                [chatId]: {
                    userAId: aId,
                    userBId: bId,
                    messages: [
                        {
                            authorId: aId,
                            text: "Hello, 1!"
                        },
                        {
                            authorId: aId,
                            text: "Hello, 2!"
                        },
                        {
                            authorId: aId,
                            text: "Hello, 3!"
                        },
                        {
                            authorId: aId,
                            text: "Hello, 4!"
                        }
                    ],
                    finished: false
                }
            }
        )
    })

    test('chat member cannot send messages to the chat without the second participant', () => {
        const [connectResult] = chatManager.connect(serverState)
        const chatId = connectResult.newChatId
        const aId = connectResult.userId

        const [response, code] = chatManager.sendMessage(serverState, chatId, aId, "Hello")
        expect(code).toBe(400)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })
})