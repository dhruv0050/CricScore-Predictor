from flask import Flask, request, jsonify
from flask_cors import CORS 
import utils

app = Flask(__name__)
CORS(app)

@app.route('/predict_score', methods=['POST'])
def predict_final_score():
    """Predict the final cricket score based on current match situation"""
    try:
        # Get data from request
        data = request.get_json()
        
        # Extract required parameters
        country = data.get('country')
        venue = data.get('venue')
        delivery_left = data.get('delivery_left')
        score = data.get('score')
        current_run_rate = data.get('current_run_rate')
        wickets_left = data.get('wickets_left')
        run_in_last5 = data.get('run_in_last5')
        wickets_in_last5 = data.get('wickets_in_last5')
        
        # Validate required parameters
        if None in [country, venue, delivery_left, score, current_run_rate, 
                   wickets_left, run_in_last5, wickets_in_last5]:
            return jsonify({
                'error': 'Missing required parameters',
                'required': ['country', 'venue', 'delivery_left', 'score', 
                           'current_run_rate', 'wickets_left', 'run_in_last5', 'wickets_in_last5']
            }), 400
        
        # Load venue data and get average score
        _, _, venue_data = utils.load_artifacts()
        average_score = utils.get_average_score(country, venue, venue_data)
        
        # Make prediction
        predicted_score = utils.predict_score(
            delivery_left=delivery_left,
            score=score,
            current_run_rate=current_run_rate,
            wickets_left=wickets_left,
            run_in_last5=run_in_last5,
            wickets_in_last5=wickets_in_last5,
            average_score=average_score
        )
        
        if predicted_score is None:
            return jsonify({'error': 'Prediction failed'}), 500
        
        return jsonify({
            'predicted_final_score': predicted_score,
            'venue_average_score': average_score,
            'input_data': {
                'country': country,
                'venue': venue,
                'current_score': score,
                'deliveries_left': delivery_left,
                'wickets_left': wickets_left,
                'current_run_rate': current_run_rate,
                'runs_in_last_5_overs': run_in_last5,
                'wickets_in_last_5_overs': wickets_in_last5
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/venues', methods=['GET'])
def get_venues():
    """Get all available venues grouped by country"""
    try:
        _, _, venue_data = utils.load_artifacts()
        return jsonify(venue_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == "__main__":
    print("Starting Python Flask Server For Cricket Score Prediction...")
    app.run(debug=True, host='0.0.0.0', port=5000)          