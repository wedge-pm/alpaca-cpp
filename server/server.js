import express from "express";
import bodyParser from "body-parser";
import { execaCommand, execaCommandSync } from "execa";

const app = express();
const port = 9801;

app.use(bodyParser.json());

execaCommandSync("chmod +x ./run.sh");
const modelProcess = execaCommand("sh ./run.sh");
let modelDataListener = (data) => {
  console.log(data.toString());
};
modelProcess.stdout.on("data", modelDataListener);
modelProcess.pipeStderr(process.stderr);

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  modelProcess.stdout.removeListener("data", modelDataListener);
  let responseMessage = "";
  modelDataListener = (data) => {
    if (data.equals(Buffer.from("0A3E20", "hex"))) {
      res.send({ message: responseMessage });
    } else {
      responseMessage += data.toString();
    }
  };
  modelProcess.stdout.on("data", modelDataListener);
  modelProcess.stdin.write(message + "\n");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
