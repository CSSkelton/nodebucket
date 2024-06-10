/**
 * title: employee-route.js
 * author: Cody Skelton
 * date: 06.09.2024
 */

"use strict";

const { MongoClient } = require("mongodb");

const MONGO_URL = "mongodb+srv://nodebucket_user:ZfwTmQGBcL6tQg@cluster0.ifz0to0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// Can put specific collection before ? in string

const mongo = async (operations, next) => {

  try {
    console.log("Connecting to the database...");

    const client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = client.db("nodebucket");
    console.log("Connected to the database!");

    await operations(db);
    console.log("Operation was successful!");

    client.close();
    console.log("Disconnected from the database.");

  } catch (err) {
    const error = new Error("Error connecting to the database:", err);
    error.status = 500;
    console.error("Error connecting to the database:", err);
    next(error);
  }
}

module.exports = { mongo };