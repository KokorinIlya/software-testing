const chatManager = require('../chat_manager')

describe('registration and authorization', () => {
    let serverState

    beforeEach(() => {
        serverState = chatManager.createServerState()
    })

    test('registers user', async () => {
        const [result, code] = await chatManager.registerUser(serverState, 'new_user', 'passwd')
        expect(code).toBe(200)
        expect(result).toEqual({
            status: 'OK'
        })
    })

    test('registers user and performs authorization', async () => {
        const [regResult, regCode] = await chatManager.registerUser(serverState, 'new_user', 'passwd')
        expect(regCode).toBe(200)
        expect(regResult).toEqual({
            status: 'OK'
        })
        const [authResult, authCode] = await chatManager.checkAuthorization(
            serverState, 'new_user', 'passwd')
        expect(authCode).toBe(200)
        expect(authResult).toEqual({
            status: 'OK'
        })
    })

    test('does not authorize with wrong password', async () => {
        await chatManager.registerUser(serverState, 'new_user', 'passwd')
        const [authResult, authCode] = await chatManager.checkAuthorization(
            serverState, 'new_user', 'aaa')
        expect(authCode).toBe(403)
        expect(authResult).toEqual({
            status: 'error'
        })
    })
    test('does not allow to register with the same login twice', async () => {
        await chatManager.registerUser(serverState, 'new_user', 'passwd')
        const [regRes, regCode] = await chatManager.registerUser(serverState, 'new_user', 'aaa')
        expect(regCode).toBe(403)
        expect(regRes).toEqual({
            status: 'error'
        })
    })
})