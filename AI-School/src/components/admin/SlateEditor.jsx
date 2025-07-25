import React, { useMemo, useCallback, useRef } from 'react'; // Import useRef
import isHotkey from 'is-hotkey';
import { createEditor, Transforms, Editor, Text, Element as SlateElement, Range } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor, useSelected, useFocused } from 'slate-react';
import { withHistory } from 'slate-history';
import {
    Bold, Italic, Underline, Code, Heading1, Heading2,
    List, ListOrdered, Quote, Image as ImageIcon
} from 'lucide-react';

const HOTKEYS = {
    'mod+b': 'bold',
    'mod+i': 'italic',
    'mod+u': 'underline',
    'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

// --- withImages Plugin ---
const withImages = editor => {
    const { insertData, isVoid } = editor;

    editor.isVoid = element => {
        return element.type === 'image' ? true : isVoid(element);
    };

    editor.insertData = data => {
        const text = data.getData('text/plain');
        const { files } = data;

        if (files && files.length > 0) {
            for (const file of files) {
                const reader = new FileReader();
                const [mime] = file.type.split('/');

                if (mime === 'image') {
                    reader.addEventListener('load', () => {
                        const url = reader.result;
                        CustomEditor.insertImage(editor, url);
                    });
                    reader.readAsDataURL(file);
                }
            }
        } else if (text && isImageUrl(text)) {
            CustomEditor.insertImage(editor, text);
        } else {
            insertData(data);
        }
    };

    return editor;
};

// --- Helper Functions ---
const CustomEditor = {
    // ... no changes to isMarkActive, isBlockActive, toggleMark, toggleBlock ...
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
    toggleBlock(editor, format) {
        const isActive = CustomEditor.isBlockActive(editor, format);
        const isList = LIST_TYPES.includes(format);
        Transforms.unwrapNodes(editor, {
            match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
            split: true,
        });
        const newProperties = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format,
        };
        Transforms.setNodes(editor, newProperties);
        if (!isActive && isList) {
            const block = { type: format, children: [] };
            Transforms.wrapNodes(editor, block);
        }
    },
    insertImage(editor, url) {
        const text = { text: '' };
        const image = { type: 'image', url, children: [text] };
        const newParagraph = { type: 'paragraph', children: [{ text: '' }]};
        
        Transforms.insertNodes(editor, image);
        Transforms.insertNodes(editor, newParagraph, { at: [editor.children.length] });
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
        case 'image': return <Image attributes={attributes} children={children} element={element} />;
        default: return <p {...attributes}>{children}</p>;
    }
};

const Image = ({ attributes, children, element }) => {
    const selected = useSelected();
    const focused = useFocused();
    return (
        <div {...attributes}>
            <div contentEditable={false}>
                <img
                    src={element.url}
                    alt=""
                    className={`block max-w-full max-h-80 ${selected && focused ? 'shadow-lg' : ''}`}
                />
            </div>
            {children}
        </div>
    );
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.code) children = <code className="bg-green-600 p-1 rounded">{children}</code>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    return <span {...attributes}>{children}</span>;
};

// --- Main Editor Component ---
const SlateEditor = ({ value, onChange, placeholder }) => {
    const editor = useMemo(() => withHistory(withImages(withReact(createEditor()))), []);
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
                    {/* ... Other Toolbar Buttons ... */}
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
                    <div className="w-px h-5 bg-gray-300 mx-2" />
                    <InsertImageButton />
                </div>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder || "Enter you course description…"}
                    onKeyDown={event => {
                        for (const hotkey in HOTKEYS) {
                            if (isHotkey(hotkey, event)) {
                                event.preventDefault();
                                CustomEditor.toggleMark(editor, HOTKEYS[hotkey]);
                            }
                        }
                    }}
                    className="p-4 min-h-[200px] focus:outline-none"
                />
            </Slate>
        </div>
    );
};


// ✨ --- UPDATED IMAGE BUTTON --- ✨
const InsertImageButton = () => {
    const editor = useSlate();
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result;
                CustomEditor.insertImage(editor, url);
            };
            reader.readAsDataURL(file);
        }
        // Reset the input value to allow selecting the same file again
        event.target.value = null;
    };

    return (
        <>
            <button
                type="button"
                className="p-2 rounded hover:bg-gray-200"
                onMouseDown={event => {
                    event.preventDefault();
                    fileInputRef.current.click();
                }}
            >
                <ImageIcon size={16} />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />
        </>
    );
};

// This helper is no longer strictly needed by the button, but is good for the drag-drop/paste feature
const isImageUrl = url => {
    if (!url) return false;
    try {
        const ext = new URL(url).pathname.split('.').pop();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
    } catch {
        return false;
    }
};

const ToolbarButton = ({ format, icon, type = 'mark' }) => {
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

export default SlateEditor;