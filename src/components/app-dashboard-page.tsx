'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Edit, Trash2, Heart, Clock, DollarSign } from 'lucide-react'

export function BlockPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeListings, setActiveListings] = useState([])
  const [savedListings, setSavedListings] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      // Fetch user's active listings, saved listings, and recent activity
      // This would typically be API calls to your backend
      setActiveListings([
        { id: 1, title: 'iPhone 12', price: 699, views: 50 },
        { id: 2, title: 'MacBook Pro', price: 1299, views: 30 },
      ])
      setSavedListings([
        { id: 3, title: 'Nike Air Max', price: 120 },
        { id: 4, title: 'Sony PlayStation 5', price: 499 },
      ])
      setRecentActivity([
        { id: 1, type: 'view', item: 'iPhone 12', time: '2 hours ago' },
        { id: 2, type: 'save', item: 'Nike Air Max', time: '1 day ago' },
      ])
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Avatar className="h-12 w-12">
          <AvatarImage src={session?.user?.image} alt={session?.user?.name} />
          <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
        </Avatar>
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
            <CardTitle>Saved Listings</CardTitle>
            <CardDescription>Listings you've saved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{savedListings.length}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/saved-listings')}>
              View Saved Listings
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
      </div>

      <Tabs defaultValue="listings" className="mt-6">
        <TabsList>
          <TabsTrigger value="listings">Your Listings</TabsTrigger>
          <TabsTrigger value="saved">Saved Listings</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>Manage your active listings</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activeListings.map(listing => (
                  <li key={listing.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground">${listing.price} - {listing.views} views</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/listings/edit/${listing.id}`)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => console.log(`Delete listing ${listing.id}`)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Listings</CardTitle>
              <CardDescription>Listings you're interested in</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {savedListings.map(listing => (
                  <li key={listing.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <h3 className="font-semibold">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground">${listing.price}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => router.push(`/listings/${listing.id}`)}>
                      View Details
                    </Button>
                  </li>
                ))}
              </ul>
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
              <ul className="space-y-4">
                {recentActivity.map(activity => (
                  <li key={activity.id} className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                    {activity.type === 'view' ? (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    ) : activity.type === 'save' ? (
                      <Heart className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {activity.type === 'view' ? 'Viewed' : activity.type === 'save' ? 'Saved' : 'Purchased'}
                        {' '}{activity.item}
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}