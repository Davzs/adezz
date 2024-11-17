import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, MessageSquare, Shield, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Dezy - Modern Marketplace Platform",
  description: "Buy, sell, and connect in our vibrant marketplace community",
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative ${
        session 
          ? "bg-gradient-to-br from-gray-900 to-gray-800" 
          : "bg-gradient-to-br from-gray-900 to-black"
      } text-white py-24`}>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="outline">
              ✨ Welcome to the Future of Local Commerce
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Your Modern Marketplace
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Connect, trade, and thrive in our vibrant community marketplace. 
              Buy and sell with confidence, powered by modern technology.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                asChild
              >
                <Link href="/listings/create">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-gray-400">Active Listings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">5K+</div>
                <div className="text-gray-400">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-gray-400">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9★</div>
                <div className="text-gray-400">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make buying and selling as smooth as possible,
              with all the tools and features you need to succeed in the digital marketplace.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow border bg-card">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Create listings in minutes with our streamlined process and intuitive interface
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border bg-card">
              <MessageSquare className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Real-time Chat</h3>
              <p className="text-muted-foreground">
                Communicate instantly with buyers and sellers through our built-in messaging system
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border bg-card">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Secure & Safe</h3>
              <p className="text-muted-foreground">
                Trade with confidence using our secure platform and user verification system
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Start Trading in Three Simple Steps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started with Dezy is easy. Follow these simple steps to begin
              your journey in our marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Create Account</h3>
              <p className="text-muted-foreground">
                Sign up for free and complete your profile to start trading
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Post or Browse</h3>
              <p className="text-muted-foreground">
                Create your listing or browse existing ones in your area
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Connect & Trade</h3>
              <p className="text-muted-foreground">
                Chat with other users and complete your transactions safely
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${
        session 
          ? "bg-gray-900" 
          : "bg-black"
      } text-white`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              Get Started Today
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Join Our Community?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already buying and selling on Dezy.
              Start your journey today and become part of our thriving marketplace.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                asChild
              >
                <Link href="/auth/signup">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/listings">Explore Listings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
