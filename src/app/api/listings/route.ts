import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    console.log('Fetching listings with params:', {
      category,
      query,
      minPrice,
      maxPrice,
      sort,
      order
    });

    await dbConnect();

    let filter: any = { isDeleted: false };
    if (category) filter.category = category;
    if (query) filter.$text = { $search: query };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    console.log('Using filter:', filter);

    const listings = await Listing.find(filter)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .populate("userId", "name email")
      .lean();

    console.log(`Found ${listings.length} listings`);

    // Transform the listings to match the expected format
    const transformedListings = listings.map(listing => ({
      ...listing,
      _id: listing._id.toString(),
      seller: {
        name: listing.userId?.name || "Unknown",
        email: listing.userId?.email || "",
      }
    }));

    return NextResponse.json(transformedListings);
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { message: "Error fetching listings", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    console.log('Starting listing creation...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log('Received data:', data);

    const {
      title,
      description,
      price,
      category,
      location,
      condition,
      images,
    } = data;

    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database');

    console.log('Creating listing...');
    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      location,
      condition,
      images: images || [],
      userId: session.user.id,
    });
    console.log('Listing created:', listing);

    return NextResponse.json(listing, { status: 201 });
  } catch (error: any) {
    console.error("Error creating listing:", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });

    // Check for validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          message: "Validation error",
          details: Object.values(error.errors).map((err: any) => err.message)
        },
        { status: 400 }
      );
    }

    // Check for MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { 
          message: "Database error",
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Error creating listing",
        details: error.message
      },
      { status: 500 }
    );
  }
}
