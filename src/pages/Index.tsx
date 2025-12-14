import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { NoteEditor } from '@/components/NoteEditor';
import { useNotes } from '@/hooks/useNotes';

const Index = () => {
  const {
    folders,
    globalNotes,
    favoriteNotes,
    currentNote,
    currentNoteId,
    createFolder,
    createNote,
    updateFolder,
    deleteFolder,
    updateNote,
    deleteNote,
    navigateToNote,
  } = useNotes();

  return (
    <SidebarProvider>
      <div className="min-h-screen h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar 
          folders={folders}
          globalNotes={globalNotes}
          favoriteNotes={favoriteNotes}
          currentNoteId={currentNoteId ?? undefined}
          onNavigateToNote={navigateToNote}
          onCreateFolder={createFolder}
          onCreateNote={createNote}
          onUpdateFolder={updateFolder}
          onDeleteFolder={deleteFolder}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
        />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <AppHeader />
          <main className="flex-1 min-h-0 overflow-hidden">
            <NoteEditor note={currentNote} onUpdateNote={updateNote} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
