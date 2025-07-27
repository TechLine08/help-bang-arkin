import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaRecycle, FaTimes } from 'react-icons/fa';

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

        {/* Nav */}
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
              <img
                src={user.photoURL || defaultAvatar}
                alt="avatar"
                onClick={() => setAvatarOpen(true)}
                className="w-12 h-12 rounded-full cursor-pointer object-cover border-2 border-gray-300"
              />
            </>
          )}
        </div>
      </div>

      {/* Drawer */}
      {avatarOpen && user && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black opacity-40" onClick={() => setAvatarOpen(false)} />
          <div
            ref={drawerRef}
            className="relative bg-white w-72 h-full shadow-lg p-6 animate-slide-in flex flex-col"
          >
            <button
              className="absolute top-4 right-4 text-xl text-gray-500 hover:text-red-600"
              onClick={() => setAvatarOpen(false)}
            >
              <FaTimes />
            </button>

            <div className="mt-10 flex flex-col items-center">
              <img
                src={user.photoURL || defaultAvatar}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
              />
              <h2 className="mt-4 text-lg font-semibold text-gray-800">
                {user.displayName || 'Anonymous'}
              </h2>
            </div>

            <hr className="my-6" />

            <nav className="flex flex-col gap-4 text-base">
              <Link
                to="/home"
                onClick={() => setAvatarOpen(false)}
                className="hover:text-green-600"
              >
                Dashboard
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setAvatarOpen(false)}
                className="hover:text-green-600"
              >
                Marketplace
              </Link>
              <Link
                to="/edit-profile"
                onClick={() => setAvatarOpen(false)}
                className="hover:text-green-600"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
