"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import { useChatContext } from "@/contexts/ChatContext"

export function ChatHeader() {
  const { data: session, status } = useSession()
  const { toggleSidebar } = useChatContext()
  const isLoading = status === "loading"

  // Don't render header on desktop when user is logged in
  if (session?.user) {
    return (
      <header className="lg:hidden sticky top-0 z-30 border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center gap-3">
          {session?.user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden h-8 w-8 p-0"
            >
              <MenuIcon className="h-5 w-5" />
            </Button>
          )}
        </div>

        {!session?.user && !isLoading && (
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
