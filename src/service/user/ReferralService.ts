import NodeCache from "node-cache";


const referralCache = new NodeCache({ stdTTL: 600 }); // 10 хв

interface IReferralCount {
  firstLevel: number;
  secondLevel: number;
  thirdLevel: number;
}

export interface IReferralUser {
  id: string;
  referralSystem: {
    firstLevel: string;
    secondLevel: string;
    thirdLevel: string;
  };
}

export class RefferalService {
  private static readonly getRequestOptions: RequestInit = {
    method: "GET",
    redirect: "follow" as RequestRedirect
  };

  private static readonly cacheKey = 'referralsSystem';


  static async fetchReferralTree(): Promise<IReferralUser[]> {
    const response = await fetch("https://auth.bazerwallet.com/auth/referralSystem", this.getRequestOptions);
    const data = await response.json();

    return data.data.users
  }

  static async getReferralSystem(): Promise<IReferralUser[]> {
    try {
      const cached = referralCache.get<IReferralUser[]>(this.cacheKey);

      if (cached) {
        return cached;
      }

      const referralSystem = await this.fetchReferralTree();

      referralCache.set(this.cacheKey, referralSystem);

      return referralSystem;
    } catch (error) {
      console.error(error)
    }
  }

  static setReferralCache(users: IReferralUser[]): void {
    referralCache.set(this.cacheKey, users);
  }

  static async getReferralCount(bazerId: string): Promise<IReferralCount> {
    const referralSystem = await this.getReferralSystem();

    if (!Array.isArray(referralSystem)) {
      return { firstLevel: 0, secondLevel: 0, thirdLevel: 0 };
    }

    const firstLevel = referralSystem.filter(
      (user) => user.referralSystem?.firstLevel === bazerId
    ).length;

    const secondLevel = referralSystem.filter(
      (user) => user.referralSystem?.secondLevel === bazerId
    ).length;

    const thirdLevel = referralSystem.filter(
      (user) => user.referralSystem?.thirdLevel === bazerId
    ).length;

    return { firstLevel, secondLevel, thirdLevel };
  }
}