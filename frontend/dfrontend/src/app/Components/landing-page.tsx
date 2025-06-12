"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, FileText, Users, BarChart3, Clock, Star, ArrowRight, Menu, Lock, Zap } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Shield,
    title: "Compliance Verification",
    description: "Automatically verify reports against industry standards",
  },
  {
    icon: FileText,
    title: "Document Management",
    description: "Centralized repository for all audit documents with version control and secure access",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Comprehensive dashboards and reporting to track compliance status and trends",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Multi-user workspace with role-based permissions and audit trail tracking",
  }
]


import { useState } from "react";


   



export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">Audit Management System</span>
        </div>

        {/* Center: Navigation (desktop) */}
        <nav className="hidden md:flex items-center space-x-7 absolute left-1/2 transform -translate-x-1/2">
          <Link href="#features" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Features
          </Link>
          <Link href="#about" className="text-sm font-medium hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="#contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right: Login button and mobile menu toggle */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="hidden md:block">
            <Link href="/login">Login</Link>
          </Button>

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
              <Link
                href="/login"
                className="text-base font-medium hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );



      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" />
              
            </Badge>

            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Streamline Your <span className="text-blue-600">Audit Management</span> Process
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automate compliance verification, manage audit documents, and ensure regulatory adherence with our
              comprehensive audit management platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" passHref>
              <Button size="lg" className="text-lg px-8">
                Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
              <Link href="/login" passHref>
              <Button size="lg" className="text-lg px-8">
                Sign up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Powerful Features for Modern Auditing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage audits efficiently and maintain compliance across your organization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Transform Your Audit Process?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" passHref>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Right Here!
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold">Audit Management System</span>
              </div>
              <p className="text-slate-400">
                Streamlining audit processes and ensuring compliance for organizations worldwide.
              </p>
            </div>

            

            <div>
          <h3 className="font-semibold mb-4">Support</h3>
          <ul className="flex space-x-4 text-slate-400">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                API Reference
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Status
              </Link>
            </li>
          </ul>
        </div>

          </div>

          <Separator className="bg-slate-700 mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">© 2025 Audit Evidence Management System. All rights reserved.</div>
            <div className="flex space-x-6 text-sm text-slate-400">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
