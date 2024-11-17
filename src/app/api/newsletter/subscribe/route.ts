import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/db";

const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  subscribed: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
  },
});

const Newsletter = mongoose.models.Newsletter || mongoose.model("Newsletter", NewsletterSchema);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email });
    
    if (existingSubscription) {
      if (existingSubscription.subscribed) {
        return NextResponse.json(
          { message: "Email already subscribed" },
          { status: 200 }
        );
      } else {
        // Resubscribe
        existingSubscription.subscribed = true;
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = undefined;
        await existingSubscription.save();
        
        return NextResponse.json(
          { message: "Successfully resubscribed" },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    await Newsletter.create({
      email,
      subscribed: true,
      subscribedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
