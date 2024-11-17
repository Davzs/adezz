import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create full-size image (max 800x800)
    const fullImage = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    // Create thumbnail (32x32)
    const thumbnail = await sharp(buffer)
      .resize(32, 32, {
        fit: 'cover'
      })
      .toBuffer();

    // Convert to base64
    const fullImageBase64 = `data:${file.type};base64,${fullImage.toString("base64")}`;
    const thumbnailBase64 = `data:${file.type};base64,${thumbnail.toString("base64")}`;

    // Update user's image in database
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        image: fullImageBase64,
        thumbnailImage: thumbnailBase64
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile image updated successfully",
      image: fullImageBase64,
      thumbnailImage: thumbnailBase64
    });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Error uploading image", details: error.message },
      { status: 500 }
    );
  }
}
