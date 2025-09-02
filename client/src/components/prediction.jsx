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

  // 🔽 FIX 1: This line was missing. It declares the state for the prediction result.
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

  const handleSubmit = (e) => {
    e.preventDefault();
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

    // 🔽 FIX 2: Corrected the typo in the IP address (1227 -> 127)
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Form Card */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl mb-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Predict T20 Score</h2>
        <form onSubmit={handleSubmit}>
          {/* Row 1: Country & Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Country</label>
              <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {Object.keys(venues).map(country => <option key={country} value={country}>{country}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Venue</label>
              <select value={selectedVenue} onChange={e => setSelectedVenue(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {selectedCountry && venues[selectedCountry] && Object.keys(venues[selectedCountry]).map(venue => <option key={venue} value={venue}>{venue}</option>)}
              </select>
            </div>
          </div>
          
          {/* Row 2: Primary Match Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Current Score</label>
              <input type="number" name="score" value={formData.score} onChange={handleInputChange} required placeholder="e.g., 94" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Current Over</label>
              <input type="number" step="0.1" name="overs" value={formData.overs} onChange={handleInputChange} required placeholder="e.g., 11.4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Wickets Fallen</label>
              <input type="number" name="wicketsFallen" value={formData.wicketsFallen} onChange={handleInputChange} required placeholder="e.g., 1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          
          {/* Row 3: Auto-Calculated Fields (Disabled) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-400">Wickets Left</label>
              <input type="number" name="wickets_left" value={derivedData.wickets_left} disabled className="w-full p-3 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed" />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-400">Deliveries Left</label>
              <input type="number" name="delivery_left" value={derivedData.delivery_left} disabled className="w-full p-3 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed" />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-400">Current Run Rate</label>
              <input type="number" step="0.01" name="current_run_rate" value={derivedData.current_run_rate} disabled className="w-full p-3 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed" />
            </div>
          </div>

          {/* Row 4: Last 5 Overs Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Runs in Last 5 Overs</label>
              <input type="number" name="run_in_last5" value={formData.run_in_last5} onChange={handleInputChange} required placeholder="e.g., 42" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Wickets in Last 5 Overs</label>
              <input type="number" name="wickets_in_last5" value={formData.wickets_in_last5} onChange={handleInputChange} required placeholder="e.g., 1" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          
          {formError && <p className="text-red-500 text-center mb-4 font-semibold">{formError}</p>}

          <button type="submit" disabled={loading || !!formError} className="w-full py-4 mt-2 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-md">
            {loading ? 'Predicting...' : 'Predict Score'}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4 font-semibold">{error}</p>}
      </div>

      {/* Result Card */}
      {predictionResult && (
        <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-xl text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Prediction Result</h3>
          <div className="flex justify-center items-baseline">
            <p className="text-7xl font-bold text-blue-600">{predictionResult.predicted_final_score}</p>
            <span className="text-2xl text-gray-500 ml-2">runs</span>
          </div>
          <p className="text-lg text-gray-600 mt-4">
            The predicted final score is around <strong>{predictionResult.predicted_final_score}</strong>.
          </p>
          <p className="text-md text-gray-500 mt-2">
            (Venue Average: {predictionResult.venue_average_score} runs)
          </p>
        </div>
      )}
    </div>
  );
}

export default Prediction;