const express = require("express");
const kafka = require("kafka-node");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());

let topicsToCreate = [{
    topic: process.env.KAFKA_TOPIC,
    partitions: 1,
    replicationFactor:1
  }];



const dbReady = async () => {
  mongoose.connect(process.env.MONGO_URL);
  const User = new mongoose.model("user", {
    name: String,
    email: String,
    password: String,
  });

  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVER,
  });

  client.createTopics(topicsToCreate,(err,result)=>{
    if(err){
        console.log(err)
    }
    console.log("result",result)
  })

  const consumer = new kafka.Consumer(
    client,
    [{ topic: process.env.KAFKA_TOPIC }],
    {
      autoCommit: false,
    }
  );

  consumer.on("message", async (message) => {
    console.log("message received");
    const user = await User.create(JSON.parse(message.value));
    await user.save();
  });

  consumer.on("error", (err) => {
    console.log(err);
  });
};

setTimeout(() => {
  dbReady();
}, 2000);

app.listen(process.env.PORT);
