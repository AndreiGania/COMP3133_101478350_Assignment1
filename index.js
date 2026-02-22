require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");

const typeDefs = require("./schemas/typeDefs");
const resolvers = require("./resolvers/resolvers");

const app = express();

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  app.listen(4000, () => {
    console.log(
      `Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
}

startServer();