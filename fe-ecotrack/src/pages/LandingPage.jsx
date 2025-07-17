import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaRecycle,
  FaLeaf,
  FaMapMarkerAlt,
  FaGamepad,
  FaQuestionCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const faqs = [
    {
      q: "What is EcoTrack?",
      a: "EcoTrack is a movement platform that helps individuals track their recycling efforts and contribute to collective environmental change.",
    },
    {
      q: "How do I earn points?",
      a: "By logging your recycling activities and visiting drop-off points, you can collect points that reflect your personal impact.",
    },
    {
      q: "What can I do with my points?",
      a: "In future versions, points may be redeemable for eco-rewards or used to access community events and partner perks.",
    },
    {
      q: "Is EcoTrack available everywhere?",
      a: "We’re starting in Singapore as our pilot location, and plan to expand across Southeast Asia in collaboration with NGOs and local governments.",
    },
    {
      q: "How can I be part of the movement?",
      a: "Just sign up and start tracking. Every small step you take inspires others and builds a culture of sustainability.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow">
        <div className="flex items-center justify-between px-6 md:px-20 py-5">
          <div className="flex items-center gap-2 text-green-600 text-2xl font-bold">
            <FaRecycle />
            EcoTrack
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm md:text-base font-medium">
            <a href="#home" className="hover:text-green-600">Home</a>
            <a href="#about" className="hover:text-green-600">About Us</a>
            <a href="#impact" className="hover:text-green-600">Impact</a>
            <a href="#manifesto" className="hover:text-green-600">Manifesto</a>
            <a href="#faqs" className="hover:text-green-600">FAQ</a>
            <Link to="/contact" className="hover:text-green-600">Contact</Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signup" className="text-green-600 font-semibold hover:underline">Sign Up</Link>
            <Link to="/login">
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                Login
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-2xl text-green-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden px-6 pt-3 pb-4 flex flex-col space-y-3 border-t">
            <a href="#home">Home</a>
            <a href="#about">About Us</a>
            <a href="#impact">Impact</a>
            <a href="#manifesto">Manifesto</a>
            <a href="#faqs">FAQ</a>
            <Link to="/contact">Contact</Link>
            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/signup"
                className="text-green-600 font-semibold border border-green-600 px-4 py-2 rounded-md w-1/2 text-center hover:bg-green-50 transition"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="bg-green-600 text-white px-4 py-2 rounded-md w-1/2 text-center hover:bg-green-700 transition"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="flex flex-col-reverse md:flex-row items-center justify-between px-8 md:px-20 pt-10 md:pt-24 pb-20" data-aos="fade-up">
        <div className="md:w-1/2 space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">Waste Less,</h1>
          <div className="flex items-center gap-3 text-green-600 text-5xl font-bold">
            <FaRecycle className="text-4xl md:text-5xl" />
            <span>Live More</span>
          </div>
          <p className="text-gray-600 text-lg mt-2 max-w-lg">
            EcoTrack helps you take part in a movement—not just manage waste.
            Track your impact, join your community, and be a part of something bigger than yourself.
          </p>
          <Link to="/login">
            <button className="bg-green-600 text-white px-6 py-3 rounded-md text-base hover:bg-green-700 transition mt-6">
              Start Your Journey
            </button>
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
          <img
            src="/recycle.jpg"
            alt="Recycling visual"
            className="rounded-xl shadow-xl w-full max-w-md object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="bg-green-50 py-16 px-6 md:px-20" data-aos="fade-up">
        <h2 className="text-3xl font-bold text-center mb-10">Why EcoTrack?</h2>
        <div className="flex flex-col md:flex-row justify-around text-center gap-8">
          <div>
            <FaLeaf className="text-green-600 text-3xl mx-auto mb-2" />
            <h3 className="font-bold">Eco-Friendly</h3>
            <p className="text-gray-600">Rewarding habits that nurture the planet, not harm it.</p>
          </div>
          <div>
            <FaGamepad className="text-green-600 text-3xl mx-auto mb-2" />
            <h3 className="font-bold">Gamified Experience</h3>
            <p className="text-gray-600">Make change fun through points, challenges, and progress.</p>
          </div>
          <div>
            <FaMapMarkerAlt className="text-green-600 text-3xl mx-auto mb-2" />
            <h3 className="font-bold">Find Drop-Offs</h3>
            <p className="text-gray-600">Discover nearby centers and contribute easily.</p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="bg-white py-16 text-center px-6 md:px-20" data-aos="fade-up">
        <h2 className="text-3xl font-bold mb-6">Environmental Impact</h2>
        <p className="text-gray-600 mb-10 max-w-3xl mx-auto">
          Every plastic item recycled means one less harming nature. Together, we reduce emissions, fight pollution, and lead a shift toward sustainability.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-green-100 p-6 rounded-lg shadow">
            <p className="text-4xl font-bold text-green-700">30%</p>
            <p className="mt-2 text-gray-700">Less Plastic Waste</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow">
            <p className="text-4xl font-bold text-green-700">50%</p>
            <p className="mt-2 text-gray-700">Pollution Reduction</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow">
            <p className="text-4xl font-bold text-green-700">20%</p>
            <p className="mt-2 text-gray-700">Lower Emissions</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 italic">
          Sources: ScienceDirect, EPA, UNEP
        </p>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="bg-white py-20 px-6 md:px-20 text-center border-y" data-aos="fade-up">
        <h2 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-6">
          This Is Our Manifesto
        </h2>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          We believe change doesn’t come from grand gestures — it comes from the daily
          choices of everyday people. We are not just recycling. We are reclaiming our future.
          <br className="hidden md:block" />
          <span className="inline-block mt-4 font-semibold text-green-600">
            Join a movement that turns waste into purpose.
          </span>
        </p>
        <div className="mt-10">
          <Link to="/signup">
            <button className="bg-green-600 text-white px-8 py-3 rounded-md text-lg hover:bg-green-700 transition shadow">
              Be Part of the Movement
            </button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="bg-green-50 py-16 px-6 md:px-20" data-aos="fade-up">
        <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map(({ q, a }, i) => (
            <details key={i} className="bg-white p-4 rounded-md shadow">
              <summary className="cursor-pointer font-semibold text-lg flex items-center gap-2">
                <FaQuestionCircle className="text-green-600" />
                {q}
              </summary>
              <p className="mt-2 text-gray-700">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 px-6 md:px-20 text-center border-t">
        <p className="text-gray-600 text-sm">© 2025 EcoTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}
