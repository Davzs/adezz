import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const userId = session.user.id || session.user._id;
    
    const messages = await Message.find({ 
      recipientId: userId,
      isDeleted: { $ne: true }
    })
    .populate('senderId', 'name email image')
    .populate('listingId', 'title images')
    .sort({ createdAt: -1 })
    .lean();

    const transformedMessages = messages.map(message => ({
      id: message._id.toString(),
      sender: {
        id: message.senderId._id.toString(),
        name: message.senderId.name,
        email: message.senderId.email,
        image: message.senderId.image,
      },
      listing: message.listingId ? {
        id: message.listingId._id.toString(),
        title: message.listingId.title,
        image: message.listingId.images[0],
      } : null,
      message: message.message,
      read: message.read,
      createdAt: message.createdAt,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Error fetching messages", details: error.message },
      { status: 500 }
    );
  }
}

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
    const { messageId } = body;

    await dbConnect();

    const userId = session.user.id || session.user._id;
    
    const message = await Message.findOne({
      _id: messageId,
      recipientId: userId,
    });

    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    message.read = true;
    await message.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { message: "Error updating message", details: error.message },
      { status: 500 }
    );
  }
}
