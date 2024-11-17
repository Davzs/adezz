import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Add to saved listings if not already saved
    if (!user.savedListings.includes(params.id)) {
      await user.saveListing(params.id);
      // Add activity
      await user.addActivity('save', 'listing', params.id);
    }

    return NextResponse.json({
      message: "Listing saved successfully"
    });
  } catch (error: any) {
    console.error("Error saving listing:", error);
    return NextResponse.json(
      { message: "Error saving listing", details: error.message },
      { status: 500 }
    );
  }
}
