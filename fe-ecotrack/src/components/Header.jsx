import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaRecycle } from 'react-icons/fa';

const Header = () => {
  const [user, setUser] = useState(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const drawerRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultAvatar =
    'https://kqolfqxyiywlkintnoky.supabase.co/storage/v1/object/public/avatars/default.jpg';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    // Close drawer on outside click
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  const handleAnchorClick = (id) => {
    if (isLandingPage) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-50 h-20 flex items-center">
      <div className="max-w-6xl mx-auto w-full px-6 flex justify-between items-center">
        <Link
          to={user ? '/home' : '/'}
          className="flex items-center gap-3 text-green-700 text-2xl font-bold"
        >
          <FaRecycle className="text-3xl" />
          EcoTrack
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex gap-8 items-center text-base font-medium">
          {!user ? (
            <>
              <button onClick={() => handleAnchorClick('about')}>About Us</button>
              <button onClick={() => handleAnchorClick('impact')}>Impact</button>
              <button onClick={() => handleAnchorClick('manifesto')}>Manifesto</button>
              <button onClick={() => handleAnchorClick('faq')}>FAQ</button>
              <Link to="/contact">Contact</Link>
              <Link
                to="/signup"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="border border-green-600 text-green-700 px-4 py-2 rounded-md hover:bg-green-50"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              {/* Avatar Icon */}
              <img
                src={user.photoURL || defaultAvatar}
                alt="avatar"
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-10 h-10 rounded-full cursor-pointer object-cover border border-gray-300"
              />
            </>
          )}
        </div>
      </div>

      {/* Avatar Drawer */}
      {avatarOpen && user && (
        <div
          ref={drawerRef}
          className="absolute top-20 right-6 bg-white shadow-xl rounded-md border w-48 z-50 animate-slide-in"
        >
          <ul className="flex flex-col divide-y">
            <li>
              <Link
                to="/home"
                onClick={() => setAvatarOpen(false)}
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                onClick={() => setAvatarOpen(false)}
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Marketplace
              </Link>
            </li>
            <li>
              <Link
                to="/edit-profile"
                onClick={() => setAvatarOpen(false)}
                className="block px-4 py-3 hover:bg-gray-100"
              >
                Edit Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
