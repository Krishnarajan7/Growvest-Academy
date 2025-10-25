import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/images/logo.jpg"
                alt="Growvest Academy Logo"
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="text-xl font-bold">Growvest Academy</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Empowering beginners to make smart investment decisions through comprehensive 
              mutual fund education and personal finance guidance. Start your wealth-building journey today.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/grow.with25"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <Instagram size={20} />
                <span>Instagram</span>
              </a>
              <a
                href="https://chat.whatsapp.com/DU3aiu3CLy15dt6eVGW91K?mode=ac_t"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Learning Resources */}
          <div>
            <h3 className="font-semibold mb-4">Learning</h3>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-gray-400 hover:text-green-400">Financial Development</Link></li>
              <li><Link to="/courses" className="text-gray-400 hover:text-green-400">Stock Market</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-green-400">Java with Project</Link></li>
              <li><Link to="/premium" className="text-gray-400 hover:text-green-400">Web Development with Project</Link></li>
              <li><Link to="/courses" className="text-gray-400 hover:text-green-400">More Courses..</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-400 hover:text-green-400">Contact Us</Link></li>
              <li><Link to="/team" className="text-gray-400 hover:text-green-400">Meet Our Team</Link></li>
              <li><a href="/contact" className="text-gray-400 hover:text-green-400">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Growvest Academy. All rights reserved. Empowering financial growth through education.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Investment education • Mutual Fund Guidance • Personal Finance Growth
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
