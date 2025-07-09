import React, { useMemo, useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

// Reusable rendering components from your editor
const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return <blockquote style={style} {...attributes} className="border-l-4 pl-4 italic">{children}</blockquote>;
    case 'bulleted-list':
      return <ul style={style} {...attributes} className="list-disc ml-8">{children}</ul>;
    case 'heading-one':
      return <h1 style={style} {...attributes} className="text-3xl font-bold">{children}</h1>;
    case 'heading-two':
      return <h2 style={style} {...attributes} className="text-2xl font-semibold">{children}</h2>;
    case 'list-item':
      return <li style={style} {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol style={style} {...attributes} className="list-decimal ml-8">{children}</ol>;
    
    // ✨ ADD THIS CASE TO RENDER IMAGES
    case 'image':
      return (
        <div {...attributes} style={style}>
          <div contentEditable={false}>
            <img
              src={element.url}
              alt=""
              className="block max-w-full max-h-80" // Makes image responsive
            />
          </div>
          {children}
        </div>
      );

    default:
      return <p style={style} {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.code) children = <code className="bg-gray-100 p-1 rounded">{children}</code>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  return <span {...attributes}>{children}</span>;
};


const SlateViewer = ({ value }) => {
  // Create an editor instance that is for viewing only
  const editor = useMemo(() => withReact(createEditor()), []);

  // Define renderers
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  // IMPORTANT: This makes the component "backwards-compatible"
  // It ensures the value is always in the correct format Slate expects.
  const initialValue = useMemo(() => {
    // If the value is old plain text, convert it to Slate format
    if (typeof value === 'string') {
      return [{ type: 'paragraph', children: [{ text: value }] }];
    }
    // If the value is already in Slate format (an array), use it
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
    // Otherwise, return a default empty state
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }, [value]);

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        readOnly // This prop makes the editor non-editable
        placeholder="No content available."
      />
    </Slate>
  );
};

export default SlateViewer;