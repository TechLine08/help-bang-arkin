import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FaRecycle, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  const handleAnchorClick = (id) => {
    if (isLandingPage) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${id}`);
    }
    closeMenu();
  };

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2.5 text-green-700 text-2xl font-bold">
          <FaRecycle className="text-2xl" />
          EcoTrack
        </Link>

        {/* Hamburger Menu */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          {!user && (
            <>
              <button onClick={() => handleAnchorClick('about')} className="hover:text-green-600">About Us</button>
              <button onClick={() => handleAnchorClick('impact')} className="hover:text-green-600">Impact</button>
              <button onClick={() => handleAnchorClick('manifesto')} className="hover:text-green-600">Manifesto</button>
              <button onClick={() => handleAnchorClick('faq')} className="hover:text-green-600">FAQ</button>
              <Link to="/contact" className="hover:text-green-600">Contact</Link>
            </>
          )}

          {!loadingAuth && (
            user ? (
              <>
                <Link to="/home" className="hover:text-green-600">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md font-medium hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : !isAuthPage && (
              <>
                <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700">
                  Sign Up
                </Link>
                <Link to="/login" className="bg-white text-green-600 border border-green-600 px-4 py-2 rounded-md font-medium hover:bg-green-50">
                  Login
                </Link>
              </>
            )
          )}
        </nav>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-t">
          <nav className="flex flex-col gap-4 text-base font-medium">
            {!user && (
              <>
                <button onClick={() => handleAnchorClick('about')}>About Us</button>
                <button onClick={() => handleAnchorClick('impact')}>Impact</button>
                <button onClick={() => handleAnchorClick('manifesto')}>Manifesto</button>
                <button onClick={() => handleAnchorClick('faq')}>FAQ</button>
                <Link to="/contact" onClick={closeMenu}>Contact</Link>
              </>
            )}

            {!loadingAuth && (
              user ? (
                <>
                  <Link to="/home" onClick={closeMenu} className="hover:text-green-600">Dashboard</Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : !isAuthPage && (
                <div className="flex gap-3">
                  <Link to="/signup" onClick={closeMenu} className="flex-1 bg-white text-green-600 border border-green-600 px-4 py-2 text-center rounded-md">
                    Sign Up
                  </Link>
                  <Link to="/login" onClick={closeMenu} className="flex-1 bg-green-600 text-white px-4 py-2 text-center rounded-md">
                    Login
                  </Link>
                </div>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
