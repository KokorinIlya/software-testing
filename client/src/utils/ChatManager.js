import assert from 'assert'

// noinspection JSUnresolvedVariable
export default class ChatManager {
    constructor(chatClient) {
        this.chatClient = chatClient
    }

    async getChatData(chatId, userId) {
        const jsonData = await this.chatClient.getChatData(chatId, userId)
        const chatData = jsonData.chat // TODO
        let messages = null
        assert(chatData.userAId === userId || chatData.userBId === userId)
        if (chatData.userBId !== null) {
            messages = chatData.messages
        }
        return {
            messages: messages,
            finished: chatData.finished
        }
    }

    async sendMessage(chatId, userId, message) {
        await this.chatClient.sendMessage(chatId, userId, message)
        return await this.getChatData(chatId, userId)
    }

    async closeChat(chatId, userId) {
        await this.chatClient.closeChat(chatId, userId)
        return await this.getChatData(chatId, userId)
    }

    async startChat() {
        const json = await this.chatClient.startChat()
        if (json.newChatId !== undefined) {
            const {newChatId, userId} = json
            const {messages, finished} = await this.getChatData(newChatId, userId)
            return {
                chatId: newChatId,
                userId: userId,
                messages: messages,
                finished: finished
            }
        } else {
            const {existingChatId, userId} = json
            const {messages, finished} = await this.getChatData(existingChatId, userId)
            return {
                chatId: existingChatId,
                userId: userId,
                messages: messages,
                finished: finished
            }
        }
    }

    async register(login, password) {
        const code = await this.chatClient.register(login, password)
        return code === 200
    }

    async login(login, password) {
        const code = await this.chatClient.login(login, password)
        return code === 200
    }
}