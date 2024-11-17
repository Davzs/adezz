import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Listing from "@/models/Listing";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to contact sellers" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const listing = await Listing.findById(params.id).select('userId');
    if (!listing) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    // Here you would typically:
    // 1. Save the message to your database
    // 2. Send an email notification to the seller
    // 3. Create a chat/conversation thread
    // For now, we'll just return a success response

    return NextResponse.json({
      message: "Message sent successfully",
      listingId: params.id,
      sellerId: listing.userId,
      buyerId: session.user.id,
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Error sending message", details: error.message },
      { status: 500 }
    );
  }
}
