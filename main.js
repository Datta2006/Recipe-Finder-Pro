// Global variables
let selectedIngredients = [];
let allIngredients = [];
let allRecipes = [];
let currentPage = 0;
const ingredientsPerPage = 20;

// DOM Elements
const ingredientList = document.getElementById('ingredient-list');
const selectedIngredientsContainer = document.getElementById('selected-ingredients');
const allRecipesContainer = document.querySelector('#all-recipes .recipe-grid');
const matchingRecipesContainer = document.querySelector('#matching-recipes .recipe-grid');
const recipeModal = document.getElementById('recipe-modal');
const recipeForm = document.getElementById('recipe-form');
const recipeIngredientsList = document.getElementById('recipe-ingredients-list');
const selectedRecipeIngredients = document.getElementById('selected-recipe-ingredients');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadIngredients();
    loadAllRecipes();
});

// Load ingredients from API
async function loadIngredients() {
    try {
        const response = await fetch('http://localhost:3000/ingredients');
        if (!response.ok) throw new Error('Failed to fetch ingredients');
        
        allIngredients = await response.json();
        displayIngredients(currentPage);
        updateSelectedIngredientsDisplay();
    } catch (error) {
        console.error('Error loading ingredients:', error);
        showError('Failed to load ingredients. Please try again later.');
    }
}

// Display ingredients with pagination
function displayIngredients(page) {
    currentPage = page;
    ingredientList.innerHTML = '';

    const start = page * ingredientsPerPage;
    const end = Math.min(start + ingredientsPerPage, allIngredients.length);
    const paginatedIngredients = allIngredients.slice(start, end);

    paginatedIngredients.forEach(ingredient => {
        const isSelected = selectedIngredients.includes(ingredient.name);
        const item = document.createElement('div');
        item.className = `ingredient-item ${isSelected ? 'selected' : ''}`;
        item.innerHTML = `
            <label>
                <input type="checkbox" value="${ingredient.name}" ${isSelected ? 'checked' : ''} 
                    onchange="toggleIngredient('${ingredient.name}')">
                ${ingredient.name}
            </label>
        `;
        ingredientList.appendChild(item);
    });

    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(allIngredients.length / ingredientsPerPage);
    
    if (currentPage > 0) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'secondary-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => displayIngredients(currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    const pageInfo = document.createElement('span');
    pageInfo.style.margin = '0 10px';
    pageInfo.style.display = 'flex';
    pageInfo.style.alignItems = 'center';
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    pagination.appendChild(pageInfo);
    
    if (currentPage < totalPages - 1) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'secondary-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => displayIngredients(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

// Filter ingredients based on search term
function filterIngredients() {
    const searchTerm = document.getElementById('ingredient-search').value.toLowerCase();
    
    if (!searchTerm) {
        displayIngredients(currentPage);
        return;
    }
    
    const filtered = allIngredients.filter(ing => 
        ing.name.toLowerCase().includes(searchTerm)
    );
    
    ingredientList.innerHTML = '';
    
    filtered.forEach(ing => {
        const isSelected = selectedIngredients.includes(ing.name);
        const item = document.createElement('div');
        item.className = `ingredient-item ${isSelected ? 'selected' : ''}`;
        item.innerHTML = `
            <label>
                <input type="checkbox" value="${ing.name}" ${isSelected ? 'checked' : ''} 
                    onchange="toggleIngredient('${ing.name}')">
                ${ing.name}
            </label>
        `;
        ingredientList.appendChild(item);
    });
    
    document.getElementById('pagination').innerHTML = '';
}

// Toggle ingredient selection
function toggleIngredient(name) {
    if (selectedIngredients.includes(name)) {
        selectedIngredients = selectedIngredients.filter(i => i !== name);
    } else {
        selectedIngredients.push(name);
    }
    
    updateSelectedIngredientsDisplay();
    const searchTerm = document.getElementById('ingredient-search').value;
    searchTerm ? filterIngredients() : displayIngredients(currentPage);
}

// Update selected ingredients display
function updateSelectedIngredientsDisplay() {
    selectedIngredientsContainer.innerHTML = '';
    
    if (selectedIngredients.length === 0) {
        selectedIngredientsContainer.innerHTML = '<span>No ingredients selected</span>';
        return;
    }
    
    selectedIngredients.forEach(ing => {
        const chip = document.createElement('div');
        chip.className = 'selected-chip';
        chip.innerHTML = `
            ${ing}
            <i class="fas fa-times" onclick="removeSelectedIngredient('${ing}')"></i>
        `;
        selectedIngredientsContainer.appendChild(chip);
    });
}

// Remove selected ingredient
function removeSelectedIngredient(name) {
    selectedIngredients = selectedIngredients.filter(i => i !== name);
    updateSelectedIngredientsDisplay();
    
    // Uncheck the corresponding checkbox
    document.querySelectorAll(`input[value="${name}"]`).forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.parentElement.classList.remove('selected');
    });
}

// Clear all selected ingredients
function clearSelection() {
    selectedIngredients = [];
    updateSelectedIngredientsDisplay();
    
    document.querySelectorAll('.ingredient-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.parentElement.classList.remove('selected');
    });
}

// Load all recipes
async function loadAllRecipes() {
    try {
        const response = await fetch('http://localhost:3000/recipes');
        if (!response.ok) throw new Error('Failed to fetch recipes');
        
        allRecipes = await response.json();
        displayRecipes(allRecipes, allRecipesContainer);
    } catch (error) {
        console.error('Error loading recipes:', error);
        showError('Failed to load recipes. Please try again later.');
    }
}

// Display recipes in the specified container
function displayRecipes(recipes, container) {
    container.innerHTML = '';
    
    if (recipes.length === 0) {
        container.innerHTML = '<p>No recipes found</p>';
        return;
    }
    
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-image" style="background-image: url('https://source.unsplash.com/random/300x200/?${encodeURIComponent(recipe.name)},food')"></div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span>${recipe.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                    <span>${recipe.difficulty}</span>
                </div>
                <button class="btn primary-btn" onclick="startRecipe('${recipe.id}')" style="width: 100%;">
                    <i class="fas fa-play"></i> View Recipe
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Search for recipes based on selected ingredients
async function searchRecipes() {
    if (selectedIngredients.length === 0) {
        showError('Please select at least one ingredient');
        return;
    }
    
    try {
        matchingRecipesContainer.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Searching recipes...</div>';
        
        const response = await fetch('http://localhost:3000/recipes/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: selectedIngredients })
        });
        
        if (!response.ok) throw new Error('Failed to search recipes');
        
        const recipes = await response.json();
        
        // Get full details for each recipe to calculate match percentage
        const recipesWithDetails = await Promise.all(recipes.map(async recipe => {
            const detailResponse = await fetch(`http://localhost:3000/recipes/${recipe.id}`);
            if (!detailResponse.ok) throw new Error('Failed to fetch recipe details');
            
            const details = await detailResponse.json();
            const matchedIngredients = selectedIngredients.filter(ing => 
                details.ingredients.some(ri => ri.name === ing)
            );
            
            return {
                ...recipe,
                ingredients: details.ingredients,
                steps: details.steps,
                matchPercentage: Math.round((matchedIngredients.length / details.ingredients.length) * 100)
            };
        }));
        
        displayMatchingRecipes(recipesWithDetails);
        showTab('matching-recipes');
    } catch (error) {
        console.error('Error searching recipes:', error);
        showError('Failed to search recipes. Please try again.');
        matchingRecipesContainer.innerHTML = '';
    }
}

// Display matching recipes with match percentage
function displayMatchingRecipes(recipes) {
    matchingRecipesContainer.innerHTML = '';
    
    if (recipes.length === 0) {
        matchingRecipesContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No matching recipes found</h3>
                <p>Try selecting different ingredients</p>
            </div>
        `;
        return;
    }
    
    // Sort by match percentage (highest first)
    recipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    recipes.forEach(recipe => {
        const matchedCount = selectedIngredients.filter(ing => 
            recipe.ingredients.some(ri => ri.name === ing)
        ).length;
        
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-image" style="background-image: url('https://source.unsplash.com/random/300x200/?${encodeURIComponent(recipe.name)},food')"></div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span>${recipe.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                    <span>${recipe.difficulty}</span>
                </div>
                <div class="recipe-match-info">
                    <i class="fas fa-check-circle"></i> ${recipe.matchPercentage}% match (${matchedCount}/${recipe.ingredients.length})
                </div>
                <button class="btn primary-btn" onclick="startRecipe('${recipe.id}')" style="width: 100%;">
                    <i class="fas fa-play"></i> Start Cooking
                </button>
            </div>
        `;
        matchingRecipesContainer.appendChild(card);
    });
}

// Start cooking a recipe
async function startRecipe(id) {
    try {
        const response = await fetch(`http://localhost:3000/recipes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch recipe details');
        
        const recipe = await response.json();
        displayRecipeSteps(recipe);
    } catch (error) {
        console.error('Error starting recipe:', error);
        showError('Failed to load recipe. Please try again.');
    }
}

// Display recipe steps for cooking
function displayRecipeSteps(recipe) {
    const resultsContainer = document.querySelector('.results-container');
    resultsContainer.innerHTML = `
        <div class="recipe-detail">
            <div class="recipe-header">
                <h2>${recipe.name}</h2>
                <div class="recipe-meta">
                    <span>${recipe.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                    <span>${recipe.difficulty}</span>
                </div>
            </div>
            
            <div class="ingredients-section">
                <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                <div class="ingredients-list">
                    ${recipe.ingredients.map(ing => `
                        <div class="ingredient-item">
                            <input type="checkbox" id="ing-${ing.id}">
                            <label for="ing-${ing.id}">${ing.name}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="steps-section">
                <h3><i class="fas fa-list-ol"></i> Cooking Steps</h3>
                <div id="steps-container"></div>
            </div>
        </div>
    `;

    const stepsContainer = document.getElementById('steps-container');
    let currentStep = 0;

    function showStep() {
        if (currentStep >= recipe.steps.length) {
            stepsContainer.innerHTML = `
                <div class="completion-message">
                    <i class="fas fa-check-circle"></i>
                    <h3>Recipe Completed!</h3>
                    <p>Great job cooking ${recipe.name}!</p>
                    <button class="btn primary-btn" onclick="location.reload()">
                        <i class="fas fa-home"></i> Return to Recipes
                    </button>
                </div>
            `;
            return;
        }

        const step = recipe.steps[currentStep];
        stepsContainer.innerHTML = `
            <div class="step">
                <div class="step-header">
                    <span class="step-number">Step ${currentStep + 1} of ${recipe.steps.length}</span>
                </div>
                <div class="step-content">
                    <p>${step.description}</p>
                    ${step.time_seconds > 0 ? `
                        <div class="timer-container">
                            <div class="timer" id="timer">${formatTime(step.time_seconds)}</div>
                            <button class="btn secondary-btn" id="skip-timer">
                                Skip Timer
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="step-actions">
                    <button class="btn primary-btn" id="next-step">
                        ${currentStep === recipe.steps.length - 1 ? 'Finish' : 'Next Step'}
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        if (step.time_seconds > 0) {
            let remainingTime = step.time_seconds;
            const timerElement = document.getElementById('timer');
            const timerInterval = setInterval(() => {
                remainingTime--;
                timerElement.textContent = formatTime(remainingTime);
                if (remainingTime <= 0) {
                    clearInterval(timerInterval);
                }
            }, 1000);

            document.getElementById('skip-timer').onclick = () => {
                clearInterval(timerInterval);
                currentStep++;
                showStep();
            };
        }

        document.getElementById('next-step').onclick = () => {
            currentStep++;
            showStep();
        };
    }

    showStep();
}

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Show/hide tabs
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-btn[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Recipe form functionality
function showRecipeForm() {
    recipeModal.style.display = 'block';
    loadIngredientsForForm();
    initializeRecipeForm();
}

function closeModal() {
    recipeModal.style.display = 'none';
}

function initializeRecipeForm() {
    // Reset form
    recipeForm.reset();
    document.getElementById('recipe-steps').innerHTML = '';
    selectedRecipeIngredients.innerHTML = '';
    
    // Add first step
    addStep();
}

async function loadIngredientsForForm() {
    try {
        const response = await fetch('http://localhost:3000/ingredients');
        if (!response.ok) throw new Error('Failed to fetch ingredients');
        
        const ingredients = await response.json();
        displayIngredientsForForm(ingredients);
    } catch (error) {
        console.error('Error loading ingredients for form:', error);
        showError('Failed to load ingredients for recipe form.');
    }
}

function displayIngredientsForForm(ingredients) {
    recipeIngredientsList.innerHTML = '';
    
    ingredients.forEach(ing => {
        const item = document.createElement('div');
        item.className = 'ingredient-item';
        item.innerHTML = `
            <label>
                <input type="checkbox" value="${ing.name}" onchange="toggleRecipeIngredient('${ing.name}', this)">
                ${ing.name}
            </label>
        `;
        recipeIngredientsList.appendChild(item);
    });
}

function toggleRecipeIngredient(name, checkbox) {
    if (checkbox.checked) {
        addRecipeIngredient(name);
    } else {
        removeRecipeIngredient(name);
    }
}

function addRecipeIngredient(name) {
    const chip = document.createElement('div');
    chip.className = 'selected-chip';
    chip.innerHTML = `
        ${name}
        <i class="fas fa-times" onclick="removeRecipeIngredient('${name}')"></i>
    `;
    chip.dataset.name = name;
    selectedRecipeIngredients.appendChild(chip);
}

function removeRecipeIngredient(name) {
    document.querySelector(`.selected-chip[data-name="${name}"]`).remove();
    document.querySelector(`#recipe-ingredients-list input[value="${name}"]`).checked = false;
}

function filterRecipeIngredients() {
    const searchTerm = document.getElementById('recipe-ingredient-search').value.toLowerCase();
    
    document.querySelectorAll('#recipe-ingredients-list .ingredient-item').forEach(item => {
        const ingredientName = item.textContent.toLowerCase();
        item.style.display = ingredientName.includes(searchTerm) ? 'block' : 'none';
    });
}

function addStep() {
    const stepsContainer = document.getElementById('recipe-steps');
    const stepCount = stepsContainer.children.length + 1;
    
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    stepItem.innerHTML = `
        <div class="step-header">
            <div class="step-number">${stepCount}</div>
            <div class="step-controls">
                <button type="button" class="step-btn remove" onclick="removeStep(this)">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
        <div class="step-content">
            <textarea class="step-description" placeholder="Describe this cooking step in detail..." required></textarea>
            <div class="step-time-container">
                <label class="step-time-label">Duration (seconds)</label>
                <input type="number" class="step-time" placeholder="Optional" min="0">
            </div>
        </div>
    `;
    
    stepsContainer.appendChild(stepItem);
}

function removeStep(button) {
    const stepsContainer = document.getElementById('recipe-steps');
    if (stepsContainer.children.length > 1) {
        button.closest('.step-item').remove();
        updateStepNumbers();
    } else {
        showError('A recipe must have at least one step');
    }
}

function updateStepNumbers() {
    document.querySelectorAll('#recipe-steps .step-item').forEach((step, index) => {
        step.querySelector('.step-number').textContent = index + 1;
    });
}

// Handle recipe form submission
recipeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('recipe-name').value.trim();
    const is_veg = document.getElementById('recipe-type').value === '1';
    const difficulty = document.getElementById('recipe-difficulty').value;
    
    // Get selected ingredients
    const ingredients = Array.from(selectedRecipeIngredients.children).map(chip => chip.dataset.name);
    
    // Get steps
    const steps = [];
    document.querySelectorAll('#recipe-steps .step-item').forEach(step => {
        const description = step.querySelector('.step-description').value.trim();
        const timeInput = step.querySelector('.step-time');
        const time_seconds = timeInput.value ? parseInt(timeInput.value) : 0;
        
        if (description) {
            steps.push({ description, time_seconds });
        }
    });
    
    // Validate form
    if (!name) {
        showError('Please enter a recipe name');
        return;
    }
    
    if (ingredients.length === 0) {
        showError('Please select at least one ingredient');
        return;
    }
    
    if (steps.length === 0) {
        showError('Please add at least one step');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, is_veg, difficulty, ingredients, steps })
        });
        
        if (!response.ok) throw new Error('Failed to save recipe');
        
        const newRecipe = await response.json();
        showSuccess('Recipe added successfully!');
        closeModal();
        loadAllRecipes();
    } catch (error) {
        console.error('Error saving recipe:', error);
        showError('Failed to save recipe. Please try again.');
    }
});

// Show success message
function showSuccess(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message success';
    messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Show error message
function showError(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message error';
    messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === recipeModal) {
        closeModal();
    }
});