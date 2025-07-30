# 🍲 Cooking Recipe App

## 📑 Table of Contents

- [Project Description](#project-description)  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Database Schema](#database-schema)  
- [Installation](#installation)  
- [API Endpoints](#api-endpoints)  
- [Frontend Structure](#frontend-structure)  
- [Screenshots](#screenshots)  
- [Contributing](#contributing)  
- [License](#license)  

---

## 📘 Project Description

The **Cooking Recipe App** is a full-stack web application developed as a student project to manage and explore cooking recipes. Users can browse recipes, search by ingredients, view detailed cooking instructions, and add new recipes to the database.

### Key Highlights:

- RESTful API backend with Node.js and Express  
- MySQL database for data persistence  
- Responsive frontend with modern UI  
- Interactive recipe search functionality  

---

## 🚀 Features

### 🔧 Recipe Management

- Add new recipes with ingredients and step-by-step instructions  
- View all available recipes  
- Get detailed recipe information including cooking steps and required ingredients  

### 🔍 Smart Search

- Search recipes by ingredients (exact or partial matches)  
- Filter recipes by difficulty level and dietary preference (vegetarian/non-vegetarian)  

### 🖥️ User-Friendly Interface

- Clean, intuitive design  
- Responsive layout that works on different devices  
- Interactive forms for adding new recipes  

---

## 🛠️ Technologies Used

### 🔙 Backend

- **Node.js** – JavaScript runtime environment  
- **Express.js** – Web application framework  
- **MySQL** – Relational database management system  
- **mysql2/promise** – MySQL client with promise support  
- **CORS** – Cross-Origin Resource Sharing middleware  

### 🔜 Frontend

- **HTML5** – Markup language  
- **CSS3** – Styling  
- **JavaScript** – Client-side scripting  
- **Fetch API** – HTTP requests to the backend  

---

## 🗃️ Database Schema

The application uses a relational database with the following structure:

| Table               | Description                                | Columns                                                                 |
|--------------------|--------------------------------------------|-------------------------------------------------------------------------|
| `recipes`          | Stores recipe metadata                     | `id (PK)`, `name`, `is_veg (boolean)`, `difficulty (string)`           |
| `ingredients`      | Stores all available ingredients           | `id (PK)`, `name`                                                      |
| `recipe_ingredients` | Junction table for recipe-ingredient relationships | `recipe_id (FK)`, `ingredient_id (FK)`                          |
| `steps`            | Stores cooking instructions for recipes    | `id (PK)`, `recipe_id (FK)`, `description`, `time_seconds`             |

---

## ⚙️ Installation

### ✅ Prerequisites

- Node.js (v14 or higher)  
- MySQL Server  
- Git (optional)  

### 🧾 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cooking-recipe-app.git
   cd cooking-recipe-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   - Create a MySQL database named `cooking_app`  
   - Import the SQL schema from `database/schema.sql`  
   - Update database credentials in `server.js`  

4. **Start the server**:
   ```bash
   node server.js
   ```

5. **Access the application**:
   - Open `index.html` in your browser  
   - Or access via a local server if configured  

---

## 📡 API Endpoints

| Endpoint            | Method | Description                        |
|---------------------|--------|------------------------------------|
| `/recipes`          | GET    | Get all recipes                    |
| `/recipes`          | POST   | Add a new recipe                   |
| `/recipes/:id`      | GET    | Get detailed recipe information    |
| `/recipes/search`   | POST   | Search recipes by ingredients      |
| `/ingredients`      | GET    | Get all available ingredients      |

---

## 🖼️ Frontend Structure

```
frontend/
├── css/
│   └── style.css
├── js/
│   └── app.js
├── images/
├── index.html
└── recipe-details.html
```

---


## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**  
2. **Create a new branch**  
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit your changes**  
   ```bash
   git commit -am 'Add some feature'
   ```
4. **Push to the branch**  
   ```bash
   git push origin feature/your-feature
   ```
5. **Create a new Pull Request**


