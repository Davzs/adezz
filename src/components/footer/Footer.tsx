"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from "lucide-react";
import NewsletterSubscription from "./NewsletterSubscription";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b pb-8">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Stay in the loop</h3>
            <p className="text-muted-foreground">
              Subscribe to our newsletter for the latest listings and deals
            </p>
          </div>
          <NewsletterSubscription />
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">About Us</h4>
            <p className="text-muted-foreground mb-4">
              Your trusted platform for buying and selling. We connect people to
              make commerce easy and reliable.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/electronics"
                  className="text-muted-foreground hover:text-primary"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/fashion"
                  className="text-muted-foreground hover:text-primary"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/category/home"
                  className="text-muted-foreground hover:text-primary"
                >
                  Home & Garden
                </Link>
              </li>
              <li>
                <Link
                  href="/category/sports"
                  className="text-muted-foreground hover:text-primary"
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary"
                >
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">support@dezy.com</span>
              </li>
              <li>
                <p className="text-muted-foreground">
                  123 Market Street
                  <br />
                  San Francisco, CA 94105
                  <br />
                  United States
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              {currentYear} Dezy. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
