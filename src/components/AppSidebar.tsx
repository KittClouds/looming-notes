import * as React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  MoreVertical,
  Star,
  StarOff,
  Link as LinkIcon,
  X,
  FileText,
  Search,
  Settings,
  FolderPlus,
} from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Color palette for folders
const DEFAULT_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444", "#14b8a6", "#6366f1"];

// Core data types
interface FolderId {
  id: string;
}

interface NoteId {
  id: string;
}

interface Folder {
  id: FolderId;
  name: string;
  color?: string;
  parent?: FolderId;
  subfolders?: Folder[];
  notes?: Note[];
}

interface Note {
  id: NoteId;
  title: string;
  favorite?: boolean;
  folder?: FolderId;
  content?: string;
}

// Props for folder component
interface FolderItemProps {
  folder: Folder;
  depth?: number;
  parentColor?: string;
  onNavigateToNote: (noteId: string) => void;
  onCreateFolder: (parentId: FolderId) => Promise<Folder | null>;
  onCreateNote: (folderId?: FolderId) => Promise<Note | null>;
  onUpdateFolder: (folderId: string, data: Partial<Folder>) => Promise<void>;
  onDeleteFolder: (folderId: FolderId) => Promise<void>;
  onUpdateNote: (noteId: string, data: Partial<Note>) => Promise<void>;
  onDeleteNote: (noteId: NoteId) => Promise<void>;
  currentNoteId?: string;
}

function FolderItem({
  folder,
  depth = 0,
  parentColor,
  onNavigateToNote,
  onCreateFolder,
  onCreateNote,
  onUpdateFolder,
  onDeleteFolder,
  onUpdateNote,
  onDeleteNote,
  currentNoteId,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const folderColor = folder.color || parentColor || DEFAULT_COLORS[depth % DEFAULT_COLORS.length];
  const hasContent = (folder.subfolders?.length || 0) > 0 || (folder.notes?.length || 0) > 0;

  const handleCreateSubfolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newFolder = await onCreateFolder(folder.id);
    if (newFolder) {
      setIsExpanded(true);
    }
  };

  const handleCreateNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newNote = await onCreateNote(folder.id);
    if (newNote) {
      setIsExpanded(true);
      onNavigateToNote(newNote.id.id);
    }
  };

  const handleChangeColor = async (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    await onUpdateFolder(folder.id.id, { color });
  };

  const handleDeleteFolder = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onDeleteFolder(folder.id);
  };

  return (
    <div className="relative w-full">
      {/* Tree lines */}
      {depth > 0 && (
        <>
          <div
            className="absolute top-0 bottom-0 w-[2px] opacity-40 pointer-events-none"
            style={{
              left: `${(depth - 1) * 20 + 10}px`,
              borderLeft: `2px solid ${folderColor}`,
            }}
          />
          <div
            className="absolute top-[18px] w-3 h-[2px] opacity-40 pointer-events-none"
            style={{
              left: `${(depth - 1) * 20 + 10}px`,
              backgroundColor: folderColor,
            }}
          />
        </>
      )}

      <SidebarMenuItem
        className="relative z-10"
        style={{ paddingLeft: `${depth * 20}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="group/collapsible w-full">
          <div className="flex items-center gap-1 w-full">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6 p-0 shrink-0", !hasContent && "invisible")}
                disabled={!hasContent}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>

            <div className="flex-1 flex items-center gap-2">
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 shrink-0" style={{ color: folderColor }} />
              ) : (
                <Folder className="h-4 w-4 shrink-0" style={{ color: folderColor }} />
              )}
              <span className="truncate text-sm font-medium">{folder.name || "New Folder"}</span>
            </div>

            {/* Action buttons - show on hover */}
            <div className={cn("flex items-center shrink-0 gap-1", !isHovered && "invisible")}>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleCreateNote} title="Add note">
                <Plus className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleCreateSubfolder}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New subfolder
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleCreateNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    New note
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Folder Color</div>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={(e) => handleChangeColor(e, color)}
                          className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform cursor-pointer"
                          style={{
                            backgroundColor: color,
                            borderColor: color === folderColor ? "#000" : "transparent",
                          }}
                          aria-label={`Change color to ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleDeleteFolder} className="text-destructive focus:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Delete folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CollapsibleContent>
            <SidebarMenuSub className="ml-0 pl-0 border-l-0">
              {/* Render subfolders */}
              {folder.subfolders?.map((subfolder) => (
                <FolderItem
                  key={subfolder.id.id}
                  folder={subfolder}
                  depth={depth + 1}
                  parentColor={folderColor}
                  onNavigateToNote={onNavigateToNote}
                  onCreateFolder={onCreateFolder}
                  onCreateNote={onCreateNote}
                  onUpdateFolder={onUpdateFolder}
                  onDeleteFolder={onDeleteFolder}
                  onUpdateNote={onUpdateNote}
                  onDeleteNote={onDeleteNote}
                  currentNoteId={currentNoteId}
                />
              ))}

              {/* Render notes in this folder */}
              {folder.notes?.map((note) => (
                <NoteItem
                  key={note.id.id}
                  note={note}
                  depth={depth + 1}
                  folderColor={folderColor}
                  onNavigate={onNavigateToNote}
                  onUpdate={onUpdateNote}
                  onDelete={onDeleteNote}
                  isActive={currentNoteId === note.id.id}
                />
              ))}

              {!hasContent && (
                <div
                  className="text-xs text-muted-foreground py-1 italic"
                  style={{ paddingLeft: `${(depth + 1) * 20 + 16}px` }}
                >
                  Empty folder
                </div>
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </div>
  );
}

// Props for note component
interface NoteItemProps {
  note: Note;
  depth: number;
  folderColor?: string;
  onNavigate: (noteId: string) => void;
  onUpdate: (noteId: string, data: Partial<Note>) => Promise<void>;
  onDelete: (noteId: NoteId) => Promise<void>;
  isActive: boolean;
}

function NoteItem({ note, depth, folderColor, onNavigate, onUpdate, onDelete, isActive }: NoteItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/note/${note.id.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onUpdate(note.id.id, { favorite: !note.favorite });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onDelete(note.id);
  };

  return (
    <div className="relative w-full">
      {/* Tree line connector for notes */}
      {depth > 0 && folderColor && (
        <>
          <div
            className="absolute top-0 bottom-0 w-[2px] opacity-40 pointer-events-none"
            style={{
              left: `${(depth - 1) * 20 + 10}px`,
              borderLeft: `2px solid ${folderColor}`,
            }}
          />
          <div
            className="absolute top-[18px] w-3 h-[2px] opacity-40 pointer-events-none"
            style={{
              left: `${(depth - 1) * 20 + 10}px`,
              backgroundColor: folderColor,
            }}
          />
        </>
      )}

      <SidebarMenuItem
        className="relative z-10"
        style={{ paddingLeft: `${depth * 20}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-1 w-full">
          <div className="h-6 w-6" /> {/* Spacer for alignment */}
          <SidebarMenuButton
            onClick={() => onNavigate(note.id.id)}
            isActive={isActive}
            className={cn("flex-1 justify-start gap-2 h-8")}
          >
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm">{note.title || "Untitled Note"}</span>
            {note.favorite && <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400 ml-auto" />}
          </SidebarMenuButton>
          {/* Action buttons - show on hover */}
          <div className={cn("flex items-center shrink-0", !isHovered && "invisible")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleToggleFavorite}>
                  {note.favorite ? (
                    <>
                      <StarOff className="mr-2 h-4 w-4" />
                      Remove from favorites
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Add to favorites
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleCopyLink}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copy link
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <X className="mr-2 h-4 w-4" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarMenuItem>
    </div>
  );
}

// Main sidebar component
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  folders?: Folder[];
  globalNotes?: Note[];
  favoriteNotes?: Note[];
  currentNoteId?: string;
  onNavigateToNote?: (noteId: string) => void;
  onCreateFolder?: (parentId?: FolderId) => Promise<Folder | null>;
  onCreateNote?: (folderId?: FolderId) => Promise<Note | null>;
  onUpdateFolder?: (folderId: string, data: Partial<Folder>) => Promise<void>;
  onDeleteFolder?: (folderId: FolderId) => Promise<void>;
  onUpdateNote?: (noteId: string, data: Partial<Note>) => Promise<void>;
  onDeleteNote?: (noteId: NoteId) => Promise<void>;
}

// Demo data with proper structure
const demoData = {
  folders: [
    {
      id: { id: "folder-1" },
      name: "Work",
      color: "#10b981",
      subfolders: [
        {
          id: { id: "folder-1-1" },
          name: "Projects",
          color: "#10b981",
          notes: [{ id: { id: "note-1-1-1" }, title: "Project Alpha", folder: { id: "folder-1-1" } }],
        },
      ],
      notes: [
        { id: { id: "note-1-1" }, title: "Meeting Notes", folder: { id: "folder-1" } },
        { id: { id: "note-1-2" }, title: "Tasks", folder: { id: "folder-1" } },
      ],
    },
    {
      id: { id: "folder-2" },
      name: "Personal",
      color: "#8b5cf6",
      notes: [{ id: { id: "note-2-1" }, title: "Journal Entry", folder: { id: "folder-2" } }],
    },
    {
      id: { id: "folder-3" },
      name: "Ideas",
      color: "#f59e0b",
      subfolders: [],
      notes: [],
    },
  ],
  globalNotes: [
    { id: { id: "global-1" }, title: "Quick Thoughts", favorite: false },
    { id: { id: "global-2" }, title: "Scratch Pad", favorite: false },
  ],
  favoriteNotes: [{ id: { id: "fav-1" }, title: "Important Reference", favorite: true }],
};

export function AppSidebar({
  folders: initialFolders,
  globalNotes: initialGlobalNotes,
  favoriteNotes: initialFavoriteNotes,
  currentNoteId,
  onNavigateToNote = (id) => console.log("Navigate to note:", id),
  onCreateFolder,
  onCreateNote,
  onUpdateFolder,
  onDeleteFolder,
  onUpdateNote,
  onDeleteNote,
  ...props
}: AppSidebarProps) {
  const [folders, setFolders] = React.useState(initialFolders || demoData.folders);
  const [globalNotes, setGlobalNotes] = React.useState(initialGlobalNotes || demoData.globalNotes);
  const [favoriteNotes, setFavoriteNotes] = React.useState(initialFavoriteNotes || demoData.favoriteNotes);

  // Create folder handler
  const handleCreateFolder = React.useCallback(
    async (parentId?: FolderId) => {
      const newId = `folder-${Date.now()}`;
      const newFolder: Folder = {
        id: { id: newId },
        name: "",
        color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
        parent: parentId,
        subfolders: [],
        notes: [],
      };

      if (parentId) {
        setFolders((prev) => {
          const addSubfolderRecursive = (items: Folder[]): Folder[] => {
            return items.map((item) => {
              if (item.id.id === parentId.id) {
                return {
                  ...item,
                  subfolders: [...(item.subfolders || []), newFolder],
                };
              }
              if (item.subfolders) {
                return {
                  ...item,
                  subfolders: addSubfolderRecursive(item.subfolders),
                };
              }
              return item;
            });
          };
          return addSubfolderRecursive(prev);
        });
      } else {
        setFolders((prev) => [...prev, newFolder]);
      }

      if (onCreateFolder) return await onCreateFolder(parentId);
      return newFolder;
    },
    [onCreateFolder],
  );

  // Create note handler
  const handleCreateNote = React.useCallback(
    async (folderId?: FolderId) => {
      const newId = `note-${Date.now()}`;
      const newNote: Note = {
        id: { id: newId },
        title: "",
        folder: folderId,
        content: "",
      };

      if (folderId) {
        setFolders((prev) => {
          const addNoteRecursive = (items: Folder[]): Folder[] => {
            return items.map((item) => {
              if (item.id.id === folderId.id) {
                return {
                  ...item,
                  notes: [...(item.notes || []), newNote],
                };
              }
              if (item.subfolders) {
                return {
                  ...item,
                  subfolders: addNoteRecursive(item.subfolders),
                };
              }
              return item;
            });
          };
          return addNoteRecursive(prev);
        });
      } else {
        setGlobalNotes((prev) => [...prev, newNote]);
      }

      if (onCreateNote) return await onCreateNote(folderId);
      return newNote;
    },
    [onCreateNote],
  );

  // Update folder handler
  const handleUpdateFolder = React.useCallback(
    async (folderId: string, data: Partial<Folder>) => {
      setFolders((prev) => {
        const updateRecursive = (items: Folder[]): Folder[] => {
          return items.map((item) => {
            if (item.id.id === folderId) {
              return { ...item, ...data };
            }
            if (item.subfolders) {
              return {
                ...item,
                subfolders: updateRecursive(item.subfolders),
              };
            }
            return item;
          });
        };
        return updateRecursive(prev);
      });

      if (onUpdateFolder) await onUpdateFolder(folderId, data);
    },
    [onUpdateFolder],
  );

  // Delete folder handler
  const handleDeleteFolder = React.useCallback(
    async (folderId: FolderId) => {
      setFolders((prev) => {
        const deleteRecursive = (items: Folder[]): Folder[] => {
          return items.filter((item) => {
            if (item.id.id === folderId.id) return false;
            if (item.subfolders) {
              item.subfolders = deleteRecursive(item.subfolders);
            }
            return true;
          });
        };
        return deleteRecursive(prev);
      });

      if (onDeleteFolder) await onDeleteFolder(folderId);
    },
    [onDeleteFolder],
  );

  // Update note handler
  const handleUpdateNote = React.useCallback(
    async (noteId: string, data: Partial<Note>) => {
      // Update in folders
      setFolders((prev) => {
        const updateRecursive = (items: Folder[]): Folder[] => {
          return items.map((item) => {
            if (item.notes) {
              item.notes = item.notes.map((note) => (note.id.id === noteId ? { ...note, ...data } : note));
            }
            if (item.subfolders) {
              item.subfolders = updateRecursive(item.subfolders);
            }
            return item;
          });
        };
        return updateRecursive(prev);
      });

      // Update in global notes
      setGlobalNotes((prev) => prev.map((note) => (note.id.id === noteId ? { ...note, ...data } : note)));

      // Handle favorites
      if (data.favorite !== undefined) {
        if (data.favorite) {
          // Find note and add to favorites
          const findNote = (): Note | undefined => {
            const checkGlobal = globalNotes.find((n) => n.id.id === noteId);
            if (checkGlobal) return checkGlobal;

            const checkFolders = (items: Folder[]): Note | undefined => {
              for (const folder of items) {
                const found = folder.notes?.find((n) => n.id.id === noteId);
                if (found) return found;
                if (folder.subfolders) {
                  const subFound = checkFolders(folder.subfolders);
                  if (subFound) return subFound;
                }
              }
            };
            return checkFolders(folders);
          };

          const note = findNote();
          if (note && !favoriteNotes.find((f) => f.id.id === noteId)) {
            setFavoriteNotes((prev) => [...prev, { ...note, favorite: true }]);
          }
        } else {
          setFavoriteNotes((prev) => prev.filter((n) => n.id.id !== noteId));
        }
      }

      if (onUpdateNote) await onUpdateNote(noteId, data);
    },
    [onUpdateNote, globalNotes, folders, favoriteNotes],
  );

  // Delete note handler
  const handleDeleteNote = React.useCallback(
    async (noteId: NoteId) => {
      // Delete from folders
      setFolders((prev) => {
        const deleteRecursive = (items: Folder[]): Folder[] => {
          return items.map((item) => {
            if (item.notes) {
              item.notes = item.notes.filter((note) => note.id.id !== noteId.id);
            }
            if (item.subfolders) {
              item.subfolders = deleteRecursive(item.subfolders);
            }
            return item;
          });
        };
        return deleteRecursive(prev);
      });

      // Delete from global notes
      setGlobalNotes((prev) => prev.filter((note) => note.id.id !== noteId.id));

      // Delete from favorites
      setFavoriteNotes((prev) => prev.filter((note) => note.id.id !== noteId.id));

      if (onDeleteNote) await onDeleteNote(noteId);
    },
    [onDeleteNote],
  );

  return (
    <Sidebar className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-serif font-semibold text-lg text-sidebar-foreground">Inklings</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-9 bg-sidebar-accent border-0 focus-visible:ring-1 focus-visible:ring-sidebar-ring"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2">
        {/* Favorites section */}
        {favoriteNotes.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {favoriteNotes.map((note) => (
                  <NoteItem
                    key={note.id.id}
                    note={note}
                    depth={0}
                    onNavigate={onNavigateToNote}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                    isActive={currentNoteId === note.id.id}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Global Notes section */}
        {globalNotes.length > 0 && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2 mb-1">
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider p-0">
                Quick Notes
              </SidebarGroupLabel>
              <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => handleCreateNote()}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {globalNotes.map((note) => (
                  <NoteItem
                    key={note.id.id}
                    note={note}
                    depth={0}
                    onNavigate={onNavigateToNote}
                    onUpdate={handleUpdateNote}
                    onDelete={handleDeleteNote}
                    isActive={currentNoteId === note.id.id}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Folders section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-1">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider p-0">
              Folders
            </SidebarGroupLabel>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => handleCreateFolder()}>
              <FolderPlus className="h-3 w-3" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <FolderItem
                  key={folder.id.id}
                  folder={folder}
                  depth={0}
                  onNavigateToNote={onNavigateToNote}
                  onCreateFolder={handleCreateFolder}
                  onCreateNote={handleCreateNote}
                  onUpdateFolder={handleUpdateFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  currentNoteId={currentNoteId}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-sidebar-accent transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
