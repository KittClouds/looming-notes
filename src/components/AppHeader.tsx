import { Menu, Share2, Users, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-accent" />
        
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Work</span>
          <span>/</span>
          <span className="text-foreground font-medium">Project Notes</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Collaborators */}
        <div className="hidden md:flex items-center -space-x-2 mr-2">
          <Avatar className="w-7 h-7 border-2 border-background">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar className="w-7 h-7 border-2 border-background">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" />
            <AvatarFallback>SK</AvatarFallback>
          </Avatar>
          <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs text-muted-foreground">+2</span>
          </div>
        </div>

        {/* Live indicator */}
        <Badge variant="secondary" className="gap-1.5 hidden sm:flex">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live
        </Badge>

        {/* Share button */}
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>

        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Users className="w-4 h-4 mr-2" />
              Invite collaborators
            </DropdownMenuItem>
            <DropdownMenuItem>
              Version history
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            <DropdownMenuItem>Export as Markdown</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <Avatar className="w-8 h-8 ml-1">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=me" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

export default AppHeader;
