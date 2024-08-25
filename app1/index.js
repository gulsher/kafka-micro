const express = require("express");
const kafka = require("kafka-node");
const app = express();
const sequelize = require("sequelize");
const db = new sequelize(process.env.POSTGRES_URL);

app.use(express.json());

const User = db.define("user", {
    name: sequelize.STRING,
    email: sequelize.STRING,
    password: sequelize.STRING,
  });
  db.sync({force:true})

const dbReady = async () => {
  
  
  const client = new kafka.KafkaClient({
    kafkaHost: process.env.KAFKA_BOOTSTRAP_SERVER,
  });
  const producer = new kafka.Producer(client);
  producer.on("ready", async() => {
    console.log("producer ready");
    app.post("/", async(req, res) => {
        console.log("request recieved");
       
      producer.send(
        [
          {
            topic: process.env.KAFKA_TOPIC,
            messages: JSON.stringify(req.body),
          },
        ],
        async (err, data) => {
          if (err) console.log(err);
          else {
            await User.create(req.body);
          }
        }
      );
      res.status(200).send({"message":"success"})
    });
  });
};




setTimeout(() => {
  dbReady();
}, 1000);

app.listen(process.env.PORT);
