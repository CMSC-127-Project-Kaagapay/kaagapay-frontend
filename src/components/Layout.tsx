import React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, UserCircle, Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import logo from "../assets/pk_logo.png";

export function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Report", path: "/report" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/10">
      <div className="flex justify-between items-center max-w-8xl mx-auto px-6 h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="Project Kaagapay Logo"
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
          />
          <span className="text-xl font-extrabold text-primary tracking-tighter font-headline">
            Project Kaagapay
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight text-sm font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === link.path
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-surface-variant",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Crisis Hotline — always visible */}
          <button className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md">
            Crisis Hotline
          </button>

          {/* Profile — desktop only */}
          <Link
            to="/login"
            className="hidden md:flex text-on-surface-variant hover:bg-surface-container-low p-2 rounded-lg transition-all"
          >
            <UserCircle size={24} />
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden glass-nav border-t border-outline-variant/10 px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "text-sm font-semibold font-headline transition-colors py-3 px-2 rounded-lg",
                location.pathname === link.path
                  ? "text-primary bg-surface-container"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low",
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Profile link at bottom of mobile menu */}
          <div className="pt-3 mt-2 border-t border-outline-variant/10">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-sm font-semibold font-headline text-on-surface-variant hover:text-primary hover:bg-surface-container-low py-3 px-2 rounded-lg transition-colors"
            >
              <UserCircle size={20} />
              My Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10 mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="text-lg font-extrabold text-primary font-headline tracking-tighter">
              Project Kaagapay
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Promoting a safe and gender-fair university environment for all
              students and staff. Dedicated to the prevention and elimination of
              sexual harassment.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-primary uppercase tracking-widest text-xs">
              Contact
            </h4>
            <ul className="space-y-2 text-on-surface-variant text-sm font-medium">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary" />
                Crisis Hotline: (082) 293-0000
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-primary transition-colors underline decoration-primary/20"
                >
                  Contact OASH
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-primary uppercase tracking-widest text-xs">
              University
            </h4>
            <ul className="space-y-2 text-on-surface-variant text-sm font-medium">
              <li>
                <Link
                  to="#"
                  className="hover:text-primary transition-colors underline decoration-primary/20"
                >
                  University of the Philippines
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-primary transition-colors underline decoration-primary/20"
                >
                  UP Mindanao Website
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-primary uppercase tracking-widest text-xs">
              Legal
            </h4>
            <ul className="space-y-2 text-on-surface-variant text-sm font-medium">
              <li>
                <Link
                  to="#"
                  className="hover:text-primary transition-colors underline decoration-primary/20"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="hover:text-primary transition-colors underline decoration-primary/20"
                >
                  Data Privacy Act
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant text-xs font-medium">
          <p>© 2024 UP Mindanao Project Kaagapay. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-primary transition-colors">
              Facebook
            </Link>
            <Link to="#" className="hover:text-primary transition-colors">
              Email
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
