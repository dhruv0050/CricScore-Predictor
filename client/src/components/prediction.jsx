import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Prediction() {
  // State for API data and selections
  const [venues, setVenues] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');

  // State for user inputs
  const [formData, setFormData] = useState({
    score: '',
    overs: '',
    wicketsFallen: '',
    run_in_last5: '',
    wickets_in_last5: '',
  });

  // State for values derived from user input
  const [derivedData, setDerivedData] = useState({
    delivery_left: '',
    wickets_left: '',
    current_run_rate: '',
  });

  const [predictionResult, setPredictionResult] = useState(null);
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // API errors
  const [formError, setFormError] = useState(''); // Real-time form validation errors
  
  // Effect to fetch venues on component mount
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/venues')
      .then(response => {
        setVenues(response.data);
        const firstCountry = Object.keys(response.data)[0];
        if (firstCountry) {
          setSelectedCountry(firstCountry);
        }
      })
      .catch(err => {
        console.error("Error fetching venues:", err);
        setError('Failed to load venue data. Please ensure the backend server is running.');
      });
  }, []);
  
  // Effect to set a default venue when country changes
  useEffect(() => {
    if (selectedCountry && venues[selectedCountry]) {
      const firstVenue = Object.keys(venues[selectedCountry])[0];
      setSelectedVenue(firstVenue || '');
    }
  }, [selectedCountry, venues]);

  // Main calculation logic runs whenever user inputs change
  useEffect(() => {
    const { score, overs, wicketsFallen } = formData;
    setFormError(''); // Clear previous errors

    // --- Wickets Left Calculation ---
    const wickets = parseInt(wicketsFallen);
    if (!isNaN(wickets) && wickets >= 0 && wickets <= 10) {
      setDerivedData(prev => ({ ...prev, wickets_left: 10 - wickets }));
    } else {
      setDerivedData(prev => ({ ...prev, wickets_left: '' }));
      if (wicketsFallen) setFormError('Wickets fallen must be between 0 and 10.');
    }

    // --- Deliveries Left & Run Rate Calculation ---
    const currentOvers = parseFloat(overs);
    const currentScore = parseInt(score);

    if (!isNaN(currentOvers) && currentOvers >= 0 && currentOvers <= 20) {
      const fullOvers = Math.floor(currentOvers);
      const ballsInCurrentOver = Math.round((currentOvers - fullOvers) * 10);

      if (ballsInCurrentOver > 5) {
        setFormError('Invalid over format. Balls can only be from 0 to 5.');
        setDerivedData(prev => ({ ...prev, delivery_left: '', current_run_rate: '' }));
        return;
      }
      
      const ballsBowled = fullOvers * 6 + ballsInCurrentOver;
      if (ballsBowled <= 120) {
        setDerivedData(prev => ({ ...prev, delivery_left: 120 - ballsBowled }));
        
        if (!isNaN(currentScore) && currentScore >= 0 && ballsBowled > 0) {
          const runRate = (currentScore / ballsBowled) * 6;
          setDerivedData(prev => ({ ...prev, current_run_rate: runRate.toFixed(2) }));
        } else {
          setDerivedData(prev => ({ ...prev, current_run_rate: '' }));
        }
      } else {
        setFormError('Overs cannot exceed 20.');
      }
    } else {
        setDerivedData(prev => ({ ...prev, delivery_left: '', current_run_rate: '' }));
        if (overs) setFormError('Overs must be between 0 and 20.');
    }

  }, [formData.overs, formData.wicketsFallen, formData.score]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    if (formError) {
      setError('Please fix the errors in the form before predicting.');
      return;
    }
    setLoading(true);
    setError('');
    setPredictionResult(null);

    const payload = {
      country: selectedCountry,
      venue: selectedVenue,
      score: parseFloat(formData.score),
      run_in_last5: parseFloat(formData.run_in_last5),
      wickets_in_last5: parseFloat(formData.wickets_in_last5),
      ...derivedData, // Add the auto-calculated values
    };

    axios.post('http://127.0.0.1:5000/predict_score', payload)
      .then(response => {
        setPredictionResult(response.data);
      })
      .catch(err => {
        console.error("Error fetching prediction:", err);
        setError('Prediction failed. Please check your inputs and try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-xl opacity-8 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-8 animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 right-10 w-64 h-64 bg-stone-400 rounded-full mix-blend-multiply filter blur-xl opacity-8 animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Floating cricket elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-16 text-white opacity-5 text-6xl animate-bounce" style={{animationDelay: '1s'}}>📊</div>
        <div className="absolute top-32 right-24 text-white opacity-5 text-4xl animate-bounce" style={{animationDelay: '2s'}}>🎯</div>
        <div className="absolute bottom-40 left-12 text-white opacity-5 text-5xl animate-bounce">🏏</div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-100 via-slate-200 to-stone-200 bg-clip-text text-transparent mb-2">
            Score Prediction
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full mx-auto"></div>
        </div>

        {/* Main Form Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="space-y-8">
            {/* Venue Selection */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-slate-400 rounded-full mr-3"></span>
                Match Venue
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Country</label>
                  <select 
                    value={selectedCountry} 
                    onChange={e => setSelectedCountry(e.target.value)} 
                    required 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  >
                    {Object.keys(venues).map(country => (
                      <option key={country} value={country} className="bg-slate-800">{country}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Venue</label>
                  <select 
                    value={selectedVenue} 
                    onChange={e => setSelectedVenue(e.target.value)} 
                    required 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  >
                    {selectedCountry && venues[selectedCountry] && Object.keys(venues[selectedCountry]).map(venue => (
                      <option key={venue} value={venue} className="bg-slate-800">{venue}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Current Match Status */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                Current Match Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Current Score</label>
                  <input 
                    type="number" 
                    name="score" 
                    value={formData.score} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., 94" 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Current Over</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="overs" 
                    value={formData.overs} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., 11.4" 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Wickets Fallen</label>
                  <input 
                    type="number" 
                    name="wicketsFallen" 
                    value={formData.wicketsFallen} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., 3" 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Auto-calculated Fields */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-400 mb-4 flex items-center">
                <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
                Auto-calculated Values
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Wickets Left</label>
                  <input 
                    type="number" 
                    name="wickets_left"
                    value={derivedData.wickets_left} 
                    disabled 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Deliveries Left</label>
                  <input 
                    type="number" 
                    name="delivery_left"
                    value={derivedData.delivery_left} 
                    disabled 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-500">Current Run Rate</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    name="current_run_rate"
                    value={derivedData.current_run_rate} 
                    disabled 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Last 5 Overs */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-stone-400 rounded-full mr-3"></span>
                Recent Performance (Last 5 Overs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Runs in Last 5 Overs</label>
                  <input 
                    type="number" 
                    name="run_in_last5" 
                    value={formData.run_in_last5} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., 42" 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Wickets in Last 5 Overs</label>
                  <input 
                    type="number" 
                    name="wickets_in_last5" 
                    value={formData.wickets_in_last5} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g., 1" 
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {formError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-300 text-center font-medium">{formError}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={loading || !!formError}
                className="w-full group relative overflow-hidden py-4 px-8 text-lg font-semibold text-white bg-gradient-to-r from-slate-600 via-gray-600 to-stone-600 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Analyzing Match Data...
                    </>
                  ) : (
                    <>
                      Predict Final Score
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-gray-700 to-stone-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>

          {/* General Error Display */}
          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-center font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Result Card */}
        {predictionResult && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl text-center animate-fade-in">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Prediction Result</h3>
            
            <div className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-2xl p-8 mb-6 border border-white/10">
              <div className="flex justify-center items-baseline mb-4">
                <span className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-transparent">
                  {predictionResult.predicted_final_score}
                </span>
                <span className="text-xl md:text-2xl text-gray-300 ml-3">runs</span>
              </div>
              
              <p className="text-lg text-gray-300 mb-2">
                Predicted final score based on current match dynamics
              </p>
              <p className="text-sm text-gray-400">
                Venue average: <span className="text-slate-300 font-semibold">{predictionResult.venue_average_score}</span> runs
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Prediction;