import NewMessageForm from './NewMessageForm';
import React from "react";
import TestRenderer from "react-test-renderer";

describe('NewMessageForm', () => {
    test('changes form text', () => {
        const mockedHandle = jest.fn()
        const testRender = TestRenderer.create(<NewMessageForm onSendMessage={mockedHandle}/>);
        const form = testRender.root.findByType('textarea');
        form.props.onChange(
            {
                target: {
                    value: 'some message'
                }
            }
        )
        const button = testRender.root.findByType('form');
        // noinspection JSUnresolvedFunction
        button.props.onSubmit(
            {
                preventDefault: jest.fn()
            }
        )
        expect(mockedHandle.mock.calls.length).toBe(1)
        expect(mockedHandle.mock.calls[0]).toEqual(['some message'])
    });
})
