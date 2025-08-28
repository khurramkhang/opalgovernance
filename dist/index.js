"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const opal_tools_sdk_1 = require("@optimizely-opal/opal-tools-sdk");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Add JSON middleware
const toolsService = new opal_tools_sdk_1.ToolsService(app);
const bearerToken = process.env.BEARER_TOKEN;
// Add a root route to provide a status message.
app.get("/", (req, res) => {
    res.send(getContents({ query: "governance" }));
});
async function getContents(params) {
    const { query } = params;
    const articles = await searchArticles(query);
    return { articles };
}
async function searchArticles(query) {
    const url = "https://www.jsonkeeper.com/b/RLROX";
    const response = await axios_1.default.get(url);
    const articles = response.data.articles || [];
    const lowerQuery = query.toLowerCase();
    return articles.filter(article => article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.title.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        article.content.toLowerCase().includes(lowerQuery));
}
async function searchArticlesOfType(query) {
    const url = "https://www.jsonkeeper.com/b/RLROX";
    const response = await axios_1.default.get(url);
    const articles = response.data.articles || [];
    const lowerQuery = query.toLowerCase();
    return articles.filter(article => article.contentType.toLowerCase().includes(lowerQuery));
}
(0, opal_tools_sdk_1.tool)({
    name: "content_governance_search",
    description: "Retun the contents for governance where title, excerpt, author, tags or content match the query",
    parameters: [
        {
            name: "query",
            type: opal_tools_sdk_1.ParameterType.String,
            description: "Query",
            required: true,
        }
    ],
})(getContents);
(0, opal_tools_sdk_1.tool)({
    name: "content_governance_by_type",
    description: "Retun the contents for governance where content type match the query",
    parameters: [
        {
            name: "query",
            type: opal_tools_sdk_1.ParameterType.String,
            description: "Query",
            required: true,
        }
    ],
})(searchArticlesOfType);
app.use("/tools/content_governance_by_type", (req, res, next) => {
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
exports.default = app;
