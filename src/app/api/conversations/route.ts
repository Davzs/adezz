import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
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
    const userId = session.user.id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email image')
    .populate('listingId', 'title images price')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .lean();

    const transformedConversations = conversations.map(conv => ({
      id: conv._id.toString(),
      participants: conv.participants.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        image: p.image,
      })),
      listing: conv.listingId ? {
        id: conv.listingId._id.toString(),
        title: conv.listingId.title,
        image: conv.listingId.images[0],
        price: conv.listingId.price,
      } : null,
      lastMessage: conv.lastMessage ? {
        id: conv.lastMessage._id.toString(),
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
      } : null,
      metadata: conv.metadata,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json(transformedConversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { message: "Error fetching conversations", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recipientId, listingId, message } = body;

    if (!recipientId || !listingId || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const userId = session.user.id;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      listingId,
      isActive: true
    });

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        listingId,
        isActive: true
      });
    }

    // Create message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      content: message,
      metadata: {
        listingId
      }
    });

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Return the conversation with the new message
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email image')
      .populate('listingId', 'title images price')
      .populate('lastMessage')
      .lean();

    return NextResponse.json({
      conversation: {
        id: populatedConversation._id.toString(),
        participants: populatedConversation.participants.map((p: any) => ({
          id: p._id.toString(),
          name: p.name,
          email: p.email,
          image: p.image,
        })),
        listing: populatedConversation.listingId ? {
          id: populatedConversation.listingId._id.toString(),
          title: populatedConversation.listingId.title,
          image: populatedConversation.listingId.images[0],
          price: populatedConversation.listingId.price,
        } : null,
        lastMessage: {
          id: newMessage._id.toString(),
          content: newMessage.content,
          createdAt: newMessage.createdAt,
        },
        metadata: populatedConversation.metadata,
        updatedAt: populatedConversation.updatedAt,
      }
    });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { message: "Error creating conversation", details: error.message },
      { status: 500 }
    );
  }
}
