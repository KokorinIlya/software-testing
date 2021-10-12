/* eslint-disable */
import chai from 'chai'
import ChatManager from "./ChatManager.js";
import sinon from 'sinon'

describe('ChatManager.getChatData', () => {
    it('returns chat with single participant', async () => {
        const chatClient = {
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: null,
                messages: [],
                finished: false
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        chai.expect(result).to.deep.equal({
            messages: null,
            finished: false
        });
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })

    it('returns chat with both participants and no messages', async () => {
        const chatClient = {
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: "uid_43",
                messages: [],
                finished: false
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        chai.expect(result).to.deep.equal({
            messages: [],
            finished: false
        })
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })

    it('returns chat with both participants and one or more messages', async () => {
        const chatClient = {
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: "uid_43",
                messages: ["msg_1", "msg_2"],
                finished: false
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_43")
        chai.expect(result).to.deep.equal({
            messages: ["msg_1", "msg_2"],
            finished: false
        })
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_43"])
    })

    it('returns finished chat with single participant', async () => {
        const chatClient = {
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: null,
                messages: [],
                finished: true
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        chai.expect(result).to.deep.equal({
            messages: null,
            finished: true
        })
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })

    it('returns finished chat with both participants and no messages', async () => {
        const chatClient = {
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: "uid_43",
                messages: [],
                finished: true
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_42")
        chai.expect(result).to.deep.equal({
            messages: [],
            finished: true
        })
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })

    it('returns finished chat with both participants and one or more messages', async () => {
        const chatClient = {
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: "uid_43",
                messages: ["msg_1", "msg_2"],
                finished: true
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.getChatData("cid_24", "uid_43")
        chai.expect(result).to.deep.equal({
            messages: ["msg_1", "msg_2"],
            finished: true
        })
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_43"])
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
            sendMessage: sinon.fake(),
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: "uid_43",
                messages: expectedMessages,
                finished: false
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.sendMessage("cid_24", "uid_42", "Hello, b!")
        chai.expect(result).to.deep.equal({
            messages: expectedMessages,
            finished: false
        })

        chai.expect(chatClient.sendMessage.callCount).to.equal(1)
        chai.expect(chatClient.sendMessage.getCall(0).args).to.deep.equal(["cid_24", "uid_42", "Hello, b!"])
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })
})

describe('ChatManager.closeChat', () => {
    it('closes the chat and retrieves its content', async () => {
        const chatClient = {
            closeChat: sinon.fake(),
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: "uid_43",
                messages: [],
                finished: true
            })
        }

        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.closeChat("cid_24", "uid_42")
        chai.expect(result).to.deep.equal({
            messages: [],
            finished: true
        })
        chai.expect(chatClient.closeChat.callCount).to.equal(1)
        chai.expect(chatClient.closeChat.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })
})

describe('ChatManager.startChat', () => {
    it('starts new chat', async () => {
        const chatClient = {
            startChat: sinon.fake.returns({
                newChatId: 'cid_24',
                userId: 'uid_42'
            }),
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: null,
                messages: [],
                finished: false
            })
        }
        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.startChat()
        chai.expect(result).to.deep.equal({
            chatId: 'cid_24',
            userId: 'uid_42',
            messages: null,
            finished: false
        })
        chai.expect(chatClient.startChat.callCount).to.equal(1)
        chai.expect(chatClient.startChat.getCall(0).args).to.deep.equal([])
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_42"])
    })

    it('connects to the existing chat', async () => {
        const chatClient = {
            startChat: sinon.fake.returns({
                existingChatId: 'cid_24',
                userId: 'uid_43'
            }),
            getChatData: sinon.fake.returns({
                userAId: "uid_42",
                userBId: 'uid_43',
                messages: [],
                finished: false
            })
        }
        const chatManager = new ChatManager(chatClient)
        const result = await chatManager.startChat()
        chai.expect(result).to.deep.equal({
            chatId: 'cid_24',
            userId: 'uid_43',
            messages: [],
            finished: false
        })
        chai.expect(chatClient.startChat.callCount).to.equal(1)
        chai.expect(chatClient.startChat.getCall(0).args).to.deep.equal([])
        chai.expect(chatClient.getChatData.callCount).to.equal(1)
        chai.expect(chatClient.getChatData.getCall(0).args).to.deep.equal(["cid_24", "uid_43"])
    })
})

describe('ChatManager.register', () => {
    it('returns true on correct requests', async () => {
        const chatClient = {
            register: sinon.fake.returns(200)
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.register('login', 'password')
        chai.expect(res).to.be.true;
        chai.expect(chatClient.register.getCall(0).args).to.deep.equal(['login', 'password'])
        chai.expect(chatClient.register.callCount).to.equal(1)
    })

    it('returns false on correct requests', async () => {
        const chatClient = {
            register: sinon.fake.returns(403)
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.register('login', 'password')
        chai.expect(res).to.be.false;
        chai.expect(chatClient.register.getCall(0).args).to.deep.equal(['login', 'password'])
        chai.expect(chatClient.register.callCount).to.equal(1)
    })
})

describe('ChatManager.login', () => {
    it('returns true on correct requests', async () => {
        const chatClient = {
            login: sinon.fake.returns(200)
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.login('login', 'password')
        chai.expect(res).to.be.true;
        chai.expect(chatClient.login.getCall(0).args).to.deep.equal(['login', 'password'])
        chai.expect(chatClient.login.callCount).to.equal(1)
    })

    it('returns false on correct requests', async () => {
        const chatClient = {
            login: sinon.fake.returns(403)
        }
        const chatManager = new ChatManager(chatClient)
        const res = await chatManager.login('login', 'password')
        chai.expect(res).to.be.false;
        chai.expect(chatClient.login.getCall(0).args).to.deep.equal(['login', 'password'])
        chai.expect(chatClient.login.callCount).to.equal(1)
    })
})