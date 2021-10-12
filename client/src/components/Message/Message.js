import React from 'react';

import './Message.css';

function Message({messageText, authorId, userId}) {
    let className
    let authorName
    if (authorId === userId) {
        className = "own-message"
        authorName = "Я"
    } else {
        className = "other-message"
        authorName = "Собеседник"
    }
    return (
        <div className={className}>
            {`${authorName}: ${messageText}`}
        </div>
    );
}

export default Message;