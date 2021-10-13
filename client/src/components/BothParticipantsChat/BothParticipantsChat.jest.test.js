import {render, screen} from '@testing-library/react';
import BothParticipantsChat from './BothParticipantsChat';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('BothParticipantsChat', () => {
    test('renders messages', () => {
        render(<BothParticipantsChat
            messages={
                [
                    {authorId: "uid_42", text: "Hello, world!"},
                    {authorId: "uid_43", text: "Hello, 42!"},
                    {authorId: "uid_43", text: "Hello, one more time"},
                ]
            }
            onSendMessage={jest.fn()} userId={"uid_42"}
        />)
        const texts = [
            "Я: Hello, world!", "Собеседник: Hello, 42!",
            "Собеседник: Hello, one more time"
        ]
        for (const text of texts) {
            const linkElement = screen.getByText(text)
            expect(linkElement).toBeInTheDocument()
        }
    })
})
