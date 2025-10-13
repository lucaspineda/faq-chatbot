"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusIcon, LogOutIcon, SettingsIcon } from "lucide-react"

export function ChatAside() {
  const { data: session } = useSession()
  
  // Mock data - replace with real data later
  const user = session?.user || {
    name: "Guest",
    lastName: "",
    email: "guest@example.com",
  }

  const chatSessions = [
    { id: "1", title: "How to reset password?", createdAt: "2024-10-10" },
    { id: "2", title: "Account verification help", createdAt: "2024-10-09" },
    { id: "3", title: "Payment processing question", createdAt: "2024-10-08" },
    { id: "4", title: "Security best practices", createdAt: "2024-10-07" },
    { id: "5", title: "Transfer limits inquiry", createdAt: "2024-10-06" },
  ]

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName || !lastName) {
      return session?.user?.email?.[0]?.toUpperCase() || "U"
    }
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/sign-in" })
  }

  return (
    <aside className="w-64 border-r bg-white flex flex-col">
      <div className="p-3">
        <Button className="w-full justify-start gap-2" variant="outline">
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-1 py-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Recent Chats
          </h3>
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className="px-3 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.title}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-2 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getInitials(user.name, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full">
                  {user.name} {user.lastName}
                </span>
                <span className="text-xs text-gray-500 truncate w-full">
                  {user.email}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="top">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
