import User from "../../models/user/UserModel";
import { generatePassword } from "../../utils/generatePassword";
import MailService from "../mail/serviceMail"

export class BazerService {
  static async registerUser(userId: number, email: string, password: string) {
    const response = await fetch("https://auth.bazerwallet.com/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        telegramId: userId,
        referId: "bzr92c1frq6t1tv"
      }),
    });

    return await response.json();
  }

  static async createBazerId(id: number, mail: string): Promise<boolean> {
    try {
      const password = generatePassword();

      const data = await BazerService.registerUser(id, mail, password);

      if (data.status === 'success') {
        const bazerId = data.data.id;

        await User.updateOne({ id }, { $set: { bazerId } });

        await MailService.sendMailPassword(password, mail);
        console.log(bazerId);

        return true
      }

      return false
    } catch (error) {
      console.error('[BazerService Error]', error);

      return false
    }
  }
}
