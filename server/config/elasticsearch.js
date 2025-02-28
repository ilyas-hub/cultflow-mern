const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
});

(async () => {
  try {
    const response = await esClient.ping();
  } catch (error) {
    console.error("Elasticsearch connection failed:", error);
  }
})();

module.exports = { esClient };
