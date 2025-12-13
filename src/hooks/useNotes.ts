import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import type { PrimitiveAtom } from 'jotai'
import {
  foldersAtom,
  globalNotesAtom,
  favoriteNotesAtom,
  currentNoteIdAtom,
  currentNoteAtom,
  Folder,
  Note,
  FolderId,
  NoteId,
  DEFAULT_COLORS
} from '@/store/notes'

export function useNotes() {
  const [folders, setFolders] = useAtom(foldersAtom)
  const [globalNotes, setGlobalNotes] = useAtom(globalNotesAtom)
  const [favoriteNotes, setFavoriteNotes] = useAtom(favoriteNotesAtom)
  const currentNoteId = useAtomValue(currentNoteIdAtom)
  const setCurrentNoteId = useSetAtom(currentNoteIdAtom as PrimitiveAtom<string | null>)
  const currentNote = useAtomValue(currentNoteAtom)

  // Create folder
  const createFolder = useCallback(async (parentId?: FolderId): Promise<Folder | null> => {
    const newId = `folder-${Date.now()}`
    const newFolder: Folder = {
      id: { id: newId },
      name: 'New Folder',
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      parent: parentId,
      subfolders: [],
      notes: []
    }

    if (parentId) {
      setFolders(prev => {
        const addSubfolderRecursive = (items: Folder[]): Folder[] => {
          return items.map(item => {
            if (item.id.id === parentId.id) {
              return {
                ...item,
                subfolders: [...(item.subfolders || []), newFolder]
              }
            }
            if (item.subfolders) {
              return {
                ...item,
                subfolders: addSubfolderRecursive(item.subfolders)
              }
            }
            return item
          })
        }
        return addSubfolderRecursive(prev)
      })
    } else {
      setFolders(prev => [...prev, newFolder])
    }

    return newFolder
  }, [setFolders])

  // Create note with empty JSON content
  const createNote = useCallback(async (folderId?: FolderId): Promise<Note | null> => {
    const newId = `note-${Date.now()}`
    const now = Date.now()
    const newNote: Note = {
      id: { id: newId },
      title: 'Untitled Note',
      folder: folderId,
      content: {
        type: 'doc',
        content: []
      },
      createdAt: now,
      updatedAt: now
    }

    if (folderId) {
      setFolders(prev => {
        const addNoteRecursive = (items: Folder[]): Folder[] => {
          return items.map(item => {
            if (item.id.id === folderId.id) {
              return {
                ...item,
                notes: [...(item.notes || []), newNote]
              }
            }
            if (item.subfolders) {
              return {
                ...item,
                subfolders: addNoteRecursive(item.subfolders)
              }
            }
            return item
          })
        }
        return addNoteRecursive(prev)
      })
    } else {
      setGlobalNotes(prev => [...prev, newNote])
    }

    return newNote
  }, [setFolders, setGlobalNotes])

  // Update folder
  const updateFolder = useCallback(async (folderId: string, data: Partial<Folder>) => {
    setFolders(prev => {
      const updateRecursive = (items: Folder[]): Folder[] => {
        return items.map(item => {
          if (item.id.id === folderId) {
            return { ...item, ...data }
          }
          if (item.subfolders) {
            return {
              ...item,
              subfolders: updateRecursive(item.subfolders)
            }
          }
          return item
        })
      }
      return updateRecursive(prev)
    })
  }, [setFolders])

  // Delete folder
  const deleteFolder = useCallback(async (folderId: FolderId) => {
    setFolders(prev => {
      const deleteRecursive = (items: Folder[]): Folder[] => {
        return items.filter(item => {
          if (item.id.id === folderId.id) return false
          if (item.subfolders) {
            item.subfolders = deleteRecursive(item.subfolders)
          }
          return true
        })
      }
      return deleteRecursive(prev)
    })
  }, [setFolders])

  // Update note
  const updateNote = useCallback(async (noteId: string, data: Partial<Note>) => {
    const updatedData = { ...data, updatedAt: Date.now() }

    // Update in folders
    setFolders(prev => {
      const updateRecursive = (items: Folder[]): Folder[] => {
        return items.map(item => ({
          ...item,
          notes: item.notes?.map(note => 
            note.id.id === noteId ? { ...note, ...updatedData } : note
          ),
          subfolders: item.subfolders ? updateRecursive(item.subfolders) : undefined
        }))
      }
      return updateRecursive(prev)
    })

    // Update in global notes
    setGlobalNotes(prev => 
      prev.map(note => note.id.id === noteId ? { ...note, ...updatedData } : note)
    )

    // Update in favorites
    setFavoriteNotes(prev => 
      prev.map(note => note.id.id === noteId ? { ...note, ...updatedData } : note)
    )

    // Handle favorite toggle
    if (data.favorite !== undefined) {
      if (data.favorite) {
        const findNote = (): Note | undefined => {
          const checkGlobal = globalNotes.find(n => n.id.id === noteId)
          if (checkGlobal) return checkGlobal
          
          const checkFolders = (items: Folder[]): Note | undefined => {
            for (const folder of items) {
              const found = folder.notes?.find(n => n.id.id === noteId)
              if (found) return found
              if (folder.subfolders) {
                const subFound = checkFolders(folder.subfolders)
                if (subFound) return subFound
              }
            }
          }
          return checkFolders(folders)
        }
        
        const note = findNote()
        if (note) {
          setFavoriteNotes(prev => {
            if (prev.find(f => f.id.id === noteId)) return prev
            return [...prev, { ...note, favorite: true }]
          })
        }
      } else {
        setFavoriteNotes(prev => prev.filter(n => n.id.id !== noteId))
      }
    }
  }, [setFolders, setGlobalNotes, setFavoriteNotes, folders, globalNotes])

  // Delete note
  const deleteNote = useCallback(async (noteId: NoteId) => {
    // Delete from folders
    setFolders(prev => {
      const deleteRecursive = (items: Folder[]): Folder[] => {
        return items.map(item => ({
          ...item,
          notes: item.notes?.filter(note => note.id.id !== noteId.id),
          subfolders: item.subfolders ? deleteRecursive(item.subfolders) : undefined
        }))
      }
      return deleteRecursive(prev)
    })

    // Delete from global notes
    setGlobalNotes(prev => prev.filter(note => note.id.id !== noteId.id))
    
    // Delete from favorites
    setFavoriteNotes(prev => prev.filter(note => note.id.id !== noteId.id))

    // Clear current note if it's the deleted one
    if (currentNoteId === noteId.id) {
      setCurrentNoteId(null)
    }
  }, [setFolders, setGlobalNotes, setFavoriteNotes, currentNoteId, setCurrentNoteId])

  // Navigate to note
  const navigateToNote = useCallback((noteId: string) => {
    setCurrentNoteId(noteId)
  }, [setCurrentNoteId])

  return {
    // State
    folders,
    globalNotes,
    favoriteNotes,
    currentNote,
    currentNoteId,
    
    // Actions
    createFolder,
    createNote,
    updateFolder,
    deleteFolder,
    updateNote,
    deleteNote,
    navigateToNote,
  }
}
