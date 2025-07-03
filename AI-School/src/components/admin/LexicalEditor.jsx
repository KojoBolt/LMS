import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import {
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
    $getRoot,
    $createTextNode,
    $isTextNode
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { $generateHtmlFromNodes } from '@lexical/html';

const editorTheme = {
    ltr: 'text-left', rtl: 'text-right', paragraph: 'mb-1', quote: 'mx-8 border-l-4 border-gray-300 pl-4 italic',
    heading: { h1: 'text-3xl font-bold my-4', h2: 'text-2xl font-semibold my-3', h3: 'text-xl font-semibold my-2' },
    list: { nested: { listitem: 'list-disc ml-8' }, ol: 'list-decimal ml-8', ul: 'list-disc ml-8', listitem: 'mb-1' },
    link: 'text-blue-500 hover:underline',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'bg-gray-100 text-sm font-mono p-1 rounded',
    },
};

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
                paragraph.selectEnd();
            });
        }
    }, [editor, plainTextContent]);
    return null;
}

function BlockFormatDropDown() {
    const [editor] = useLexicalComposerContext();

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (level) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                const anchorNode = selection.anchor.getNode();
                const focusNode = selection.focus.getNode();

                if (nodes.length > 1 || (nodes.length === 1 && $isTextNode(nodes[0]) &&
                    (selection.anchor.offset !== 0 || selection.focus.offset !== nodes[0].getTextContent().length))) {

                    const selectedText = selection.getTextContent();
                    let parentParagraph = anchorNode.getParent();
                    while (parentParagraph && !parentParagraph.getType().includes('paragraph') && !parentParagraph.getType().includes('heading')) {
                        parentParagraph = parentParagraph.getParent();
                    }

                    if (parentParagraph) {
                        const newHeading = $createHeadingNode(`h${level}`);
                        newHeading.append($createTextNode(selectedText));

                        const fullText = parentParagraph.getTextContent();
                        const selectionStart = selection.anchor.offset;
                        const selectionEnd = selection.focus.offset;

                        const beforeText = fullText.substring(0, Math.min(selectionStart, selectionEnd));
                        const afterText = fullText.substring(Math.max(selectionStart, selectionEnd));

                        const beforeParagraph = beforeText ? $createParagraphNode().append($createTextNode(beforeText)) : null;
                        const afterParagraph = afterText ? $createParagraphNode().append($createTextNode(afterText)) : null;

                        if (beforeParagraph) parentParagraph.insertBefore(beforeParagraph);
                        parentParagraph.insertBefore(newHeading);
                        if (afterParagraph) parentParagraph.insertBefore(afterParagraph);
                        parentParagraph.remove();
                        newHeading.selectEnd();
                    }
                } else {
                    $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
                }
            }
        });
    };

    return (
        <select
            className="p-2 text-gray-600 hover:bg-gray-200 rounded border-none bg-transparent"
            onChange={(e) => {
                const level = e.target.value;
                if (level === 'paragraph') {
                    formatParagraph();
                } else {
                    formatHeading(level);
                }
                e.target.value = 'paragraph';
            }}
        >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
        </select>
    );
}

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    return (
        <div className="flex items-center flex-wrap p-2 border-b border-gray-200 bg-gray-50 rounded-t-md gap-1">
            <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Undo" className="p-2 text-gray-600 hover:bg-gray-200 rounded">Undo</button>
            <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Redo" className="p-2 text-gray-600 hover:bg-gray-200 rounded">Redo</button>
            <div className="w-px h-5 bg-gray-300 mx-2"></div>
            <BlockFormatDropDown />
            <div className="w-px h-5 bg-gray-300 mx-2"></div>
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} title="Bold" className="p-2 font-bold text-gray-600 hover:bg-gray-200 rounded">B</button>
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} title="Italic" className="p-2 italic text-gray-600 hover:bg-gray-200 rounded">I</button>
            <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} title="Underline" className="p-2 underline text-gray-600 hover:bg-gray-200 rounded">U</button>
            <div className="w-px h-5 bg-gray-300 mx-2"></div>
            <button onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Bullet List" className="p-2 text-gray-600 hover:bg-gray-200 rounded"><List size={18} /></button>
            <button onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Numbered List" className="p-2 text-gray-600 hover:bg-gray-200 rounded"><ListOrdered size={18} /></button>
            <div className="w-px h-5 bg-gray-300 mx-2"></div>
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} title="Align Left" className="p-2 text-gray-600 hover:bg-gray-200 rounded"><AlignLeft size={18} /></button>
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} title="Align Center" className="p-2 text-gray-600 hover:bg-gray-200 rounded"><AlignCenter size={18} /></button>
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} title="Align Right" className="p-2 text-gray-600 hover:bg-gray-200 rounded"><AlignRight size={18} /></button>
            <button onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')} title="Justify" className="p-2 text-gray-600 hover:bg-gray-200 rounded"><AlignJustify size={18} /></button>
        </div>
    );
}

function Editor({ onChange, plainTextContent }) {
    const handleOnChange = (editorState) => {
    if (editorState.isEmpty()) {
        onChange('');
        return;
    }
    const editorStateJSON = JSON.stringify(editorState.toJSON()); // Convert to string
    onChange(editorStateJSON); // Send string, not object
};

    return (
        <>
            <div className="border border-gray-300 rounded-md">
                <ToolbarPlugin />
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="w-full min-h-[150px] px-3 py-2 border-0 focus:outline-none focus:ring-0 resize-none" />}
                        placeholder={<div className="absolute top-2 left-3 text-gray-400 pointer-events-none">Enter detailed course description...</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin onChange={handleOnChange} />
            {plainTextContent && <PlainTextInitializerPlugin plainTextContent={plainTextContent} />}
        </>
    );
}

function LexicalEditor({ onChange, initialContent }) {
    const isJSON = (str) => {
        if (typeof str !== 'string' || !str) return false;
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    };

    const isHTML = (str) => {
        if (typeof str !== 'string' || !str) return false;
        return str.includes('<') && str.includes('>');
    };

    let editorState = null;
    let plainTextContent = null;

    if (isJSON(initialContent)) {
        editorState = initialContent;
    } else if (isHTML(initialContent) || !initialContent) {
        editorState = null;
        plainTextContent = null;
    } else {
        plainTextContent = initialContent;
    }

    const initialConfig = {
        namespace: 'MyEditor',
        theme: editorTheme,
        onError: (error) => console.error(error),
        nodes: [HeadingNode, QuoteNode, ListItemNode, ListNode, CodeNode, CodeHighlightNode, TableNode, TableCellNode, TableRowNode, AutoLinkNode, LinkNode],
        editorState: editorState,
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <LexicalComposer initialConfig={initialConfig}>
                <Editor onChange={onChange} plainTextContent={plainTextContent} />
            </LexicalComposer>
        </div>
    );
}

export default LexicalEditor;
