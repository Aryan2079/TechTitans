import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3001;

// Add CORS middleware
app.use(cors());
app.use(express.json());

// Image generation route
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const API_KEY = process.env.OPENAI_API_KEY;

    // OpenAI image generation API call
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const imageUrl = response.data.data[0].url;
    res.json({ imageUrl });
  } catch (error) {
    console.error(
      "Error generating image:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to generate image",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// Website generation route
app.post("/api/generate-website-code", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const API_KEY = process.env.WEBSITE_API_KEY;

    // Generate HTML and CSS based on the prompt using OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a web developer. Generate modern, responsive HTML and CSS code for a business website based on the given prompt. Include proper semantic HTML5 elements and modern CSS practices.",
          },
          {
            role: "user",
            content: `Create a website for: ${prompt}`,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedCode = response.data.choices[0].message.content;

    // Parse the response to separate HTML and CSS
    const htmlMatch = generatedCode.match(/```html\n([\s\S]*?)```/);
    const cssMatch = generatedCode.match(/```css\n([\s\S]*?)```/);

    const html = htmlMatch ? htmlMatch[1] : generateDefaultHTML(prompt);
    const css = cssMatch ? cssMatch[1] : generateDefaultCSS();

    res.json({
      html,
      css,
    });
  } catch (error) {
    console.error(
      "Error generating website code:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to generate website code",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// Fallback HTML generator
const generateDefaultHTML = (prompt) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav class="main-nav">
            <div class="logo">${prompt}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="hero">
            <h1>${prompt}</h1>
            <p>Welcome to our business website</p>
        </section>
    </main>
    <footer>
        <p>&copy; ${new Date().getFullYear()} ${prompt}. All rights reserved.</p>
    </footer>
</body>
</html>`;
};

// Fallback CSS generator
const generateDefaultCSS = () => {
  return `/* Modern CSS Reset */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* Variables */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --background-color: #f8f9fa;
    --text-color: #212529;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
}

/* Navigation */
.main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
}

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
}

.nav-links a {
    text-decoration: none;
    color: var(--text-color);
    transition: color 0.3s ease;
}

.nav-links a:hover {
    color: var(--primary-color);
}

/* Hero Section */
#hero {
    text-align: center;
    padding: 4rem 2rem;
    background-color: var(--primary-color);
    color: white;
}

#hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

/* Footer */
footer {
    text-align: center;
    padding: 2rem;
    background-color: var(--secondary-color);
    color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
    .main-nav {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-links {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
}`;
};
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
console.log("WEBSITE_API_KEY:", process.env.WEBSITE_API_KEY);
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
