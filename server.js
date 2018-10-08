// server.js

const express = require('express')
const app = express()
const { execSync } = require('child_process')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/', (request, response) => {
  response.status(200).send('おかえり！🏡')
})

const addOrigin = repoUrl => {
  console.log('Attempting to add ' + repoUrl + ' as origin.')
  // Exits with status code 2 if remote doesn't exist
  const checkRemote = `git ls-remote --exit-code -h "${repoUrl}"`
  // Adds origin
  const addOrigin = `git remote add origin ${repoUrl}`

  // Add origin if remote doesn't already exist
  execSync(`${checkRemote} || ${addOrigin}`)
}

app.post('/deploy', (request, response) => {
  if (request.query.secret !== process.env.SECRET) {
    response.status(401).send()
    return
  }

  if (request.body.ref !== 'refs/heads/glitch') {
    response
      .status(200)
      .send('Push was not to glitch branch, so did not deploy.')
    return
  }

  const repoUrl = request.body.repository.url
  addOrigin(repoUrl)

  console.log('Fetching latest changes from ' + repoUrl)
  let output = execSync(`git fetch origin glitch`).toString()
  console.log(output)
  console.log('Updating code base.')
  output = execSync(`git reset --hard origin/master`).toString()
  console.log(output)
  response.status(200).send()
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
