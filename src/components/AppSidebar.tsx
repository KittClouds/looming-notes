import * as React from "react"
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
  Settings
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Color palette for folders
const DEFAULT_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", 
  "#f59e0b", "#ef4444", "#14b8a6", "#6366f1"
]

// Types matching blink's structure
interface PageId {
  id: string
}

interface Page {
  id: PageId
  title: string
  favorite?: boolean
  color?: string
  parent?: PageId
  children?: Page[]
}

interface InklingProps {
  page: Page
  depth?: number
  parentColor?: string
  onNavigate: (pageId: string) => void
  onCreateChild: (parentId: PageId) => Promise<Page | null>
  onUpdate: (pageId: string, data: Partial<Page>) => Promise<void>
  onDelete: (pageId: PageId) => Promise<void>
  isActive: boolean
}

function Inkling({ 
  page, 
  depth = 0,
  parentColor,
  onNavigate,
  onCreateChild,
  onUpdate,
  onDelete,
  isActive,
}: InklingProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  
  const folderColor = page.color || parentColor || DEFAULT_COLORS[depth % DEFAULT_COLORS.length]
  const hasChildren = (page.children?.length || 0) > 0

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/inkling/${page.id.id}`
    navigator.clipboard.writeText(url)
  }

  const handleCreateChild = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const newPage = await onCreateChild(page.id)
    if (newPage) {
      setIsExpanded(true)
      onNavigate(newPage.id.id)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await onUpdate(page.id.id, { favorite: !page.favorite })
  }

  const handleChangeColor = async (e: React.MouseEvent, color: string) => {
    e.preventDefault()
    e.stopPropagation()
    await onUpdate(page.id.id, { color })
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await onDelete(page.id)
  }

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
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="group/collapsible w-full"
        >
          <div className="flex items-center gap-1 w-full">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 p-0 shrink-0",
                  !isHovered && !hasChildren && "invisible"
                )}
                disabled={!hasChildren}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>

            <SidebarMenuButton
              onClick={() => onNavigate(page.id.id)}
              isActive={isActive}
              className={cn(
                "flex-1 justify-start gap-2 h-8"
              )}
            >
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 shrink-0" style={{ color: folderColor }} />
              ) : (
                <Folder className="h-4 w-4 shrink-0" style={{ color: folderColor }} />
              )}
              <span className="truncate text-sm">
                {page.title || "New Inkling"}
              </span>
              {page.favorite && (
                <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400 ml-auto" />
              )}
            </SidebarMenuButton>

            {/* Action buttons - show on hover */}
            <div className={cn(
              "flex items-center shrink-0",
              !isHovered && "invisible"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={handleCreateChild}
              >
                <Plus className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Change Color</div>
                    <div className="flex flex-wrap gap-2">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={(e) => handleChangeColor(e, color)}
                          className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform cursor-pointer"
                          style={{
                            backgroundColor: color,
                            borderColor: color === folderColor ? '#000' : 'transparent',
                          }}
                          aria-label={`Change color to ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleToggleFavorite}>
                    {page.favorite ? (
                      <>
                        <StarOff className="mr-2 h-4 w-4" />
                        Remove from favorites
                      </>
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Save to favorites
                      </>
                    )}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy link to clipboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove inkling
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CollapsibleContent>
            <SidebarMenuSub className="ml-0 pl-0 border-l-0">
              {hasChildren ? (
                page.children!.map((child) => (
                  <Inkling
                    key={child.id.id}
                    page={child}
                    depth={depth + 1}
                    parentColor={folderColor}
                    onNavigate={onNavigate}
                    onCreateChild={onCreateChild}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    isActive={false}
                  />
                ))
              ) : (
                <div 
                  className="text-xs text-muted-foreground py-1 italic"
                  style={{ paddingLeft: `${(depth + 1) * 20 + 16}px` }}
                >
                  No pages here
                </div>
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </div>
  )
}

// Main sidebar component
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  pages?: {
    favorites: Page[]
    inklings: Page[]
  }
  currentPageId?: string
  onNavigate?: (pageId: string) => void
  onCreatePage?: (parent?: PageId) => Promise<Page | null>
  onUpdatePage?: (pageId: string, data: Partial<Page>) => Promise<void>
  onDeletePage?: (pageId: PageId) => Promise<void>
}

// Demo data with nested structure
const demoPages: { favorites: Page[], inklings: Page[] } = {
  favorites: [
    { 
      id: { id: 'fav-1' }, 
      title: 'Getting Started', 
      favorite: true, 
      color: '#3b82f6',
      children: []
    },
  ],
  inklings: [
    { 
      id: { id: 'ink-1' }, 
      title: 'Work', 
      color: '#10b981',
      children: []
    },
    { 
      id: { id: 'ink-2' }, 
      title: 'Personal', 
      color: '#8b5cf6',
      children: [
        {
          id: { id: 'ink-2-1' },
          title: 'Journal',
          color: '#8b5cf6',
          children: []
        }
      ]
    },
    { 
      id: { id: 'ink-3' }, 
      title: 'Ideas', 
      color: '#f59e0b',
      children: []
    },
  ]
}

export function AppSidebar({ 
  pages: initialPages,
  currentPageId,
  onNavigate = (id) => console.log('Navigate to:', id),
  onCreatePage,
  onUpdatePage,
  onDeletePage,
  ...props 
}: AppSidebarProps) {
  // State to manage pages internally for demo purposes
  const [pages, setPages] = React.useState(initialPages || demoPages)

  // Default handlers with state management
  const handleCreatePage = React.useCallback(async (parent?: PageId) => {
    const newId = `page-${Date.now()}`
    const newPage: Page = {
      id: { id: newId },
      title: '',
      color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
      parent: parent,
      children: []
    }

    if (parent) {
      // Add as child
      setPages(prev => {
        const addChildRecursive = (items: Page[]): Page[] => {
          return items.map(item => {
            if (item.id.id === parent.id) {
              return {
                ...item,
                children: [...(item.children || []), newPage]
              }
            }
            if (item.children) {
              return {
                ...item,
                children: addChildRecursive(item.children)
              }
            }
            return item
          })
        }

        return {
          favorites: addChildRecursive(prev.favorites),
          inklings: addChildRecursive(prev.inklings)
        }
      })
    } else {
      // Add as root inkling
      setPages(prev => ({
        ...prev,
        inklings: [...prev.inklings, newPage]
      }))
    }

    if (onCreatePage) {
      return await onCreatePage(parent)
    }
    return newPage
  }, [onCreatePage])

  const handleUpdatePage = React.useCallback(async (pageId: string, data: Partial<Page>) => {
    setPages(prev => {
      const updateRecursive = (items: Page[]): Page[] => {
        return items.map(item => {
          if (item.id.id === pageId) {
            const updated = { ...item, ...data }
            
            // Handle favorite toggle
            if (data.favorite !== undefined) {
              if (data.favorite && !prev.favorites.find(f => f.id.id === pageId)) {
                // Moving to favorites - remove from inklings
                return null as any // Will be filtered
              }
            }
            
            return updated
          }
          if (item.children) {
            return {
              ...item,
              children: updateRecursive(item.children)
            }
          }
          return item
        }).filter(Boolean)
      }

      const updatedInklings = updateRecursive(prev.inklings)
      const updatedFavorites = updateRecursive(prev.favorites)

      // If toggling favorite on, move to favorites
      if (data.favorite) {
        const findPage = (items: Page[]): Page | undefined => {
          for (const item of items) {
            if (item.id.id === pageId) return item
            if (item.children) {
              const found = findPage(item.children)
              if (found) return found
            }
          }
        }
        
        const page = findPage(updatedInklings) || findPage(prev.inklings)
        if (page && !updatedFavorites.find(f => f.id.id === pageId)) {
          return {
            favorites: [...updatedFavorites, { ...page, favorite: true }],
            inklings: updatedInklings
          }
        }
      }

      // If toggling favorite off, move to inklings
      if (data.favorite === false) {
        const page = updatedFavorites.find(f => f.id.id === pageId)
        if (page) {
          return {
            favorites: updatedFavorites.filter(f => f.id.id !== pageId),
            inklings: [...updatedInklings, { ...page, favorite: false }]
          }
        }
      }

      return {
        favorites: updatedFavorites,
        inklings: updatedInklings
      }
    })

    if (onUpdatePage) {
      await onUpdatePage(pageId, data)
    }
  }, [onUpdatePage])

  const handleDeletePage = React.useCallback(async (pageId: PageId) => {
    setPages(prev => {
      const deleteRecursive = (items: Page[]): Page[] => {
        return items.filter(item => {
          if (item.id.id === pageId.id) return false
          if (item.children) {
            item.children = deleteRecursive(item.children)
          }
          return true
        })
      }

      return {
        favorites: deleteRecursive(prev.favorites),
        inklings: deleteRecursive(prev.inklings)
      }
    })

    if (onDeletePage) {
      await onDeletePage(pageId)
    }
  }, [onDeletePage])

  return (
    <Sidebar className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-serif font-semibold text-lg text-sidebar-foreground">Inklings</span>
        </div>

        {/* Search */}
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
        {pages.favorites.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pages.favorites.map((page) => (
                  <Inkling
                    key={page.id.id}
                    page={page}
                    depth={0}
                    onNavigate={onNavigate}
                    onCreateChild={handleCreatePage}
                    onUpdate={handleUpdatePage}
                    onDelete={handleDeletePage}
                    isActive={currentPageId === page.id.id}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Inklings section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-1">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider p-0">
              Inklings
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={() => handleCreatePage()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.inklings.map((page) => (
                <Inkling
                  key={page.id.id}
                  page={page}
                  depth={0}
                  onNavigate={onNavigate}
                  onCreateChild={handleCreatePage}
                  onUpdate={handleUpdatePage}
                  onDelete={handleDeletePage}
                  isActive={currentPageId === page.id.id}
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
  )
}

export default AppSidebar
