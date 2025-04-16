const nodemailer = require('nodemailer');
const { botEmail, emailPassword } = require('../../config');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: botEmail,
        pass: emailPassword
      }
    });
  }

  async sendConfirmationEmail(email) {
    try {
      const code = this.generateVerificationCode();

      const mailOptions = {
        from: botEmail,
        to: email,
        subject: 'Confirmation code',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333333;
              text-align: center;
            }
            p {
              color: #666666;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .code {
              display: block;
              margin: 20px auto;
              padding: 10px 20px;
              background-color: #007bff;
              color: #ffffff;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              border-radius: 5px;
            }
          </style>
          </head>
          <body>
            <div class="container">
              <h1>Email Confirmation</h1>
              <p>Please use the following code to confirm your email address:</p>
              <span class="code">${code}</span>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p>Best regards,<br>Bazer Exchange</p>
            </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);

      return {
        status: true,
        code: code,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.log(error);

      return {
        status: false,
        code: null,
        message: `Error sending email: ${error}`,
      };
    }
  }

  async sendMnemonicEmail(email, mnemonic) {
    try {
      const mailOptions = {
        from: botEmail,
        to: email,
        subject: 'Mnemonic Phrase',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Mnemonic Phrase</title>
              <style>
                  body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                  }
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      border: 1px solid #ddd;
                      border-radius: 10px;
                      box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  }
                  .mnemonic-phrase {
                      background-color: #f9f9f9;
                      padding: 10px;
                      border: 1px solid #ddd;
                      border-radius: 5px;
                      margin-bottom: 20px;
                      font-size: 1.2em;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <h1>Your Mnemonic Phrase</h1>
                  <div class="mnemonic-phrase" id="mnemonic-phrase">${mnemonic}</div>
              </div>
          </body>
          </html>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.log(error);
    }
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

module.exports = new MailService();
