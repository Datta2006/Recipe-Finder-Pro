const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Datta@2006',
    database: 'cooking_app'
};

let conn;
mysql.createConnection(dbConfig).then(connection => {
    conn = connection;
    console.log("Connected to MySQL!");
}).catch(err => console.error(err));

// Add new recipe
app.post('/recipes', async (req, res) => {
    const { name, is_veg, difficulty, ingredients, steps } = req.body;

    try {
        // Start transaction
        await conn.beginTransaction();

        // Insert recipe
        const [recipeResult] = await conn.execute(
            'INSERT INTO recipes (name, is_veg, difficulty) VALUES (?, ?, ?)',
            [name, is_veg, difficulty]
        );
        const recipeId = recipeResult.insertId;

        // Process ingredients
        for (const ingName of ingredients) {
            let [ingRows] = await conn.execute('SELECT id FROM ingredients WHERE name = ?', [ingName]);
            let ingId;

            if (ingRows.length === 0) {
                const [insertIng] = await conn.execute('INSERT INTO ingredients (name) VALUES (?)', [ingName]);
                ingId = insertIng.insertId;
            } else {
                ingId = ingRows[0].id;
            }

            await conn.execute(
                'INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)',
                [recipeId, ingId]
            );
        }

        // Process steps
        for (const step of steps) {
            await conn.execute(
                'INSERT INTO steps (recipe_id, description, time_seconds) VALUES (?, ?, ?)',
                [recipeId, step.description, step.time_seconds || null]
            );
        }

        // Commit transaction
        await conn.commit();

        res.status(201).send({ message: 'Recipe added successfully!', recipeId });
    } catch (err) {
        // Rollback on error
        await conn.rollback();
        console.error(err);
        res.status(500).send('Error saving recipe');
    }
});

// Get all ingredients
app.get('/ingredients', async (req, res) => {
    try {
        const [rows] = await conn.execute('SELECT * FROM ingredients ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).send('Error fetching ingredients');
    }
});

// Get all recipes
app.get('/recipes', async (req, res) => {
    try {
        const [rows] = await conn.execute('SELECT * FROM recipes ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).send('Error fetching recipes');
    }
});

// Search recipes by ingredients
app.post('/recipes/search', async (req, res) => {
    const { ingredients } = req.body;

    try {
        const placeholders = ingredients.map(() => '?').join(',');
        
        // Find recipes that have ALL selected ingredients (exact match)
        const [exactMatchRows] = await conn.execute(
            `SELECT r.* 
             FROM recipes r
             WHERE r.id IN (
               SELECT ri.recipe_id
               FROM recipe_ingredients ri
               JOIN ingredients i ON i.id = ri.ingredient_id
               WHERE i.name IN (${placeholders})
               GROUP BY ri.recipe_id
               HAVING COUNT(DISTINCT i.name) = ?
             )`,
            [...ingredients, ingredients.length]
        );
        
        // Find recipes that have SOME selected ingredients (partial match)
        const [partialMatchRows] = await conn.execute(
            `SELECT DISTINCT r.* 
             FROM recipes r
             JOIN recipe_ingredients ri ON r.id = ri.recipe_id
             JOIN ingredients i ON i.id = ri.ingredient_id
             WHERE i.name IN (${placeholders})`,
            ingredients
        );
        
        // Combine results, removing duplicates
        const allRecipes = [...exactMatchRows, ...partialMatchRows];
        const uniqueRecipes = allRecipes.filter((recipe, index, self) =>
            index === self.findIndex(r => r.id === recipe.id)
        );
        
        res.json(uniqueRecipes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error searching recipes');
    }
});

// Get recipe details including steps and ingredients
app.get('/recipes/:id', async (req, res) => {
    const recipeId = req.params.id;

    try {
        const [recipeRows] = await conn.execute('SELECT * FROM recipes WHERE id = ?', [recipeId]);
        if (recipeRows.length === 0) {
            return res.status(404).send('Recipe not found');
        }

        const [stepRows] = await conn.execute(
            'SELECT * FROM steps WHERE recipe_id = ? ORDER BY id',
            [recipeId]
        );

        const [ingRows] = await conn.execute(
            `SELECT i.* FROM ingredients i
             JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
             WHERE ri.recipe_id = ?`,
            [recipeId]
        );

        res.json({
            ...recipeRows[0],
            steps: stepRows,
            ingredients: ingRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching recipe');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));