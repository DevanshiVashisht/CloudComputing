document.getElementById('recipe-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    // Show loading message
    const recommendationsDiv = document.getElementById('recommendations');
    recommendationsDiv.innerHTML = '<p>Loading recommendations...</p>';

    const dietaryPreference = document.getElementById('dietary-preference').value;
    const ingredients = document.getElementById('ingredients').value;

    const response = await fetch('http://127.0.0.1:5000/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            dietary_preference: dietaryPreference,
            ingredients: ingredients,
        }),
    });

    const data = await response.json();
    recommendationsDiv.innerHTML = ''; // Clear previous recommendations

    if (data.recommendations && data.recommendations.length > 0) {
        recommendationsDiv.innerHTML = '<h2>Recommended Recipes:</h2>';
        data.recommendations.forEach((recipe, index) => {
            // Get used ingredients with prices, ensuring price is displayed only if defined
            const usedIngredients = recipe.usedIngredients.map(ingredient => 
                `${ingredient.name}${ingredient.price !== undefined ? ` ($${ingredient.price})` : ''}`).join(', ') || 'No ingredients available';

            // Get other ingredients (missed ingredients) with prices
            const otherIngredients = recipe.missedIngredients.map(ingredient => 
                `${ingredient.name}${ingredient.price !== undefined ? ` ($${ingredient.price})` : ''}`).join(', ') || 'No other ingredients';

            recommendationsDiv.innerHTML += `
                <div class="recipe">
                    <h3>Recipe ${index + 1}: ${recipe.title}</h3>
                    <div class="ingredients-list">
                        <strong>Used Ingredients:</strong>
                        <p>${usedIngredients}</p>
                        <strong>Other Ingredients:</strong>
                        <p>${otherIngredients}</p>
                    </div>
                    <button onclick="getRecipeDetails(${recipe.id})">View Details</button>
                    <div id="details-${recipe.id}" class="recipe-details"></div>
                </div>
            `;
        });
    } else {
        recommendationsDiv.innerHTML = '<p>No recommendations found.</p>';
    }
});

// Function to fetch recipe details
async function getRecipeDetails(recipeId) {
    const apiKey = 'c567fb7562e44aab825843dfdf8a44a9'; // Your actual API key
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    
    if (response.ok) {
        const recipeDetails = await response.json();
        console.log('Recipe Details:', recipeDetails); // Log the entire recipe details
        
        const detailsDiv = document.getElementById(`details-${recipeId}`);
        detailsDiv.innerHTML = `
            <h4>Instructions:</h4>
            <p>${recipeDetails.instructions || 'No instructions available.'}</p>
            <div class="image-container">
                <img src="${recipeDetails.image}" alt="${recipeDetails.title}" class="recipe-image"/>
            </div>
        `;
    } else {
        alert('Failed to fetch recipe details. Please try again later.');
    }
}

