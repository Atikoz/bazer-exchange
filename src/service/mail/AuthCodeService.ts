const P2P_API = process.env.P2P_API;


class AuthCodeService {
  private readonly p2pApi = P2P_API;

  async sendEmailVerifyCode(email: string): Promise<{ status: boolean, message: string }> {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${email}`);

    const data = JSON.stringify({ email });

    try {
      const response = await fetch(`${this.p2pApi}/api/user/send-mail-code`, {
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
      console.error(`error send mail code: `, error)

      return {
        status: false,
        message: 'unexpected error'
      }
    }
  };

  async verifyCode(email: string, code: number): Promise<{ status: boolean, message: string }> {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${email}`);

    const raw = JSON.stringify({
      email,
      code: code
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect
    };
    
    try {
      const response = await fetch(`${this.p2pApi}/api/user/verify-code`, requestOptions);
      const result = await response.json();

      return result
    } catch (error) {
      console.error(`error verification mail code: `, error)

      return {
        status: false,
        message: ''
      }
    }
  };
}

export default new AuthCodeService