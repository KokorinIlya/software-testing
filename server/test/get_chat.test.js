const chatManager = require('../chat_manager')

describe('retrieving chat content', () => {
    let serverState

    beforeEach(() => {
        serverState = chatManager.createServerState()
    })

    test('non-existing chat cannot be accessed', () => {
        const [response, statusCode] = chatManager.getChat(serverState, 1, 1)
        expect(statusCode).toBe(404)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    test('chat owner can access newly-created chat', () => {
        const [connectResult] = chatManager.connect(serverState)
        const [getChatResult, statusCode] = chatManager.getChat(serverState,
            connectResult.newChatId, connectResult.userId)

        expect(statusCode).toBe(200)
        expect(getChatResult).toEqual(
            {
                userAId: connectResult.userId,
                userBId: null,
                messages: [],
                finished: false
            }
        )
    })

    test('clients cannot access chat, created recently by other clients', () => {
        const [connectResult] = chatManager.connect(serverState)
        const [response, statusCode] = chatManager.getChat(serverState,
            connectResult.newChatId, connectResult.userId + '_42')

        expect(statusCode).toBe(403)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })

    test('chat members can access it', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)
        expect(secondConnectResult.partnerId).toBe(firstConnectResult.userId)
        expect(firstConnectResult.newChatId).toBe(secondConnectResult.existingChatId)
        const aId = firstConnectResult.userId
        const bId = secondConnectResult.userId
        const chatId = firstConnectResult.newChatId

        Array.from([aId, bId]).forEach((curUId) => {
            const [curGetChatResult, curStatusCode] = chatManager.getChat(serverState, chatId, curUId)

            expect(curStatusCode).toBe(200)
            expect(curGetChatResult).toEqual(
                {
                    userAId: aId,
                    userBId: bId,
                    messages: [],
                    finished: false
                }
            )
        })
    })

    test('users cannot access other users chats', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [secondConnectResult] = chatManager.connect(serverState)
        expect(firstConnectResult.newChatId).toBe(secondConnectResult.existingChatId)

        const [response, statusCode] = chatManager.getChat(serverState,
            firstConnectResult.newChatId, firstConnectResult.userId + '_42')

        expect(statusCode).toBe(403)
        expect(response).toEqual(
            {
                error: expect.anything()
            }
        )
    })
})