import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: 'Super Kids', href: '/super-kids' },
    { name: 'Activities', href: '/activities' },
    { name: 'Team', href: '/team' },
    { name: "Team", href: "/team" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/images/logo.jpg"
                alt="Growvest Academy"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-green-600 group-hover:border-green-700 transition-colors duration-300 shadow-sm"
              />
            </div>
            <span
              className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                scrolled ? "text-gray-900" : "text-gray-900"
              } group-hover:text-green-700`}
            >
              Growvest Academy
            </span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative font-medium transition-colors duration-300 ${
                    isActive(item.href)
                      ? "text-green-700"
                      : scrolled
                      ? "text-gray-600 hover:text-green-700"
                      : "text-gray-700 hover:text-green-700"
                  } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-700 after:transition-all after:duration-300 hover:after:w-full ${
                    isActive(item.href) ? "after:w-full" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/premium">
              <Button className="btn-primary">Get Premium</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-md transition-colors duration-300 ${
              scrolled
                ? "text-gray-600 hover:text-green-700"
                : "text-gray-700 hover:text-green-700"
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-96 opacity-100 visible"
              : "max-h-0 opacity-0 invisible overflow-hidden"
          }`}
        >
          <div className="px-0 pt-4 pb-6 space-y-2 bg-white rounded-lg shadow-xl mt-2 border border-gray-100">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-base font-medium rounded-md transition-all duration-300 transform ${
                  isActive(item.href)
                    ? "text-green-700 bg-green-50 border-l-4 border-green-700"
                    : "text-gray-600 hover:text-green-700 hover:bg-green-50 hover:border-l-4 hover:border-green-300"
                } ${
                  isOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 px-4 space-y-3 border-t border-gray-100">
              <Link to="/premium" onClick={() => setIsOpen(false)}>
                <Button className="w-full btn-primary shadow-md hover:shadow-lg">
                  Get Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
