import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-gray-200 py-8 text-white border-t border-gray-600">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white">CultFlow</h2>
          <p className="mt-2 text-sm leading-relaxed">
            CultFlow is your ultimate task management solution. Whether you’re
            an admin assigning tasks or a user managing your to-dos, we help you
            stay organized and productive.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <nav className="flex  gap-2 text-sm">
            <Link to="/" className="hover:text-white transition">
              Home
            </Link>
            <Link to="/tasks" className="hover:text-white transition">
              Tasks
            </Link>
            <Link to="/profile" className="hover:text-white transition">
              Profile
            </Link>
            <Link to="/about" className="hover:text-white transition">
              About
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Why Choose CultFlow?
          </h3>
          <ul className="list-disc list-inside text-sm leading-relaxed">
            <li>Effortless task assignment and tracking.</li>
            <li>Seamless collaboration between admins and users.</li>
            <li>Boost your productivity and stay ahead.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-600 mt-5 pt-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} CultFlow. All rights reserved.</p>
        <p className="mt-1">Empowering teams to accomplish more.</p>
      </div>
    </footer>
  );
};

export default Footer;
