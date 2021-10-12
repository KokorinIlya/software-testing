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
            onSendMessage={jest.fn()} onChatClose={jest.fn()} userId={"uid_42"}
        />);
        [
            "Я: Hello, world!", "Собеседник: Hello, 42!",
            "Собеседник: Hello, one more time"
        ].forEach((text) => {
            const linkElement = screen.getByText(text);
            expect(linkElement).toBeInTheDocument();
        })
    });

    test('performs chat closing on button click', () => {
        const onClickMock = jest.fn()
        const testRender = TestRenderer.create(<BothParticipantsChat
            messages={[]} onSendMessage={jest.fn()} onChatClose={onClickMock} userId={"uid_42"}
        />);
        const button = testRender.root.children[2].children[0]
        // noinspection JSUnresolvedFunction
        button.props.onClick()
        expect(button.children).toEqual(['Завершить чат'])
        expect(onClickMock.mock.calls.length).toBe(1)
    });
})
