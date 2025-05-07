"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./logo";

function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === "A" && target.hash) {
        const el = document.querySelector(target.hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          setMenuOpen(false);
        }
      }
    };
    const nav = document.getElementById("home-header-nav");
    nav?.addEventListener("click", handleSmoothScroll);
    return () => nav?.removeEventListener("click", handleSmoothScroll);
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="#hero" className="flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center md:hidden">
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <nav
          id="home-header-nav"
          className="hidden md:flex items-center space-x-6"
        >
          <a href="#tech" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Tech</a>
          <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Pricing</a>
          <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Testimonials</a>
          <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">FAQ</a>
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <Link href="/sign-in" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Sign In</Link>
          <Link href="/sign-up" className="ml-2 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors text-sm">Sign Up</Link>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-4">
          <nav className="flex flex-col space-y-2 mt-2" id="home-header-nav-mobile">
            <a href="#tech" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Tech</a>
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Testimonials</a>
            <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">FAQ</a>
            <Link href="/sign-in" className="text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors text-sm text-center">Sign Up</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default HomeHeader;
