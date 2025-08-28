import {
  ToolsService,
  tool,
  ParameterType,
} from "@optimizely-opal/opal-tools-sdk";
import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json()); // Add JSON middleware

const toolsService = new ToolsService(app);
const bearerToken = process.env.BEARER_TOKEN;

// Add a root route to provide a status message.
app.get("/", (req, res) => {
  res.send("Opal tool server is running. Visit /discovery for tool discovery.");
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

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
};

async function searchArticles(query: string): Promise<Article[]> {
  const url = "https://www.jsonkeeper.com/b/RWBFU";
  const response = await axios.get(url);
  const articles: Article[] = response.data.articles || [];

  const lowerQuery = query.toLowerCase();
  return articles.filter(article =>
    Object.values(article).some(
      value =>
        typeof value === "string" &&
        value.toLowerCase().includes(lowerQuery)
    )
  );
}

tool({
  name: "content_governance",
  description: "Retun the contents for governance.",
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

app.use("/tools/getContents", (req, res, next) => {
    next();
  });

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
