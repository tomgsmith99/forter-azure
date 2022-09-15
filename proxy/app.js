
require('dotenv').config()

const axios = require('axios').default

const express = require('express')

/***************************/

const app = express()

app.listen(process.env.PORT, () => {
  console.log(`app listening at http://localhost:${process.env.PORT}`)
})

app.use(express.json())

/***************************/

app.get('/', (req, res) => {
  res.json({msg: "hello world!"})
})

app.post('/signup', (req, res) => {

  console.dir(req.body)

  let ip

  const email = req.body.email.toLowerCase()

  console.log("the email is: " + email)

  if (email.includes("approve")) {
    ip = "0.0.0.1"
  }
  else if (email.includes("decline")) {
    ip = "0.0.0.2"
  }
  else {
    ip = "0.0.0.3"
  }

  console.log("the email address is: " + email)

  console.log("the ip address is: " + ip)

  const right_now = Date.now()

  const data = {
    "accountId": "NO_ACCOUNT_ID",
    "accountData": {
      "assetsInAccount": {},
      "personalDetails": {
        "email": email
      },
      "created": right_now
    },
    "connectionInformation": {
        "customerIP": ip,
        "forterTokenCookie": req.body.forter_token,
        "userAgent": "unknown"
    },
    "eventTime": right_now
  }

  const config = {
    method: 'post',
    url: process.env.ORIGIN_DOMAIN + '/v2/accounts/signup/NO_ACCOUNT_ID',
    headers: { 
      'api-version': process.env.FORTER_API_VERSION, 
      'Content-Type': 'application/json',
      'x-forter-siteid': process.env.FORTER_SITE_ID,
      'Authorization': req.header('Authorization')
    },
    data: data
  }

  axios(config)
  .then(function (response) {
    console.log("the call to the origin was successful.")

    console.dir(response.data)

    const forter_decision = response.data.forterDecision

    if (forter_decision == "DECLINE") {
      res.status(409).json({userMessage: "Sorry, we could not create an account for you at this time"});
    }
    else {
      res.json({forter_decision: response.data.forterDecision})
    }
  })
  .catch(function (error) {

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      console.log("there was a error.response from the server:")
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log("there was a error.request. No response from the server:")

      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

    console.dir(config)

    res.json({msg: "the call to the origin was unsuccessful."})
  })

})
