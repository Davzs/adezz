"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Camera, User as UserIcon, Mail, Globe, MapPin, Plus, Pencil, Trash, Eye, Bookmark, MessageSquare, Clock } from "lucide-react";

interface ActivityHistory {
  action: string;
  targetType: string;
  targetId: string;
  metadata?: any;
  timestamp: string;
}

interface SavedListing {
  _id: string;
  title: string;
  price: string;
  images?: string[];
  createdAt: string;
}

interface ProfileFormProps {
  user: User & {
    id: string;
    _id: string;
    bio?: string;
    location?: string;
    website?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    activityHistory?: ActivityHistory[];
    savedListings?: SavedListing[];
    createdAt: string;
    updatedAt: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    image: user.image || "",
    thumbnailImage: user.thumbnailImage || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    emailNotifications: user.emailNotifications || true,
    pushNotifications: user.pushNotifications || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
      
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }

      const data = await response.json();
      setFormData(prev => ({ 
        ...prev, 
        image: data.image,
        thumbnailImage: data.thumbnailImage 
      }));
      
      // Update the session to reflect the new images
      router.refresh();
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUnsaveListing = async (listingId: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/unsave`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to unsave listing");
      }

      toast({
        title: "Success",
        description: "Listing has been unsaved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="w-full inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground relative space-x-1">
        <TabsTrigger value="general" className="rounded-md px-3 py-1.5">General</TabsTrigger>
        <TabsTrigger value="notifications" className="rounded-md px-3 py-1.5">Notifications</TabsTrigger>
        <TabsTrigger value="activity" className="rounded-md px-3 py-1.5">Activity</TabsTrigger>
        <TabsTrigger value="saved" className="rounded-md px-3 py-1.5">Saved</TabsTrigger>
        <TabsTrigger value="security" className="rounded-md px-3 py-1.5">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-6">
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update your profile information visible to other users.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {isUploading ? (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <AvatarImage src={formData.image} alt={formData.name} />
                        <AvatarFallback>
                          {formData.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    id="imageUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <span className="sr-only">Change Picture</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isUploading 
                    ? "Uploading..." 
                    : "Click the camera icon to change your profile picture"}
                </p>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="image">Profile Picture URL</Label>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  className="resize-none min-h-[100px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                  <Button variant="ghost" size="icon">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex gap-2">
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                  <Button variant="ghost" size="icon">
                    <Globe className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 border-t">
            <div className="flex justify-end space-x-2 w-full">
              <Button variant="ghost">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-6">
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              View your recent activity and interactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {user.activityHistory && user.activityHistory.length > 0 ? (
              <div className="divide-y divide-border">
                {user.activityHistory.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 px-6 py-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {activity.action === 'create' && <Plus className="h-4 w-4" />}
                      {activity.action === 'edit' && <Pencil className="h-4 w-4" />}
                      {activity.action === 'delete' && <Trash className="h-4 w-4" />}
                      {activity.action === 'view' && <Eye className="h-4 w-4" />}
                      {activity.action === 'save' && <Bookmark className="h-4 w-4" />}
                      {activity.action === 'message' && <MessageSquare className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} {activity.targetType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">No Activity Yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your recent activities will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your listings and messages via email.
                </p>
              </div>
              <Switch
                checked={formData.emailNotifications}
                onCheckedChange={(checked) =>
                  handleToggle("emailNotifications", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in your browser.
                </p>
              </div>
              <Switch
                checked={formData.pushNotifications}
                onCheckedChange={(checked) =>
                  handleToggle("pushNotifications", checked)
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="saved" className="mt-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-6">
            <CardTitle>Saved Listings</CardTitle>
            <CardDescription>
              View and manage your saved listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-6">
            {user.savedListings && user.savedListings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {user.savedListings.map((listing: any, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    {listing.images && listing.images[0] && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{listing.price}</p>
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/listings/${listing._id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnsaveListing(listing._id)}
                        >
                          <Bookmark className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">No Saved Listings</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Listings you save will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your password or reset it if you've forgotten it.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/profile/change-password")}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/auth/reset-password")}
                >
                  Reset Password
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <Button variant="outline" disabled>
                Enable 2FA (Coming Soon)
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Account Management</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all of your content.
                </p>
              </div>
              <Button variant="destructive" disabled>
                Delete Account
              </Button>
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
