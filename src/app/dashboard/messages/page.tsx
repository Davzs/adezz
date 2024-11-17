'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, ArrowLeft } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    email: string;
    image: string;
  }[];
  listing?: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
  updatedAt: string;
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      fetchConversations()
    }
  }, [session, status, router])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(data)
    } catch (err: any) {
      console.error('Error fetching conversations:', err)
      setError(err.message)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== session?.user?.id) || conversation.participants[0]
  }

  const filteredConversations = conversations.filter(conv => {
    const searchTerm = searchQuery.toLowerCase()
    const otherParticipant = getOtherParticipant(conv)
    return (
      otherParticipant.name.toLowerCase().includes(searchTerm) ||
      conv.listing?.title.toLowerCase().includes(searchTerm) ||
      conv.lastMessage?.content.toLowerCase().includes(searchTerm)
    )
  })

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-4 w-[600px] h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Your conversations with buyers and sellers
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Conversations</CardTitle>
                <CardDescription>Your recent conversations</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-6 text-destructive">
                <p>{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchConversations}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No conversations found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "When you message someone about a listing, it will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation)
                  return (
                    <div
                      key={conversation.id}
                      className="flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/messages/${conversation.id}`)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant.image} />
                        <AvatarFallback>{otherParticipant.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{otherParticipant.name}</p>
                          <time className="text-sm text-muted-foreground">
                            {new Date(conversation.updatedAt).toLocaleDateString()}
                          </time>
                        </div>
                        {conversation.listing && (
                          <p className="text-sm text-muted-foreground">
                            Re: {conversation.listing.title}
                          </p>
                        )}
                        {conversation.lastMessage && (
                          <p className="text-sm line-clamp-2">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
