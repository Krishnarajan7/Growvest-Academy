import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              Helping children speak, read and grow with confidence — Spoken English,
              phonics, public speaking and fun learning activities for ages 4–15.
              200+ students and counting.
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
  href="https://wa.me/917702332472"
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
              <li><Link to="/super-kids" className="text-gray-400 hover:text-green-400">Super Kids Program</Link></li>
              <li><Link to="/activities" className="text-gray-400 hover:text-green-400">Fun Learning Activities</Link></li>
              <li><Link to="/store" className="text-gray-400 hover:text-green-400">School Kit Store</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-green-400">About Growvest</Link></li>
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

        <div className="border-t border-gray-800 mt-8 pt-8 text-center space-y-3">
  <p className="text-gray-400">
    © {new Date().getFullYear()} Growvest Academy. All rights reserved. Helping children speak, read and grow.
  </p>

  <p className="text-gray-500 text-sm">
    Spoken English • Public Speaking • Fun Learning for Kids
  </p>

  {/* Powered By */}
  <a
    href="https://360astra.io"
    target="_blank"
    rel="noopener noreferrer"
    className="flex justify-center items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
  >
    <span className="text-sm">Website by</span>
    <img
  src="/images/360astra.png"
  alt="360Astra"
  className="h-6 w-6 object-contain hover:scale-105 transition-transform"
/>

  </a>
</div>

      </div>
    </footer>
  );
};

export default Footer;
