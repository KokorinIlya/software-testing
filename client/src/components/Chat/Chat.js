import React from "react";
import '../../style/common.css';
import ActiveChat from "../ActiveChat/ActiveChat";
import FinishedChat from "../FinishedChat/FinishedChat";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.chatId = props.chatId
        this.userId = props.userId
        this.chatManager = props.chatManager

        this.state = {
            messages: props.messages,
            finished: props.finished
        }
        this.handleReloadButton = this.handleReloadButton.bind(this)
        this.handleSendMessage = this.handleSendMessage.bind(this)
        this.handleCloseChat = this.handleCloseChat.bind(this)
    }

    async handleSendMessage(messageText) {
        const {messages, finished} = await this.chatManager.sendMessage(this.chatId, this.userId, messageText)
        this.setState({
            messages: messages,
            finished: finished
        })
    }

    async handleReloadButton() {
        const {messages, finished} = await this.chatManager.getChatData(this.chatId, this.userId)
        this.setState({
            messages: messages,
            finished: finished
        })
    }

    async handleCloseChat() {
        const {messages, finished} = await this.chatManager.closeChat(this.chatId, this.userId)
        this.setState({
            messages: messages,
            finished: finished
        })
    }

    render() {
        if (!this.state.finished) {
            return (
                <ActiveChat
                    userId={this.userId}
                    messages={this.state.messages}
                    onSendMessage={this.handleSendMessage}
                    onChatClose={this.handleCloseChat}
                    onReloadButton={this.handleReloadButton}
                />
            )
        } else {
            return (
                <FinishedChat messages={this.state.messages}
                              userId={this.userId}
                              onChatClose={this.props.onChatClose}
                />
            );
        }
    }
}

export default Chat;