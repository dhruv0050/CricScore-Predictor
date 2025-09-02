import pickle
import json
import numpy as np

# Load model and data
def load_artifacts():
    """Load the trained model and columns data"""
    with open("artifacts/cricscore_predictor.pickle", "rb") as f:
        model = pickle.load(f)
    
    with open("artifacts/columns.json", "r") as f:
        columns_data = json.load(f)
    
    with open("artifacts/venue_avgscore.json", "r") as f:
        venue_data = json.load(f)
    
    return model, columns_data, venue_data

# Get average score for a venue
def get_average_score(country, venue, venue_data):
    """Get average score for a specific venue"""
    try:
        if country in venue_data and venue in venue_data[country]:
            return venue_data[country][venue]
        else:
            # Return a default average score if venue not found
            return 160  # Default T20 average score
    except:
        return 160

# Predict final score
def predict_score(delivery_left, score, current_run_rate, wickets_left, 
                 run_in_last5, wickets_in_last5, average_score):
    """Predict the final cricket score"""
    try:
        model, columns_data, venue_data = load_artifacts()
        
        # Create input array in the same order as training data
        input_features = [
            average_score,      # averagescore
            delivery_left,      # delivery_left
            score,              # score
            current_run_rate,   # currentrunrate
            wickets_left,       # wicketsleft
            run_in_last5,       # run_in_last5
            wickets_in_last5    # wickets_in_last5
        ]
        
        # Convert to numpy array and reshape for prediction
        input_array = np.array(input_features).reshape(1, -1)
        
        # Make prediction
        predicted_score = model.predict(input_array)[0]
        
        # Round to nearest integer (scores are whole numbers)
        return round(predicted_score)
        
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        return None

# Get all available venues
def get_all_venues(venue_data):
    """Get all available venues grouped by country"""
    return venue_data