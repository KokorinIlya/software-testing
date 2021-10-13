import React from "react";

import '../../style/common.css';
import NewMessageForm from "../NewMessageForm/NewMessageForm";
import MessageList from "../MessageList/MessageList";

function BothParticipantsChat({messages, onSendMessage, userId}) {
    return (
        <>
            <MessageList messages={messages} userId={userId}/>
            <div className="button-holder">
                <NewMessageForm onSendMessage={onSendMessage}/>
            </div>
        </>
    );
}

export default BothParticipantsChat;