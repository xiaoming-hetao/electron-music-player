const mongoose = require("mongoose");
const dbconfig = require("./dbConfig");

const { host, port, database } = dbconfig;

const url = `mongodb://${host}:${port}/${database}`;
mongoose.connect(url, err => {
  if (err) console.log("connect failed");
  console.log("success");
});

module.exports = mongoose;
