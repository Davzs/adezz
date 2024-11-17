'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, PlusCircle, User, Settings, LogOut, MessageSquare } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // Debug session data
  useEffect(() => {
    if (session?.user) {
      console.log('Session user data:', {
        name: session.user.name,
        image: session.user.image,
        thumbnailImage: session.user.thumbnailImage
      })
    }
  }, [session])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold text-xl">Dezy</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-md flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search listings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Navigation Items */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {session ? (
            <>
              <Button
                variant="ghost"
                onClick={() => router.push('/listings/create')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Listing
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      {session.user?.thumbnailImage ? (
                        <AvatarImage 
                          src={session.user.thumbnailImage}
                          alt={session.user.name || 'User'}
                          className="object-cover"
                        />
                      ) : session.user?.image ? (
                        <AvatarImage 
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback delayMs={600} className="text-xs font-medium">
                          {session.user?.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/auth/signup')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
