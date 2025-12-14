import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { JSONContent } from '@tiptap/react'
import { DocumentConnections } from '@/lib/entities/entityTypes'

// Types
export interface FolderId {
  id: string
}

export interface NoteId {
  id: string
}

export interface Folder {
  id: FolderId
  name: string
  color?: string
  parent?: FolderId
  subfolders?: Folder[]
  notes?: Note[]
}

export interface Note {
  id: NoteId
  title: string
  content: JSONContent
  connections?: DocumentConnections
  favorite?: boolean
  folder?: FolderId
  createdAt: number
  updatedAt: number
}

export interface AppState {
  folders: Folder[]
  globalNotes: Note[]
  favoriteNotes: Note[]
}

// Default colors for folders
export const DEFAULT_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", 
  "#f59e0b", "#ef4444", "#14b8a6", "#6366f1"
]

// Demo data with JSON content
const initialData: AppState = {
  folders: [
    { 
      id: { id: 'folder-1' }, 
      name: 'Work', 
      color: '#10b981',
      subfolders: [
        {
          id: { id: 'folder-1-1' },
          name: 'Projects',
          color: '#10b981',
          notes: [
            { 
              id: { id: 'note-1-1-1' }, 
              title: 'Project Alpha', 
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'Project Alpha' }]
                  },
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Details here...' }]
                  }
                ]
              },
              folder: { id: 'folder-1-1' },
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          ]
        }
      ],
      notes: [
        { 
          id: { id: 'note-1-1' }, 
          title: 'Meeting Notes', 
          content: {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Meeting Notes' }]
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Important discussion points...' }]
              }
            ]
          },
          folder: { id: 'folder-1' },
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        { 
          id: { id: 'note-1-2' }, 
          title: 'Tasks', 
          content: {
            type: 'doc',
            content: [
              {
                type: 'bulletList',
                content: [
                  {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 1' }] }]
                  },
                  {
                    type: 'listItem',
                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task 2' }] }]
                  }
                ]
              }
            ]
          },
          folder: { id: 'folder-1' },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    },
    { 
      id: { id: 'folder-2' }, 
      name: 'Personal', 
      color: '#8b5cf6',
      notes: [
        { 
          id: { id: 'note-2-1' }, 
          title: 'Journal Entry',
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Today was a good day...' }]
              }
            ]
          },
          folder: { id: 'folder-2' },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ]
    },
    { 
      id: { id: 'folder-3' }, 
      name: 'Ideas', 
      color: '#f59e0b',
      subfolders: [],
      notes: []
    },
  ],
  globalNotes: [
    { 
      id: { id: 'global-1' }, 
      title: 'Quick Thoughts', 
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Random ideas...' }]
          }
        ]
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    { 
      id: { id: 'global-2' }, 
      title: 'Scratch Pad',
      content: {
        type: 'doc',
        content: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  favoriteNotes: [
    { 
      id: { id: 'fav-1' }, 
      title: 'Important Reference', 
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Reference Material' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Critical info here...' }]
          }
        ]
      },
      favorite: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]
}

// Atoms with localStorage persistence
export const foldersAtom = atomWithStorage<Folder[]>('folders', initialData.folders)
export const globalNotesAtom = atomWithStorage<Note[]>('globalNotes', initialData.globalNotes)
export const favoriteNotesAtom = atomWithStorage<Note[]>('favoriteNotes', initialData.favoriteNotes)

// Current note ID atom
export const currentNoteIdAtom = atom<string | null>(null)

// Derived atom to get current note
export const currentNoteAtom = atom((get) => {
  const noteId = get(currentNoteIdAtom)
  if (!noteId) return null

  const globalNotes = get(globalNotesAtom)
  const favoriteNotes = get(favoriteNotesAtom)
  const folders = get(foldersAtom)

  // Check global notes
  const globalNote = globalNotes.find(n => n.id.id === noteId)
  if (globalNote) return globalNote

  // Check favorite notes
  const favNote = favoriteNotes.find(n => n.id.id === noteId)
  if (favNote) return favNote

  // Check folders recursively
  const findNoteInFolders = (folders: Folder[]): Note | undefined => {
    for (const folder of folders) {
      const note = folder.notes?.find(n => n.id.id === noteId)
      if (note) return note
      if (folder.subfolders) {
        const subNote = findNoteInFolders(folder.subfolders)
        if (subNote) return subNote
      }
    }
  }

  return findNoteInFolders(folders) || null
})

// Helper to find all notes (for search, etc.)
export const allNotesAtom = atom((get) => {
  const globalNotes = get(globalNotesAtom)
  const folders = get(foldersAtom)
  
  const notes: Note[] = [...globalNotes]
  
  const extractNotes = (folders: Folder[]) => {
    folders.forEach(folder => {
      if (folder.notes) notes.push(...folder.notes)
      if (folder.subfolders) extractNotes(folder.subfolders)
    })
  }
  
  extractNotes(folders)
  return notes
})
