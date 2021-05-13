const express = require('express')
const app = express()
const port = 4000

const sequelize = require('./db/postgres_connection')
const bodyParser = require("body-parser");
const cors = require('cors');
const CallMetaDataService = require('./db/data/CallMeta')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

sequelize
    .authenticate()
    .then(function(err) {
        console.log('[POSTGRES]: Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('[POSTGRES]: Unable to connect to the database:', err);
    })

app.post('/api/v1/callmeta', async (req, res) => {
  const body = req.body;
  if(!req.body) {
      return res.status(400).send({error: 'Body not present'})
  }

  if(!req.body.srcPhoneNumber) {
    return res.status(400).send({error: 'Source Number is a mandatory field!'})
  }

  if(!req.body.desPhoneNumber) {
    return res.status(400).send({error: 'Source Number is a mandatory field!'})
  }

  if(!req.body.selectedDuration) {
    return res.status(400).send({error: 'Selected Duration is a mandatory field!'})
  }

  const callMetaData = await CallMetaDataService.createCallMeta(req.body).then((res) => {
    return res;
  }).catch((err) => {
      console.log("An error occurred while trying to create callMeta",err);
    return null;
  })

  if(!callMetaData || !callMetaData.id) {
    return res.status(500).send("Something failed while create call meta, please try again!")
  }

  res.send(callMetaData)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})