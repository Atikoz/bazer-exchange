import User from "../../models/user/UserModel";
import getTranslation, { Language, TranslationMap } from "../../translations";


class AuthManager {
  static async isUserExistsLocally(userId: number): Promise<boolean> {
    try {
      const user = await User.findOne({ id: userId });

      return !!user
    } catch (error) {
      console.error('Error checking if user exists:', error);

      return false
    }
  };

  static async isEmailOrTelegramTaken(telegramId: number, email: string): Promise<{ isEmailTaken: boolean, isTelegramIdTaken: boolean }> {
    const requestOptions: RequestInit = {
      method: "GET",
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch(`https://auth.bazerwallet.com/auth/isUserExists?email=${email}&telegramId=${telegramId}`, requestOptions);
    const data = await response.json();

    if (data.error) {
      throw new Error(`Error checking Email Or Telegram Taken: ${data.error}`)
    }

    return {
      isEmailTaken: data.data.userExistsByEmail,
      isTelegramIdTaken: data.data.userExistsByTelegramId
    }
  };

  static async registerRemoteUser(userId: number, email: string, password: string, refferId: string = 'bzr92c1frq6ttv') {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": email,
      "password": password,
      "telegramId": userId,
      "referId": refferId
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch("https://auth.bazerwallet.com/auth/register", requestOptions);
    const data = await response.json();

    return {
      status: data.status,
      error: data.error,
      bazerId: data.data.id
    }
  };

  static async fetchTokensFromMicroservice(email: string, password: string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": email,
      "password": password,
      "setToken": false
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch("https://auth.bazerwallet.com/auth/login", requestOptions);
    const data = await response.json();

    return {
      status: data.status,
      error: data.error,
      tokens: {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      }
    }
  };

  static async loginAndSaveTokens(email: string, password: string): Promise<void> {
    const loginResponse = await this.fetchTokensFromMicroservice(email, password);
    const { status, error, tokens } = loginResponse;

    if (status === 'success' && !error) {
      User.updateOne({ email }, {
        $set: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      })
    } else {
      throw new Error(`Login request failed: ${error}`);
    }
  };

  static async verifyRemoteCredentials(email: string, password: string, lang: Language): Promise<{ status: boolean, errorMessage?: string }> {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": email,
      "password": password
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch("https://auth.bazerwallet.com/auth/checkCredentials", requestOptions);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        status: true
      }
    }

    const errorKeys: Record<string, string> = {
      'User not found': 'userNotFound',
      'Password is incorrect': 'incorrectPassword',
    };

    const errorKey = errorKeys[data.error] || 'unexpectedError';

    return {
      status: false,
      errorMessage: getTranslation(lang, errorKey as keyof TranslationMap),
    };
  };
}

export default AuthManager;