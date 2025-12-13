import { 
  FileText, 
  Search, 
  Settings, 
  Plus, 
  Star, 
  Clock, 
  Trash2,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const quickAccessItems = [
  { title: 'All Notes', icon: FileText, count: 12 },
  { title: 'Favorites', icon: Star, count: 3 },
  { title: 'Recent', icon: Clock, count: 5 },
  { title: 'Trash', icon: Trash2, count: 1 },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-serif font-semibold text-lg text-sidebar-foreground">Notes</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..." 
            className="pl-9 bg-sidebar-accent border-0 focus-visible:ring-1 focus-visible:ring-sidebar-ring"
          />
        </div>

        {/* New Note Button */}
        <Button className="w-full mt-3 gap-2" size="sm">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4">
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className="justify-between hover:bg-sidebar-accent transition-colors"
                    isActive={item.title === 'All Notes'}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {item.count}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Folders - Placeholder */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 flex items-center justify-between">
            <span>Folders</span>
            <Button variant="ghost" size="icon" className="w-5 h-5">
              <Plus className="w-3 h-3" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground hover:bg-sidebar-accent transition-colors">
                  <FolderOpen className="w-4 h-4" />
                  <span>Work</span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground hover:bg-sidebar-accent transition-colors">
                  <FolderOpen className="w-4 h-4" />
                  <span>Personal</span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground hover:bg-sidebar-accent transition-colors">
                  <FolderOpen className="w-4 h-4" />
                  <span>Ideas</span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
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
