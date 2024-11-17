import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      image,
      thumbnailImage,
      bio,
      location,
      website,
      emailNotifications,
      pushNotifications
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    if (website && !website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      return NextResponse.json(
        { message: "Please provide a valid website URL" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: session.user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already taken" },
        { status: 400 }
      );
    }

    // Update user with new fields
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name,
        email,
        image,
        thumbnailImage,
        bio,
        location,
        website,
        emailNotifications,
        pushNotifications
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        thumbnailImage: updatedUser.thumbnailImage,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error updating profile", details: error.message },
      { status: 500 }
    );
  }
}
