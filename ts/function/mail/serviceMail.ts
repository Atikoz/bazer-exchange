import nodemailer from 'nodemailer';
import config from '../../config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';


class MailService {
  public verificationCode: number | null;
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpOptions: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.botEmail,
        pass: config.emailPassword
      }
    };

    this.transporter = nodemailer.createTransport(smtpOptions);
    this.verificationCode = null;
  }

  async sendConfirmationEmail(email: string): Promise<void> {
    try {
      this.generateVerificationCode();
      
      const mailOptions = {
        from: config.botEmail,
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
              <span class="code">${this.verificationCode}</span>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p>Best regards,<br>Bazer Exchange</p>
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

  generateVerificationCode(): number {
    const code = Math.floor(100000 + Math.random() * 900000);
    this.verificationCode = code;
    return code;
  }
}

export default new MailService();
