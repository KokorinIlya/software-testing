import Message from './Message';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('Message', () => {
    test('own message is rendered correctly', () => {
        const testRender = TestRenderer.create(<Message authorId="uid_42" userId="uid_42"
                                                        messageText="Hello, world!"/>);
        expect(testRender.root.children[0].children).toEqual(["Я: Hello, world!"]);
    });

    test('other participant message is rendered correctly', () => {
        const testRender = TestRenderer.create(<Message authorId="uid_42" userId="uid_43"
                                                        messageText="Hello, world!"/>);
        expect(testRender.root.children[0].children).toEqual(["Собеседник: Hello, world!"]);
    });
})
