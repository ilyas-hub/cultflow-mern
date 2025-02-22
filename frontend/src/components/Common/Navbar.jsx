import React, { useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";
import { NavbarLinks } from "../../data/navbar-links";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const matchRoute = (route) => matchPath({ path: route }, location.pathname);

  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img
            src="https://adscult.com/wp-content/uploads/2023/10/AdsCult-logo.webp"
            alt="Logo"
            width={160}
            height={32}
            loading="lazy"
          />
        </Link>

        {/* Desktop Navigation Links (Show only when logged in) */}
        {token && (
          <nav className="hidden md:block">
            <ul className="flex gap-x-6 text-richblack-25">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Desktop Login/Signup Buttons (Show when not logged in) */}
        {!token && (
          <div className="hidden md:flex items-center gap-x-4">
            <Link to="/login">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Log in
              </button>
            </Link>
            <Link to="/signup">
              <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                Sign up
              </button>
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          className="mr-4 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? (
            <AiOutlineClose fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-14 left-0 w-full bg-richblack-900 py-4 shadow-md md:hidden z-50">
          <ul className="flex flex-col items-center gap-y-4 text-richblack-25">
            {token ? (
              // Show navigation links when logged in
              NavbarLinks.map((link, index) => (
                <li key={index} onClick={() => setIsMenuOpen(false)}>
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                </li>
              ))
            ) : (
              // Show Login/Signup when not logged in
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                    Log in
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                    Sign up
                  </button>
                </Link>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Navbar;
