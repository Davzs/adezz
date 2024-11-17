'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Edit, Trash2, Heart, Clock, DollarSign, Eye, MapPin, Tag, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  
  return date.toLocaleDateString()
}

interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  views: number;
  createdAt: string;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  listing?: {
    id: string;
    title: string;
    image: string;
  };
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeListings, setActiveListings] = useState<Listing[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      Promise.all([
        fetchUserListings(),
        fetchMessages()
      ])
    }
  }, [session, status, router])

  const fetchUserListings = async () => {
    try {
      setIsLoading(true)
      setError("")
      console.log('Fetching user listings...')
      const response = await fetch('/api/user/listings')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch listings')
      }
      
      const data = await response.json()
      console.log('Fetched listings:', data)
      setActiveListings(data)
    } catch (err: any) {
      console.error('Error fetching listings:', err)
      setError(err.message || 'Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data)
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError(err.message || 'Failed to load messages')
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete listing')
      }

      // Refresh listings after deletion
      fetchUserListings()
    } catch (err) {
      console.error('Error deleting listing:', err)
      alert('Failed to delete listing')
    }
  }

  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your current active listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeListings.length}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/listings/create')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Listing
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Recent messages from buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{messages.filter(m => !m.read).length}</p>
              <p className="text-sm text-muted-foreground">unread messages</p>
            </div>
            {messages.length > 0 && (
              <div className="mt-4 space-y-3">
                {messages.slice(0, 3).map((message) => (
                  <button
                    key={message.id}
                    onClick={() => router.push('/dashboard/messages')}
                    className="w-full text-left"
                  >
                    <div className={cn(
                      "flex items-start space-x-3 p-3 rounded-lg transition-colors hover:bg-muted/60",
                      !message.read && "bg-muted/40"
                    )}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.sender.image} />
                        <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">
                            {message.sender.name}
                            {!message.read && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                New
                              </span>
                            )}
                          </p>
                          <time className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(new Date(message.createdAt))}
                          </time>
                        </div>
                        {message.listing && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            Re: {message.listing.title}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/dashboard/messages')} className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" /> View All Messages
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
            <CardDescription>Views across all your listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {activeListings.reduce((sum, listing) => sum + listing.views, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
            <CardDescription>Combined value of your listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${activeListings.reduce((sum, listing) => sum + listing.price, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listings" className="mt-6">
        <TabsList>
          <TabsTrigger value="listings">Your Listings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>Manage your active listings</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <p className="text-red-500 mb-4">{error}</p>
              )}
              {activeListings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No listings yet</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/listings/create')}
                  >
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {activeListings.map(listing => (
                    <li key={listing.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 relative rounded-md overflow-hidden">
                          <img
                            src={listing.images[0] || '/placeholder.png'}
                            alt={listing.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{listing.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1 text-green-600">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold">{listing.price.toLocaleString()}</span>
                            </div>
                            <span className="text-muted-foreground/50">-</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{listing.views} views</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{listing.location}</span>
                            </div>
                            <span className="text-muted-foreground/50">-</span>
                            <div className="flex items-center gap-1">
                              <Tag className="h-4 w-4" />
                              <span className="capitalize">{listing.condition}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-gray-600 hover:bg-gray-50 hover:text-gray-700 border-gray-200"
                          onClick={() => router.push(`/listings/${listing.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                          onClick={() => router.push(`/listings/${listing.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          onClick={() => handleDeleteListing(listing.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>Messages from potential buyers</CardDescription>
                </div>
                {messages.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/messages')}>
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No messages yet</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    When you receive messages about your listings, they will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.slice(0, 10).map((message) => (
                    <button
                      key={message.id}
                      onClick={() => router.push('/dashboard/messages')}
                      className="w-full text-left"
                    >
                      <div className={cn(
                        "flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-muted/60",
                        !message.read && "bg-muted/40"
                      )}>
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={message.sender.image} />
                          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {message.sender.name}
                              </p>
                              {!message.read && (
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                  New
                                </span>
                              )}
                            </div>
                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(new Date(message.createdAt))}
                            </time>
                          </div>
                          {message.listing && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="relative h-8 w-8 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={message.listing.image}
                                  alt={message.listing.title}
                                  className="object-cover"
                                />
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                Re: {message.listing.title}
                              </p>
                            </div>
                          )}
                          <p className="text-sm text-foreground mt-2 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}