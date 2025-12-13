import { useCallback, useEffect, useState } from 'react';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { EditorContent, useEditor } from '@tiptap/react';

// Base Kit
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';

// Build extensions
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { RichTextUnderline, TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { RichTextStrike, Strike } from 'reactjs-tiptap-editor/strike';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { RichTextTaskList, TaskList } from 'reactjs-tiptap-editor/tasklist';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { History, RichTextRedo, RichTextUndo } from 'reactjs-tiptap-editor/history';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
import { RichTextAlign, TextAlign } from 'reactjs-tiptap-editor/textalign';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { RichTextSearchAndReplace, SearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { RichTextTable, Table } from 'reactjs-tiptap-editor/table';

// Bubble menus
import {
  RichTextBubbleLink,
  RichTextBubbleText,
  RichTextBubbleImage,
  RichTextBubbleTable,
} from 'reactjs-tiptap-editor/bubble';

// Slash Command
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';

import { Check, Cloud, Loader2 } from 'lucide-react';

// Custom document
const DocumentExtended = Document.extend({
  content: '(block)+',
});

const BaseKit = [
  DocumentExtended,
  Text,
  Dropcursor,
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
  Placeholder.configure({
    placeholder: "Press '/' for commands, or start writing...",
  }),
];

const extensions = [
  ...BaseKit,
  History,
  SearchAndReplace,
  Clear,
  Heading.configure({ levels: [1, 2, 3, 4] }),
  Bold,
  Italic,
  TextUnderline,
  Strike,
  Color,
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TaskList,
  Link,
  Image.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files));
        }, 300);
      });
    },
  }),
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,
  Table,
  SlashCommand,
];

const DEFAULT_CONTENT = `<h1>Welcome to your Notes</h1><p>Start writing here, or press <code>/</code> for commands...</p><p></p>`;

function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved';
  lastSaved?: Date;
}

const RichTextToolbar = () => {
  return (
    <div className="flex items-center p-2 gap-1 flex-wrap border-b border-toolbar-border bg-toolbar-bg rounded-t-lg">
      <div className="flex items-center gap-0.5 pr-2 border-r border-border">
        <RichTextUndo />
        <RichTextRedo />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextHeading />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextBold />
        <RichTextItalic />
        <RichTextUnderline />
        <RichTextStrike />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextColor />
        <RichTextHighlight />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextBulletList />
        <RichTextOrderedList />
        <RichTextTaskList />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextAlign />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextLink />
        <RichTextImage />
        <RichTextTable />
      </div>
      <div className="flex items-center gap-0.5 px-2 border-r border-border">
        <RichTextBlockquote />
        <RichTextCode />
        <RichTextCodeBlock />
        <RichTextHorizontalRule />
      </div>
      <div className="flex items-center gap-0.5 px-2">
        <RichTextSearchAndReplace />
        <RichTextClear />
      </div>
    </div>
  );
};

const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  return (
    <div className={`save-indicator ${status.status}`}>
      {status.status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status.status === 'saved' && (
        <>
          <Cloud className="w-3 h-3" />
          <Check className="w-3 h-3 text-success" />
          <span>Saved</span>
        </>
      )}
    </div>
  );
};

export function NoteEditor() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ status: 'idle' });

  const simulateSave = useCallback(
    debounce(() => {
      setSaveStatus({ status: 'saving' });
      // Simulate saving to cloud
      setTimeout(() => {
        setSaveStatus({ status: 'saved', lastSaved: new Date() });
        // Reset to idle after showing saved
        setTimeout(() => {
          setSaveStatus({ status: 'idle' });
        }, 2000);
      }, 500);
    }, 1000),
    []
  );

  const onValueChange = useCallback(
    (value: string) => {
      setContent(value);
      simulateSave();
    },
    [simulateSave]
  );

  const editor = useEditor({
    content,
    extensions,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onValueChange(html);
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).editor = editor;
    }
  }, [editor]);

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-serif font-medium text-foreground">Untitled Note</h2>
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-6">
        <RichTextProvider editor={editor}>
          <div className="editor-wrapper overflow-hidden border border-border">
            <RichTextToolbar />
            <div className="bg-editor-bg min-h-[500px]">
              <EditorContent editor={editor} className="prose prose-neutral dark:prose-invert max-w-none" />
            </div>

            {/* Bubble Menus */}
            <RichTextBubbleText />
            <RichTextBubbleLink />
            <RichTextBubbleImage />
            <RichTextBubbleTable />

            {/* Slash Command */}
            <SlashCommandList />
          </div>
        </RichTextProvider>
      </div>
    </div>
  );
}

export default NoteEditor;
