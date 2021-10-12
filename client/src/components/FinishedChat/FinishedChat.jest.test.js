import FinishedChat from './FinishedChat';
import React from "react";
import TestRenderer from "react-test-renderer";
import {render, screen} from '@testing-library/react';

describe('FinishedChat', () => {
    test('renders text', () => {
        render(<FinishedChat userId="uid_42" messages={[]} onChatClose={jest.fn()}/>);
        const linkElement = screen.getByText(/Завершённый чат/i);
        expect(linkElement).toBeInTheDocument();
    });

    test('renders not empty message list correctly', () => {
        const testRender = TestRenderer.create(<FinishedChat userId="uid_42" messages={
            [
                {authorId: "uid_42", text: "Hello, world!"},
                {authorId: "uid_43", text: "Hello, 42!"},
                {authorId: "uid_43", text: "Hello, one more time"},
            ]
        } onChatClose={jest.fn()}
        />);
        const messagesList = testRender.root.children[1].children[0].children[0]
        expect(messagesList.children[0].children[0].children).toEqual([
            "Я: Hello, world!"
        ])
        expect(messagesList.children[1].children[0].children).toEqual([
            "Собеседник: Hello, 42!"
        ])
        expect(messagesList.children[2].children[0].children).toEqual([
            "Собеседник: Hello, one more time"
        ])
    });

    test('renders empty message list correctly', () => {
        const testRender = TestRenderer.create(<FinishedChat userId="uid_42" messages={[]}
                                                             onChatClose={jest.fn()}/>);
        const messagesList = testRender.root.children[1].children[0].children[0]
        expect(messagesList.children).toEqual([])
    });

    test('renders null message list correctly', () => {
        const testRender = TestRenderer.create(<FinishedChat userId="uid_42" messages={null}
                                                             onChatClose={jest.fn()}/>);
        const messagesList = testRender.root.children[1].children[0].children[0]
        expect(messagesList.children).toEqual([])
    });

    test('closes chat on button press', () => {
        const mock = jest.fn()
        const testRender = TestRenderer.create(<FinishedChat userId="uid_42" messages={null}
                                                             onChatClose={mock}/>);
        const button = testRender.root.findByType('button')
        expect(button.children).toEqual(['Вернуться в приложение'])
        // noinspection JSUnresolvedFunction
        button.props.onClick()
        expect(mock.mock.calls.length).toBe(1)
    });
})
