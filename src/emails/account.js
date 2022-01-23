const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.MONGODB_URL)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ashraf.badr20@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}.\nLet me know how you get along with the app.`,
    })
}

const sencCancleEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ashraf.badr20@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Hello, ${name}. \ni hope you enjoyed our service, and i hope to see you back sometime soon\n please give us any feedback if possible`,
    })
}


module.exports = {
    sendWelcomeEmail,
    sencCancleEmail,
}