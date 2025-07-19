import nodemailer, { Transporter } from "nodemailer";

const EMAIL_BOT = process.env.EMAIL_BOT;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

interface MailResult {
  status: boolean;
  code: number | null;
  message: string;
}

class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_BOT,
        pass: EMAIL_PASSWORD
      },
      pool: true,
      maxConnections: 5,
      rateLimit: 1,
    });
  }

  async sendConfirmationEmail(email: string): Promise<MailResult> {
    const code = this.generateVerificationCode();
    const html = `
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
    `;
    try {
      const mailOptions = {
        from: EMAIL_BOT,
        to: email,
        subject: 'Confirmation code',
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);

      return {
        status: true,
        code: code,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.log(`error sending email: `, error);

      return {
        status: false,
        code: null,
        message: `Error sending email: ${error.message}`,
      };
    }
  }

  async sendMailPassword(password: string, email: string) {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Notification</title>
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
       <h1>Your New Password</h1>
      <p>Your password has been successfully generated. Use the password below to log in:</p>
      <span class="code">${password}</span>
      <p>We recommend changing your password after your first login.</p>
      <p>Best regards,<br>Bazer Exchange</p>
    </div>
  </body>
  </html>
    `;

    const mailOptions = {
      from: EMAIL_BOT,
      to: email,
      subject: 'Confirmation code',
      html
    };

    const info = await this.transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);

    return {
      status: true,
      password: password,
      message: 'Email sent successfully',
    }
  }

  generateVerificationCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

export default new MailService();
