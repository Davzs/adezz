import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Try both id and _id from the session
    const userId = session.user.id || session.user._id;
    console.log('Using userId:', userId);

    const userListings = await Listing.find({ 
      userId: userId,
      isDeleted: { $ne: true } // Only get non-deleted listings
    })
    .sort({ createdAt: -1 })
    .lean();

    console.log('Found listings:', userListings.length);

    // Transform listings to include view count (you can implement actual view tracking later)
    const transformedListings = userListings.map(listing => ({
      id: listing._id.toString(),
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      images: listing.images || [],
      createdAt: listing.createdAt,
      views: 0, // Placeholder for view count
    }));

    return NextResponse.json(transformedListings);
  } catch (error: any) {
    console.error("Error fetching user listings:", error);
    return NextResponse.json(
      { message: "Error fetching listings", details: error.message },
      { status: 500 }
    );
  }
}
