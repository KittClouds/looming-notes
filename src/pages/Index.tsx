import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { NoteEditor } from '@/components/NoteEditor';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 overflow-hidden">
            <NoteEditor />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
