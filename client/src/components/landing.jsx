import React from 'react';
import {useNavigate} from 'react-router-dom';
function Landing() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/predict');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-slate-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-stone-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Cricket-themed floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-white opacity-10 text-4xl animate-bounce">🏏</div>
        <div className="absolute top-40 right-20 text-white opacity-10 text-3xl animate-bounce" style={{animationDelay: '1s'}}>⚾</div>
        <div className="absolute bottom-32 left-20 text-white opacity-10 text-5xl animate-bounce" style={{animationDelay: '2s'}}>🏆</div>
        <div className="absolute bottom-20 right-10 text-white opacity-10 text-3xl animate-bounce" style={{animationDelay: '3s'}}>📊</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main content container */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl hover:bg-white/10 transition-all duration-700 group">
          
          {/* Header section */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <span className="text-3xl">🏏</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-100 via-slate-200 to-stone-200 bg-clip-text text-transparent mb-4 leading-tight">
              CricScore Predictor
            </h1>
            
            <div className="w-24 h-1 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full mx-auto mb-6"></div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
            Harness the power of advanced machine learning to predict T20 innings scores with precision. 
            Simply select your venue, input live match data, and receive instant, intelligent predictions 
            backed by comprehensive cricket analytics.
          </p>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-sm font-semibold text-white mb-1">Precision Analytics</h3>
              <p className="text-xs text-gray-300">Using Random Forest Algorithm</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-sm font-semibold text-white mb-1">Real-time Results</h3>
              <p className="text-xs text-gray-300">Instant score predictions</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-sm font-semibold text-white mb-1">Data-driven</h3>
              <p className="text-xs text-gray-300">Comprehensive match analysis</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="relative">
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-slate-600 via-gray-600 to-stone-600 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-gray-700 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;