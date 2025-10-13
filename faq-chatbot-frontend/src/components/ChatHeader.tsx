"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function ChatHeader() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  if (session?.user) {
    return null
  }

  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-end gap-3">
        {!isLoading && (
          <>
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
          </>
        )}
      </div>
    </header>
  )
}
