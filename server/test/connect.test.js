const chatManager = require('../chat_manager')

describe('connecting users via anonymous chats', () => {
    let serverState

    beforeEach(() => {
        serverState = chatManager.createServerState()
    })

    test('first client creates new chat on connection', () => {
        const [connectResult, statusCode] = chatManager.connect(serverState)

        expect(statusCode).toBe(200)
        expect(connectResult).toEqual(
            {
                newChatId: expect.anything(),
                userId: expect.anything()
            }
        )
        expect(serverState.pendingRequestId).toBe(connectResult.newChatId)
        expect(serverState.chats).toEqual(
            {
                [connectResult.newChatId]: {
                    userAId: connectResult.userId,
                    userBId: null,
                    messages: [],
                    finished: false
                }
            }
        )
    })

    test('second client enters previously created chat on connection', () => {
        const [firstConnectResult] = chatManager.connect(serverState)
        const [connectResult, statusCode] = chatManager.connect(serverState)

        expect(statusCode).toBe(200)
        expect(connectResult).toEqual(
            {
                existingChatId: firstConnectResult.newChatId,
                userId: expect.anything(),
                partnerId: firstConnectResult.userId
            }
        )
        expect(serverState.pendingRequestId).toBe(null)
        expect(serverState.chats).toEqual(
            {
                [connectResult.existingChatId]: {
                    userAId: firstConnectResult.userId,
                    userBId: connectResult.userId,
                    messages: [],
                    finished: false
                }
            }
        )
    })

    test('clients enter chats one by one', () => {
        const clientsNumber = 50

        let prevChatId = null
        let prevUserId = null

        for (let i = 0; i < clientsNumber; i++) {
            const [connectResult, statusCode] = chatManager.connect(serverState)
            expect(statusCode).toBe(200)

            if (i % 2 === 0) {
                expect(connectResult).toEqual(
                    {
                        newChatId: expect.anything(),
                        userId: expect.anything()
                    }
                )
                expect(serverState.pendingRequestId).toBe(connectResult.newChatId)
                expect(serverState.chats[connectResult.newChatId]).toEqual(
                    {
                        userAId: connectResult.userId,
                        userBId: null,
                        messages: [],
                        finished: false
                    }
                )
                prevUserId = connectResult.userId
                prevChatId = connectResult.newChatId
            } else {
                expect(connectResult).toEqual(
                    {
                        existingChatId: prevChatId,
                        userId: expect.anything(),
                        partnerId: prevUserId
                    }
                )
                expect(serverState.pendingRequestId).toBe(null)
                expect(serverState.chats[connectResult.existingChatId]).toEqual(
                    {
                        userAId: prevUserId,
                        userBId: connectResult.userId,
                        messages: [],
                        finished: false
                    }
                )
                prevChatId = null
                prevChatId = null
            }
        }
    })
})