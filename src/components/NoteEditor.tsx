import { useCallback, useEffect, useState } from 'react';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { EditorContent, useEditor, JSONContent } from '@tiptap/react';
import { Note } from '@/store/notes';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { parseNoteConnectionsFromDocument } from '@/lib/entities/documentParser';

// Base Kit
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';

import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import 'katex/dist/katex.min.css';
import 'easydrawer/styles.css';
import '@excalidraw/excalidraw/index.css';

// Custom Extensions for entity highlighting
import { EntityMark } from '@/lib/extensions/EntityMark';
import { TagMark } from '@/lib/extensions/TagMark';
import { MentionMark } from '@/lib/extensions/MentionMark';

// Extensions
import { Attachment, RichTextAttachment } from 'reactjs-tiptap-editor/attachment';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import { Column, ColumnNode, MultipleColumnNode, RichTextColumn } from 'reactjs-tiptap-editor/column';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { ExportPdf, RichTextExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord, RichTextExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily, RichTextFontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
import { History, RichTextRedo, RichTextUndo } from 'reactjs-tiptap-editor/history';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Iframe, RichTextIframe } from 'reactjs-tiptap-editor/iframe';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { ImageGif, RichTextImageGif } from 'reactjs-tiptap-editor/imagegif';
import { ImportWord, RichTextImportWord } from 'reactjs-tiptap-editor/importword';
import { Indent, RichTextIndent } from 'reactjs-tiptap-editor/indent';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { LineHeight, RichTextLineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { MoreMark, RichTextMoreMark } from 'reactjs-tiptap-editor/moremark';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { RichTextSearchAndReplace, SearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { RichTextStrike, Strike } from 'reactjs-tiptap-editor/strike';
import { RichTextTable, Table } from 'reactjs-tiptap-editor/table';
import { RichTextTaskList, TaskList } from 'reactjs-tiptap-editor/tasklist';
import { RichTextAlign, TextAlign } from 'reactjs-tiptap-editor/textalign';
import { RichTextTextDirection, TextDirection } from 'reactjs-tiptap-editor/textdirection';
import { RichTextUnderline, TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { RichTextVideo, Video } from 'reactjs-tiptap-editor/video';
import { Katex, RichTextKatex } from 'reactjs-tiptap-editor/katex';
import { Drawer, RichTextDrawer } from 'reactjs-tiptap-editor/drawer';
import { Excalidraw, RichTextExcalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { Twitter, RichTextTwitter } from 'reactjs-tiptap-editor/twitter';
import { Mermaid, RichTextMermaid } from 'reactjs-tiptap-editor/mermaid';
import { CodeView, RichTextCodeView } from 'reactjs-tiptap-editor/codeview';
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';

// Bubble
import {
  RichTextBubbleColumns,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleImage,
  RichTextBubbleImageGif,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleVideo,
  RichTextBubbleMenuDragHandle
} from 'reactjs-tiptap-editor/bubble';

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Custom document to support columns
const DocumentColumn = Document.extend({
  content: '(block|columns)+',
});

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor,
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
  Placeholder.configure({
    placeholder: "Start writing your note...",
  }),
];

const extensions = [
  ...BaseKit,
  History,
  EntityMark,
  TagMark,
  MentionMark,
  SearchAndReplace,
  Clear,
  FontFamily,
  Heading,
  FontSize,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Emoji,
  Color,
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Indent,
  LineHeight,
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
  Video.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files));
        }, 300);
      });
    },
  }),
  ImageGif,
  Blockquote,
  HorizontalRule,
  Code,
  CodeBlock,
  Column,
  ColumnNode,
  MultipleColumnNode,
  Table,
  Iframe,
  ExportPdf,
  ImportWord,
  ExportWord,
  TextDirection,
  Mention,
  Attachment.configure({
    upload: (file: any) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Katex,
  Excalidraw,
  Mermaid.configure({
    upload: (file: any) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Drawer.configure({
    upload: (file: any) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Twitter,
  CodeView,
  SlashCommand,
];

const RichTextToolbar = () => {
  return (
    <div className="flex items-center p-1 gap-1 flex-wrap border-b border-border bg-muted/50">
      {/* Row 1 */}
      <div className="flex items-center gap-0.5">
        <RichTextUndo />
        <RichTextRedo />
        <RichTextSearchAndReplace />
        <RichTextClear />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextFontFamily />
        <RichTextHeading />
        <RichTextFontSize />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextBold />
        <RichTextItalic />
        <RichTextUnderline />
        <RichTextStrike />
        <RichTextMoreMark />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextEmoji />
        <RichTextColor />
        <RichTextHighlight />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextBulletList />
        <RichTextOrderedList />
        <RichTextTaskList />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextAlign />
        <RichTextIndent />
        <RichTextLineHeight />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextLink />
        <RichTextImage />
        <RichTextVideo />
        <RichTextImageGif />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextBlockquote />
        <RichTextHorizontalRule />
        <RichTextCode />
        <RichTextCodeBlock />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextColumn />
        <RichTextTable />
        <RichTextIframe />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextExportPdf />
        <RichTextImportWord />
        <RichTextExportWord />
      </div>
      <div className="w-px h-6 bg-border" />
      <div className="flex items-center gap-0.5">
        <RichTextTextDirection />
        <RichTextAttachment />
        <RichTextKatex />
        <RichTextExcalidraw />
        <RichTextMermaid />
        <RichTextDrawer />
        <RichTextTwitter />
        <RichTextCodeView />
      </div>
    </div>
  );
};

interface NoteEditorProps {
  note: Note | null
  onUpdateNote: (noteId: string, data: Partial<Note>) => Promise<void>
}

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Debounced save for content with entity extraction
  const debouncedSaveContent = useDebouncedCallback((content: JSONContent) => {
    if (note) {
      setIsSyncing(true)
      const connections = parseNoteConnectionsFromDocument(content)
      console.log('Extracted entities:', connections)
      onUpdateNote(note.id.id, { content, connections }).finally(() => {
        setIsSyncing(false)
      })
    }
  }, 500)

  // Debounced save for title
  const debouncedSaveTitle = useDebouncedCallback((newTitle: string) => {
    if (note) {
      onUpdateNote(note.id.id, { title: newTitle })
    }
  }, 500)

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: note?.content || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      debouncedSaveContent(json)
    },
  })

  // Update editor content when note changes
  useEffect(() => {
    if (note && editor && !editor.isDestroyed) {
      const currentContent = editor.getJSON()
      const newContent = note.content || { type: 'doc', content: [] }
      
      // Only update if content is actually different
      if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
        editor.commands.setContent(newContent)
      }
      
      setTitle(note.title || '')
    } else if (!note && editor) {
      editor.commands.setContent({ type: 'doc', content: [] })
      setTitle('')
    }
  }, [note?.id.id, editor])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    debouncedSaveTitle(newTitle)
  }, [debouncedSaveTitle])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).editor = editor;
    }
  }, [editor]);

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No note selected</p>
          <p className="text-sm">Create or select a note to start writing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-3xl font-bold w-full bg-transparent border-none outline-none placeholder:text-muted-foreground"
          />
          {isSyncing && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
        </div>
      </div>
      
      <RichTextProvider editor={editor}>
        <div className="flex flex-col flex-1 overflow-hidden border-x border-b border-border rounded-b-lg relative">
          <RichTextToolbar />
          <div className="flex-1 overflow-auto bg-background relative">
            <EditorContent editor={editor} className="min-h-[500px] p-4" />
          </div>

          {/* Bubble Menus */}
          <RichTextBubbleMenuDragHandle />
          <RichTextBubbleText />
          <RichTextBubbleLink />
          <RichTextBubbleImage />
          <RichTextBubbleVideo />
          <RichTextBubbleImageGif />
          <RichTextBubbleTable />
          <RichTextBubbleColumns />
          <RichTextBubbleDrawer />
          <RichTextBubbleExcalidraw />
          <RichTextBubbleIframe />
          <RichTextBubbleKatex />
          <RichTextBubbleMermaid />
          <RichTextBubbleTwitter />

          {/* Slash Command */}
          <SlashCommandList />
        </div>
      </RichTextProvider>
    </div>
  );
}

export default NoteEditor;
