import {
  ToolsService,
  tool,
  ParameterType,
} from "@optimizely-opal/opal-tools-sdk";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";
//import articlesData from "./articles.js";

dotenv.config();

const app = express();
app.use(express.json()); // Add JSON middleware

const toolsService = new ToolsService(app);
const bearerToken = process.env.BEARER_TOKEN;

// Add a root route to provide a status message.
app.get("/", (req, res) => {
  getContents({ query: "test" }).then(rssult=>{
    console.log("Warm up result:", rssult);
  }); // Warm up the function
  res.send("Opal Governance Tool is running.");
});

type SearchParams = {
  query: string;
};

async function getContents(
  params: SearchParams
): Promise<{ articles: Article[] | null }> {
  const { query } = params;
  const articles = await searchArticles(query);
  return { articles };
}

async function getContentsByType(
  params: SearchParams
): Promise<{ articles: Article[] | null }> {
  const { query } = params;
  const articles = await searchArticlesOfType(query);
  return { articles };
}

type Article = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  tags: string[];
  contentType: string;
};

async function searchArticles(query: string): Promise<Article[]> {
  const url = "https://www.jsonkeeper.com/b/RLROX";
  const response = await axios.get(url);
  const articles: Article[] = response.data.articles || [];
  //const articles: Article[] = articlesData.articles || [];
  const lowerQuery = query.toLowerCase();
  return articles.filter(article =>
    article.excerpt.toLowerCase().includes(lowerQuery) ||
    article.title.toLowerCase().includes(lowerQuery) ||
    article.author_name.toLowerCase().includes(lowerQuery) ||
    article.contentType.toLowerCase().includes(lowerQuery) ||
    article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    article.content.toLowerCase().includes(lowerQuery)
  );
}

async function searchArticlesOfType(query: string): Promise<Article[]> {
  const url = "https://www.jsonkeeper.com/b/RLROX";
  const response = await axios.get(url);
  const articles: Article[] = response.data.articles || [];
  //const articles: Article[] = articlesData.articles || [];

  const lowerQuery = query.toLowerCase();
  return articles.filter(article =>
    article.contentType.toLowerCase().includes(lowerQuery)
  );
}

tool({
  name: "content_governance_search",
  description: "Retun the contents for governance where title, excerpt, author, tags, type or content match the query",
  parameters: [
    {
      name: "query",
      type: ParameterType.String,
      description:
        "Query",
      required: true,
    }
  ],
})(getContents);

tool({
  name: "content_governance_by_content_type",
  description: "Retun the contents for governance where content type or type match the query",
  parameters: [
    {
      name: "query",
      type: ParameterType.String,
      description:
        "Query",
      required: true,
    }
  ],
})(getContentsByType);

/*
// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Discovery endpoint: http://localhost:${PORT}/discovery`);
  });
}
*/

export default app;
