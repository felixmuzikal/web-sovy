const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
// var fs = require('fs');
var http = require('http');
// var https = require('https');
require('dotenv').config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
const SMTPHOST = process.env.SMTPHOST;
const SMTPUSER = process.env.SMTPUSER;
const SMTPPASS = process.env.SMTPPASS;
const DBHOST = process.env.DBHOST;
const DBUSER = process.env.DBUSER;
const DBPASS = process.env.DBPASS;

const con = mysql.createConnection({
    host: DBHOST,
    user: DBUSER,
    password: DBPASS,
    database: "tickets"
})

let transporter = nodemailer.createTransport({
    host: SMTPHOST,
    port: 465,
    secure: true,
    auth: {
        user: SMTPUSER,
        pass: SMTPPASS,
    },
});

app.post('/registerticket', (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var qty = req.body.qty;
    var origin = req.body.origin;

    var sql = `INSERT INTO tickets (name, email, qty, origin, state) VALUES ('${name}', '${email}', '${qty}', '${origin}', 'RESERVED')`;
    
    con.query(sql, function (err, result) {
        if (err) {
            res.status(500).send('Failed to insert into database')
            throw err;
        }
        var id = result.insertId;
        console.log(`Inserted a reservation @ ${id} - ${name}, ${email}, ${qty}, ${origin}`)
        transporter.sendMail({
            from: 'rezervacie@muzikalvrazdapodlaobete.sk',
            replyTo: "rezervacie@muzikalvrazdapodlaobete.sk",
            to: req.body.email,
            bcc: "rezervacie@muzikalvrazdapodlaobete.sk",
            subject: `Rezervácia č. ${id}`,
            text: `Dobrý deň, ${name}. \r\n Vašu rezerváciu (č. ${id}) sme úspešne zaznamenali. \r\n Ďakujeme vám - tím muzikálu Vražda podľa obete.`,
            html: `<p>Dobrý deň, ${name}.</p><br/><p>Vašu rezerváciu (č. ${id}) sme úspešne zaznamenali.</p><br/><p>Ďakujeme vám - tím muzikálu Vražda podľa obete</p>`,
        });
        res.status(200).send({
            "sent": true
        });
    });
});

/* var ssloptions = {
    key: fs.readFileSync('/var/ssl/selfsigned.key'),
    cert: fs.readFileSync('/var/ssl/selfsigned.crt')
} */

http.createServer(app).listen(port, () => console.log(`HTTP listening on ${port}`))
// https.createServer(ssloptions, app).listen(port + 1, () => console.log(`HTTPS listening on ${port + 1}`));