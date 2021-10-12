import {render, screen} from '@testing-library/react';
import ActiveChat from './ActiveChat';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('ActiveChat', () => {
    test('renders messages', () => {
        render(<ActiveChat
            messages={
                [
                    {authorId: "uid_42", text: "Hello, world!"},
                    {authorId: "uid_43", text: "Hello, 42!"},
                    {authorId: "uid_43", text: "Hello, one more time"},
                ]
            }
            userId={"uid_42"}
            onSendMessage={jest.fn()} onChatClose={jest.fn()} onReloadButton={jest.fn()}
        />);
        [
            "Я: Hello, world!", "Собеседник: Hello, 42!",
            "Собеседник: Hello, one more time"
        ].forEach((text) => {
            const linkElement = screen.getByText(text);
            expect(linkElement).toBeInTheDocument();
        })
    });

    test('performs chat reloading on button click', () => {
        const onClickMock = jest.fn()
        const testRender = TestRenderer.create(<ActiveChat
            messages={[]} userId={"uid_42"}
            onSendMessage={jest.fn()} onChatClose={jest.fn()} onReloadButton={onClickMock}
        />);
        const button = testRender.root.children[1].children[1].children[0]
        // noinspection JSUnresolvedFunction
        button.props.onClick()
        expect(button.children).toEqual(['Обновить страницу'])
        expect(onClickMock.mock.calls.length).toBe(1)
    });
})
