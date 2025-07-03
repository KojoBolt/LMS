// src/components/QuillEditor.js

import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Main stylesheet for the "snow" theme

const QuillEditor = ({ value, onChange, placeholder }) => {
  // Define the modules for the toolbar
  // You can customize this to add/remove features
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Heading dropdown
      ['bold', 'italic', 'underline', 'strike'], // Inline formatting
      [{'list': 'ordered'}, {'list': 'bullet'}], // Lists
      [{ 'align': [] }], // Text alignment
      ['link', 'image'], // Links and images
      ['clean'] // Remove formatting
    ],
  };

  // Define the formats that the editor should recognize
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <div className="bg-white">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-full"
      />
    </div>
  );
};

export default QuillEditor;