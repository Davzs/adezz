import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  await dbConnect();

  const userData = await User.findById(session.user.id)
    .populate({
      path: 'savedListings',
      select: 'title price images createdAt',
    })
    .select('+activityHistory')
    .lean();

  if (!userData) {
    throw new Error("User not found");
  }

  const user = {
    ...userData,
    id: userData._id.toString(),
    _id: userData._id.toString(),
    savedListings: userData.savedListings?.map((listing: any) => ({
      ...listing,
      _id: listing._id.toString(),
      createdAt: listing.createdAt?.toISOString(),
    })) || [],
    activityHistory: (userData.activityHistory || [])
      .map((activity: any) => ({
        ...activity,
        targetId: activity.targetId.toString(),
        timestamp: activity.timestamp?.toISOString(),
      }))
      .sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10),
    createdAt: userData.createdAt?.toISOString(),
    updatedAt: userData.updatedAt?.toISOString(),
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
            <p className="text-muted-foreground">
              Manage your profile information and preferences
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="col-span-full xl:col-span-2">
            <ProfileForm user={user} />
          </div>
          <div className="hidden xl:block">
            <div className="sticky top-6">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">Tips</h3>
                <ul className="mt-2 list-inside list-disc space-y-2 text-sm text-muted-foreground">
                  <li>Keep your profile information up to date</li>
                  <li>Use a clear profile picture</li>
                  <li>Add a bio to tell others about yourself</li>
                  <li>Enable notifications to stay updated</li>
                  <li>Regularly review your security settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
