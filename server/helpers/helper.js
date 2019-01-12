const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const axios = require('axios')
const admin = require('firebase-admin')

const serviceAccount = require('./serviceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

module.exports = {
  hash: (password) => {
    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(password, salt)
    return hash
  },
  compare: (input, password) => {
    return bcrypt.compareSync(input, password)
  },
  token: (email) => {
    let token = jwt.sign({
      email: email
    }, process.env.SECRET)
    return token
  },
  sendmail: (job, done) => {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    })
    const mailOption = {
      from: 'atras.r@gmail.com',
      to: job.data.to,
      subject: job.data.title,
      html: job.data.template
    }
    transporter.sendMail(mailOption, function (err, info) {
      if(err) console.log(err)
      else done()
    })
  },
  calendarInsert: async (email, todo) => {
    try {
      const token = (await db.collection('users').doc(email).get()).data()
      const option = {
        'summary': todo.title,
        'description': todo.description,
        'start': {
          'date': todo.due_date,
          'timeZone': 'Asia/Jakarta'
        },
        'end': {
          'date': todo.due_date,
          'timeZone': 'Asia/Jakarta'
        }
      }
      const credential = {
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`
        }
      }
      const { data } = await axios.post(`https://www.googleapis.com/calendar/v3/calendars/${token.calendar_id}/events`, option, credential)
      console.log(data)
    } catch (err) {
      console.log(err)
      throw err
    }
  } 
}