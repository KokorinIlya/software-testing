import React from "react";
import './MessageList.css';
import Message from "../Message/Message";

function MessageList({messages, userId}) {
    const renderableMessages = messages.map((msg, idx) =>
        <Message key={idx}
                 authorId={msg.authorId}
                 messageText={msg.text}
                 userId={userId}
        />
    )
    return (
        <div className="message-box">
            {renderableMessages}
        </div>
    );
}

export default MessageList;