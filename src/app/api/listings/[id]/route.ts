import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { Types } from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || !Types.ObjectId.isValid(params.id)) {
      console.log('Invalid listing ID:', params.id);
      return NextResponse.json(
        { error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');

    console.log('Fetching listing with ID:', params.id);
    const listing = await Listing.findById(params.id)
      .select('-__v')
      .lean();

    if (!listing) {
      console.log('Listing not found');
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    console.log('Fetching seller information');
    const seller = await User.findById(listing.userId)
      .select('name image createdAt')
      .lean();

    if (!seller) {
      console.log('Seller not found');
      return NextResponse.json(
        { error: "Seller information not found" },
        { status: 404 }
      );
    }

    const response = {
      ...listing,
      seller: {
        id: seller._id,
        name: seller.name,
        image: seller.image,
        createdAt: seller.createdAt
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/listings/[id]:', error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!params.id || !Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const listing = await Listing.findById(params.id);
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user owns the listing
    if (listing.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You can only edit your own listings" },
        { status: 403 }
      );
    }

    const data = await req.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'category', 'condition', 'location'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate condition value
    const validConditions = ["New", "Like New", "Good", "Fair", "Poor"];
    if (!validConditions.includes(data.condition)) {
      return NextResponse.json(
        { error: "Invalid condition value" },
        { status: 400 }
      );
    }

    // Update price history if price changed
    if (data.price !== listing.price) {
      if (!listing.metadata) listing.metadata = {};
      if (!listing.metadata.priceHistory) listing.metadata.priceHistory = [];
      
      listing.metadata.priceHistory.push({
        price: listing.price,
        date: new Date()
      });
      listing.metadata.lastPriceUpdate = new Date();
    }

    // Update the listing
    Object.assign(listing, {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      subcategory: data.subcategory,
      condition: data.condition,
      location: data.location,
      negotiable: data.negotiable,
      images: data.images,
      updatedAt: new Date()
    });

    await listing.save();

    return NextResponse.json({
      message: "Listing updated successfully",
      listing
    });
  } catch (error: any) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: error.message || "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!params.id || !Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid listing ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const listing = await Listing.findById(params.id);
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user owns the listing
    if (listing.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You can only delete your own listings" },
        { status: 403 }
      );
    }

    // Soft delete the listing
    await listing.softDelete(session.user.id);

    // Add to user's activity history
    const user = await User.findById(session.user.id);
    if (user) {
      await user.addActivity('delete', 'listing', listing._id);
    }

    return NextResponse.json({
      message: "Listing deleted successfully"
    });
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: error.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
}
