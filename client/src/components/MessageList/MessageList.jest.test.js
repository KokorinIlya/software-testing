import MessageList from './MessageList';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('MessageList', () => {
    test('renders correctly', () => {
        const testRender = TestRenderer.create(<MessageList userId="uid_42" messages={
            [
                {authorId: "uid_42", text: "Hello, world!"},
                {authorId: "uid_43", text: "Hello, 42!"},
                {authorId: "uid_43", text: "Hello, one more time"},
            ]
        }/>);
        const messages = testRender.root.children
        expect(messages[0].children[0].children[0].children).toEqual(["Я: Hello, world!"])
        expect(messages[0].children[1].children[0].children).toEqual(["Собеседник: Hello, 42!"])
        expect(messages[0].children[2].children[0].children).toEqual(["Собеседник: Hello, one more time"])
    })
})
