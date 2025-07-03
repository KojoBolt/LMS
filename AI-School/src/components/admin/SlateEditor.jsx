// src/components/SlateEditor.js

import React, { useMemo, useCallback } from 'react';
import isHotkey from 'is-hotkey';
import { createEditor, Transforms, Editor, Text, Element as SlateElement, Range } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Bold, Italic, Underline, Code, Heading1, Heading2,
  List, ListOrdered, Quote
} from 'lucide-react';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

// --- Reusable Toolbar Button ---
const ToolbarButton = ({ format, icon, type = 'mark' | 'block' }) => {
    const editor = useSlate();
    const isActive = type === 'mark'
        ? CustomEditor.isMarkActive(editor, format)
        : CustomEditor.isBlockActive(editor, format);
    
    return (
        <button
            type="button"
            className={`p-2 rounded ${isActive ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
            onMouseDown={event => {
                event.preventDefault();
                if (type === 'mark') {
                    CustomEditor.toggleMark(editor, format);
                } else {
                    CustomEditor.toggleBlock(editor, format);
                }
            }}
        >
            {icon}
        </button>
    );
};


// --- Helper Functions ---
const CustomEditor = {
    isMarkActive(editor, format) {
        const marks = Editor.marks(editor);
        return marks ? marks[format] === true : false;
    },
    isBlockActive(editor, format) {
        const { selection } = editor;
        if (!selection) return false;
        const [match] = Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
        });
        return !!match;
    },
    toggleMark(editor, format) {
        const isActive = CustomEditor.isMarkActive(editor, format);
        if (isActive) {
            Editor.removeMark(editor, format);
        } else {
            Editor.addMark(editor, format, true);
        }
    },
    // This is the UPGRADED function that handles splitting blocks
    toggleBlock(editor, format) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);
        const { selection } = editor;

        // First, unwrap any list to handle toggling lists off correctly
        Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
            split: true,
        });

        // The new, "smarter" logic
        if (selection && !Range.isCollapsed(selection) && !isList) {
            // Case 1: Text is highlighted. Wrap just the selection in a new block.
            const newBlock = { type: isActive ? 'paragraph' : format, children: [] };
            // Editor.fragment gets the highlighted part.
            newBlock.children = Editor.fragment(editor, selection);
            // Replaces the selection with our new block.
            Transforms.insertNodes(editor, newBlock);
        } else {
            // Case 2: It's just a cursor. Change the entire block's type.
            const newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : format,
            };
            Transforms.setNodes(editor, newProperties);
        }

        // If a list format was chosen, wrap the new list-item(s) in the proper list container
        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    },
};

// --- Rendering Components ---
const Element = ({ attributes, children, element }) => {
    switch (element.type) {
        case 'block-quote': return <blockquote {...attributes} className="border-l-4 pl-4 italic">{children}</blockquote>;
        case 'bulleted-list': return <ul {...attributes} className="list-disc ml-8">{children}</ul>;
        case 'heading-one': return <h1 {...attributes} className="text-3xl font-bold">{children}</h1>;
        case 'heading-two': return <h2 {...attributes} className="text-2xl font-semibold">{children}</h2>;
        case 'list-item': return <li {...attributes}>{children}</li>;
        case 'numbered-list': return <ol {...attributes} className="list-decimal ml-8">{children}</ol>;
        default: return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.code) children = <code className="bg-gray-100 p-1 rounded">{children}</code>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    return <span {...attributes}>{children}</span>;
};

// --- Main Editor Component ---
const SlateEditor = ({ value, onChange, placeholder }) => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const renderElement = useCallback(props => <Element {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    
    const initialValue = useMemo(() => value && value.length > 0
        ? value
        : [{ type: 'paragraph', children: [{ text: '' }] }],
    [value]);

    return (
        <div className="border border-gray-300 rounded-md">
            <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
                <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50 gap-1 flex-wrap">
                    <ToolbarButton type="mark" format="bold" icon={<Bold size={16} />} />
                    <ToolbarButton type="mark" format="italic" icon={<Italic size={16} />} />
                    <ToolbarButton type="mark" format="underline" icon={<Underline size={16} />} />
                    <ToolbarButton type="mark" format="code" icon={<Code size={16} />} />
                    <div className="w-px h-5 bg-gray-300 mx-2" />
                    <ToolbarButton type="block" format="heading-one" icon={<Heading1 size={16} />} />
                    <ToolbarButton type="block" format="heading-two" icon={<Heading2 size={16} />} />
                    <ToolbarButton type="block" format="block-quote" icon={<Quote size={16} />} />
                    <ToolbarButton type="block" format="numbered-list" icon={<ListOrdered size={16} />} />
                    <ToolbarButton type="block" format="bulleted-list" icon={<List size={16} />} />
                </div>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder || "Enter you course description…"}
                    onKeyDown={event => {
                        for (const hotkey in HOTKEYS) {
                            if (isHotkey(hotkey, event)) {
                                event.preventDefault();
                                const mark = HOTKEYS[hotkey];
                                CustomEditor.toggleMark(editor, mark);
                            }
                        }
                    }}
                    className="p-4 min-h-[200px] focus:outline-none"
                />
            </Slate>
        </div>
    );
};

export default SlateEditor;