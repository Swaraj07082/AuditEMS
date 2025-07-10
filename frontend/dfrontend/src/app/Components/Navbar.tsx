"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      await fetch("/api/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">Audit Management System</span>
        </div>

        {/* Center: Navigation (desktop) */}
        <nav className="hidden md:flex items-center space-x-7 absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Right: Login/Logout button and mobile menu toggle */}
        <div className="flex items-center space-x-3">
          {status === "authenticated" ? (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:block"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="hidden md:block">
              <Link href="/login">Login</Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu (small screens) */}
        {isMenuOpen && (
          <nav className="absolute top-full left-0 w-full bg-white border-t md:hidden shadow-md z-40">
            <div className="flex flex-col px-4 py-3 space-y-2">
              <Link
                href="#features"
                className="text-base font-medium hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-base font-medium hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-base font-medium hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {status === "authenticated" ? (
                <button
                  className="text-base font-medium hover:text-blue-600 text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-base font-medium hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
