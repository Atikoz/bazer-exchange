const { p2pAPI } = require('../../config')

class AuthCodeService {
  async sendEmailVerifyCode(email) {
      const data = JSON.stringify({ email });
      try {
      const response = await fetch(`${p2pAPI}/api/user/send-mail-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const statusResponse = (result.error === '') ? true : false;

      return {
        status: statusResponse,
        message: result.message
      }
    } catch (error) {
      console.error(`error send mail code: ${error.message}`)

      return {
        status: false,
        message: 'unexpected error'
      }
    }
  }

  async verifyCode(email, code) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({
        email,
        code: +code
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      const response = await fetch(`${p2pAPI}/api/user/verify-code`, requestOptions);

      const result = await response.json();

      return result
    } catch (error) {
      console.error(`error verification mail code: ${error.message}`)

      return {
        status: false,
        message: ''
      }
    }
  }
}

module.exports = new AuthCodeService