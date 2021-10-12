import React from "react";

import '../../style/common.css';
import NewMessageForm from "../NewMessageForm/NewMessageForm";
import MessageList from "../MessageList/MessageList";

function BothParticipantsChat({messages, onSendMessage, onChatClose, userId}) {
    return (
        <>
            <MessageList messages={messages} userId={userId}/>
            <div className="button-holder">
                <NewMessageForm onSendMessage={onSendMessage}/>
            </div>
            <div className="button-holder">
                <button className="menu-element" onClick={onChatClose}>
                    Завершить чат
                </button>
            </div>
        </>
    );
}

export default BothParticipantsChat;