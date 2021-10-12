import ChatManager from "./ChatManager";
import 'jest-extended';

describe('ChatManager.getChatData', () => {
    it('returns chat with single participant', async () => {
        const chatClient = {
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: null,
                    messages: [],
                    finished: false
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        expect(result).toEqual({
            messages: null,
            finished: false
        })
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
    })

    it('returns chat with both participants and no messages', async () => {
        const chatClient = {
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: "uid_43",
                    messages: [],
                    finished: false
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        expect(result).toEqual({
            messages: [],
            finished: false
        })
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
    })

    it('returns chat with both participants and one or more messages', async () => {
        const chatClient = {
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: "uid_43",
                    messages: ["msg_1", "msg_2"],
                    finished: false
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_43")
        expect(result).toEqual({
            messages: ["msg_1", "msg_2"],
            finished: false
        })
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_43"])
    })

    it('returns finished chat with single participant', async () => {
        const chatClient = {
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: null,
                    messages: [],
                    finished: true
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        expect(result).toEqual({
            messages: null,
            finished: true
        })
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
    })

    it('returns finished chat with both participants and no messages', async () => {
        const chatClient = {
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: "uid_43",
                    messages: [],
                    finished: true
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        expect(result).toEqual({
            messages: [],
            finished: true
        })
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
    })

    it('returns finished chat with both participants and one or more messages', async () => {
        const chatClient = {
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: "uid_43",
                    messages: ["msg_1", "msg_2"],
                    finished: true
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_43")
        expect(result).toEqual({
            messages: ["msg_1", "msg_2"],
            finished: true
        })
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_43"])
    })
})

describe('ChatManager.sendMessage', () => {
    it('sends message to the chat and retrieves its content', async () => {
        const expectedMessages = [
            {
                authorId: "uid_42",
                text: "Hello, b!"
            }
        ]
        const chatClient = {
            sendMessage: jest.fn(),
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: "uid_43",
                    messages: expectedMessages,
                    finished: false
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.sendMessage("cid_24", "uid_42", "Hello, b!")
        expect(result).toEqual({
            messages: expectedMessages,
            finished: false
        })
        expect(chatClient.sendMessage.mock.calls.length).toBe(1)
        expect(chatClient.sendMessage.mock.calls[0]).toEqual(["cid_24", "uid_42", "Hello, b!"])
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
        expect(chatClient.sendMessage).toHaveBeenCalledBefore(chatClient.getChatData)
    })
})

describe('ChatManager.closeChat', () => {
    it('closes the chat and retrieves its content', async () => {
        const chatClient = {
            closeChat: jest.fn(),
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: "uid_43",
                    messages: [],
                    finished: true
                }
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.closeChat("cid_24", "uid_42")
        expect(result).toEqual({
            messages: [],
            finished: true
        })
        expect(chatClient.closeChat.mock.calls.length).toBe(1)
        expect(chatClient.closeChat.mock.calls[0]).toEqual(["cid_24", "uid_42"])
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
        expect(chatClient.closeChat).toHaveBeenCalledBefore(chatClient.getChatData)
    })
})

describe('ChatManager.startChat', () => {
    it('starts new chat', async () => {
        const chatClient = {
            startChat: jest.fn(() => {
                return {
                    newChatId: 'cid_24',
                    userId: 'uid_42'
                }
            }),
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: null,
                    messages: [],
                    finished: false
                }
            })
        }
        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.startChat()
        expect(result).toEqual({
            chatId: 'cid_24',
            userId: 'uid_42',
            messages: null,
            finished: false
        })
        expect(chatClient.startChat.mock.calls.length).toBe(1)
        expect(chatClient.startChat.mock.calls[0]).toEqual([])
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_42"])
        expect(chatClient.startChat).toHaveBeenCalledBefore(chatClient.getChatData)
    })

    it('connects to the existing chat', async () => {
        const chatClient = {
            startChat: jest.fn(() => {
                return {
                    existingChatId: 'cid_24',
                    userId: 'uid_43'
                }
            }),
            getChatData: jest.fn(() => {
                return {
                    userAId: "uid_42",
                    userBId: 'uid_43',
                    messages: [],
                    finished: false
                }
            })
        }
        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.startChat()
        expect(result).toEqual({
            chatId: 'cid_24',
            userId: 'uid_43',
            messages: [],
            finished: false
        })
        expect(chatClient.startChat.mock.calls.length).toBe(1)
        expect(chatClient.startChat.mock.calls[0]).toEqual([])
        expect(chatClient.getChatData.mock.calls.length).toBe(1)
        expect(chatClient.getChatData.mock.calls[0]).toEqual(["cid_24", "uid_43"])
        expect(chatClient.startChat).toHaveBeenCalledBefore(chatClient.getChatData)
    })
})

describe('ChatManager.register', () => {
    it('returns true on correct requests', async () => {
        const chatClient = {
            register: jest.fn(() => {
                return 200
            })
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.register('login', 'password')
        expect(res).toBeTrue()
        expect(chatClient.register.mock.calls.length).toBe(1)
        expect(chatClient.register.mock.calls[0]).toEqual(['login', 'password'])
    })

    it('returns false on incorrect requests', async () => {
        const chatClient = {
            register: jest.fn(() => {
                return 403
            })
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.register('login', 'password')
        expect(res).toBeFalse()
        expect(chatClient.register.mock.calls.length).toBe(1)
        expect(chatClient.register.mock.calls[0]).toEqual(['login', 'password'])
    })
})

describe('ChatManager.login', () => {
    it('returns true on correct requests', async () => {
        const chatClient = {
            login: jest.fn(() => {
                return 200
            })
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.login('login', 'password')
        expect(res).toBeTrue()
        expect(chatClient.login.mock.calls.length).toBe(1)
        expect(chatClient.login.mock.calls[0]).toEqual(['login', 'password'])
    })

    it('returns false on incorrect requests', async () => {
        const chatClient = {
            login: jest.fn(() => {
                return 403
            })
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.login('login', 'password')
        expect(res).toBeFalse()
        expect(chatClient.login.mock.calls.length).toBe(1)
        expect(chatClient.login.mock.calls[0]).toEqual(['login', 'password'])
    })
})