import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
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

    // Verify user is part of the conversation and get conversation details
    const conversation = await Conversation.findOne({
      _id: params.conversationId,
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email image')
    .populate('listingId', 'title images price')
    .populate('lastMessage')
    .lean();

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found" },
        { status: 404 }
      );
    }

    // Transform the conversation data
    const transformedConversation = {
      id: conversation._id.toString(),
      participants: conversation.participants.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        image: p.image,
      })),
      listing: conversation.listingId ? {
        id: conversation.listingId._id.toString(),
        title: conversation.listingId.title,
        image: conversation.listingId.images[0],
        price: conversation.listingId.price,
      } : null,
      lastMessage: conversation.lastMessage ? {
        id: conversation.lastMessage._id.toString(),
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
      } : null,
      updatedAt: conversation.updatedAt,
    };

    return NextResponse.json(transformedConversation);
  } catch (error: any) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { message: "Error fetching conversation", details: error.message },
      { status: 500 }
    );
  }
}
