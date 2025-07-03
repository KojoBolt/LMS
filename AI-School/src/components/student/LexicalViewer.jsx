// src/components/LexicalViewer.js

import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';

import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Re-use the same theme from your editor
const viewerTheme = {
    ltr: 'text-left', rtl: 'text-right', paragraph: 'mb-2 leading-relaxed',
    quote: 'mx-8 border-l-4 border-gray-300 pl-4 italic',
    heading: { 
        h1: 'text-3xl font-bold my-4', 
        h2: 'text-2xl font-semibold my-3', 
        h3: 'text-xl font-semibold my-2',
    },
    list: { 
        ul: 'list-disc ml-8 my-2',
        ol: 'list-decimal ml-8 my-2',
        listitem: 'mb-1',
    },
    link: 'text-blue-500 hover:underline',
    text: { bold: 'font-bold', italic: 'italic', underline: 'underline' },
};

// This plugin handles loading plain text for old data
function PlainTextInitializerPlugin({ plainTextContent }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (plainTextContent) {
            editor.update(() => {
                const root = $getRoot();
                root.clear();
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(plainTextContent));
                root.append(paragraph);
            });
        }
    }, [editor, plainTextContent]);
    return null;
}

function LexicalViewer({ contentJSON }) {
    const isJSON = (str) => {
        if (typeof str !== 'string' || !str) return false;
        try { JSON.parse(str); return true; } catch (e) { return false; }
    };

    const initialConfig = {
        namespace: 'LexicalViewer',
        theme: viewerTheme,
        onError: (error) => console.error(error),
        editable: false, // <-- This makes the editor READ-ONLY
        nodes: [ HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode ],
        editorState: isJSON(contentJSON) ? contentJSON : null,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="lexical-viewer">
                <RichTextPlugin
                    contentEditable={<ContentEditable />}
                    placeholder={null}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            {!isJSON(contentJSON) && <PlainTextInitializerPlugin plainTextContent={contentJSON} />}
        </LexicalComposer>
    );
}

export default LexicalViewer;