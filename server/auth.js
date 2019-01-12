const { google } = require('googleapis')
require('dotenv').config()

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://us-central1-todo-fancy-228403.cloudfunctions.net/generate-link-calendar'
)

const scope = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/userinfo.email'
]

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scope
})

console.log(url)