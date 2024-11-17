import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
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
    const userId = session.user.id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: params.conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    // Get messages
    const messages = await Message.find({
      conversationId: params.conversationId
    })
    .populate('senderId', 'name email image')
    .sort({ createdAt: 1 })
    .lean();

    const transformedMessages = messages.map(message => ({
      id: message._id.toString(),
      sender: {
        id: message.senderId._id.toString(),
        name: message.senderId.name,
        email: message.senderId.email,
        image: message.senderId.image,
      },
      content: message.content,
      metadata: message.metadata,
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

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const userId = session.user.id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: params.conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create message
    const newMessage = await Message.create({
      conversationId: params.conversationId,
      senderId: userId,
      content: message,
      metadata: {
        listingId: conversation.listingId
      }
    });

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Return populated message
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name email image')
      .lean();

    return NextResponse.json({
      message: {
        id: populatedMessage._id.toString(),
        sender: {
          id: populatedMessage.senderId._id.toString(),
          name: populatedMessage.senderId.name,
          email: populatedMessage.senderId.email,
          image: populatedMessage.senderId.image,
        },
        content: populatedMessage.content,
        metadata: populatedMessage.metadata,
        createdAt: populatedMessage.createdAt,
      }
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Error sending message", details: error.message },
      { status: 500 }
    );
  }
}
