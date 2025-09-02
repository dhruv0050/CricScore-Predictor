import React from 'react';
import { Link } from 'react-router-dom';

// You can replace this URL with any high-quality cricket image you like.
const backgroundImageUrl = 'https://images.unsplash.com/photo-1599589638199-35c8a710e64f?q=80&w=2070';

function Landing() {
  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center text-center text-white font-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${backgroundImageUrl}')`
      }}
    >
      <div className="max-w-2xl p-8 bg-black bg-opacity-50 rounded-xl shadow-lg backdrop-blur-sm">
        <h1 className="text-5xl font-bold mb-4">
          CricScore Predictor 🏏
        </h1>
        <p className="text-lg mb-8 leading-relaxed">
          Leveraging machine learning to predict the final score of a T20 innings based on the current match situation. Select the venue, enter the live match data, and get an instant score prediction.
        </p>
        <Link
          to="/predict"
          className="inline-block py-3 px-6 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-transform duration-300 shadow-md"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Landing;