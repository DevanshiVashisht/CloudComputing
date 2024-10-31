from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
import requests
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set up MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['recipe_recommender']  # Replace with your actual database name

@app.route('/recommend', methods=['POST'])
def recommend_recipe():
    try:
        data = request.get_json()
        print("Received data:", data)  # Log incoming data

        if not data:
            print("No data received.")
            return jsonify({"error": "No data received."}), 400

        # Validate required fields
        dietary_preference = data.get('dietary_preference')
        ingredients = data.get('ingredients')

        if not dietary_preference or not ingredients:
            print("Missing required fields.")
            return jsonify({"error": "Missing required fields."}), 400
        
        # Save user preferences to MongoDB
        db.preferences.insert_one(data)

        # Make an API call to Spoonacular to fetch recipes
        api_key = 'c567fb7562e44aab825843dfdf8a44a9'  # Replace with your actual API key
        url = f'https://api.spoonacular.com/recipes/findByIngredients?ingredients={ingredients}&apiKey={api_key}'
        
        # Fetch recipes from the API
        response = requests.get(url)
        
        print("Spoonacular API response status code:", response.status_code)  # Log the response status
        if response.status_code == 200:
            recipes = response.json()
            return jsonify({"recommendations": recipes})
        elif response.status_code == 402:
            print("Error fetching from Spoonacular: Daily limit reached.")  # Log the error response
            return jsonify({"error": "Daily limit reached. Please upgrade your plan."}), 402
        else:
            print("Error fetching from Spoonacular:", response.status_code, response.json())  # Log other errors
            return jsonify({"error": "Failed to fetch recipes from the API."}), 500

    except Exception as e:
        print("An error occurred:", str(e))  # Log the error
        return jsonify({"error": "An internal error occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True)
