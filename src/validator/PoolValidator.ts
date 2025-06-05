import DoubleLiquidityPool from '../models/liquidityPools/modelDoubleLiqPools';
import SingleLiquidityPool from '../models/liquidityPools/modelSingleLiquidityPool';
import ProfitPool from '../models/user/ProfitPoolModel';
import UserManagement from '../service/user/UserManagement';
import { SpotTradeFeeCalculator } from '../utils/calculators/spotTradeFeeCalculator';
import { ValidationResult } from './types';


export class PoolValidator {
  static async validateWithdrawInvestmentDual(params: {
    firstCoin: string;
    secondCoin: string;
    coinWithdraw: string;
    amount: number;
    userId: number;
    commission: number;
  }): Promise<ValidationResult> {
    const { userId, commission, amount, firstCoin, secondCoin, coinWithdraw } = params;

    if (isNaN(amount)) return { status: false, message: 'Введено некорректное число.' };
    if (isNaN(commission)) return { status: false, message: 'Ошибка комиссии.' };

    const userInfo = await UserManagement.getInfoUser(userId);
    const balance = userInfo.userBalance.main[SpotTradeFeeCalculator.commissionCoin] ?? 0;

    if (commission > balance) {
      return {
        status: false,
        message: `Недостаточно средств для комиссии: требуется ${commission}, доступно ${balance}`
      };
    }

    const pool = await DoubleLiquidityPool.findOne({ firstCoin, secondCoin });
    if (!pool) return { status: false, message: 'Пул не найден.' };

    const user = pool.poolUser.find(u => u.id === userId);
    if (!user) return { status: false, message: 'Инвестиция пользователя не найдена.' };

    const insufficient =
      (coinWithdraw === firstCoin && user.amountFirstCoin < amount) ||
      (coinWithdraw === secondCoin && user.amountSecondCoin < amount);

    if (insufficient) {
      return { status: false, message: 'Сумма превышает вашу инвестицию в пул.' };
    }

    return { status: true };
  }

  static async validateWithdrawInvestmentSingle(params: {
    firstCoin: string,
    secondCoin: string,
    coinWithdraw: string,
    amount: number,
    userId: number,
    commission: number
  }): Promise<ValidationResult> {
    const { firstCoin, secondCoin, coinWithdraw, amount, userId, commission } = params;

    try {
      if (isNaN(amount)) {
        return { status: false, message: 'Введено некорректное число.' };
      }

      if (isNaN(commission)) {
        return {
          status: false,
          message: 'Ошибка комиссии. Попробуйте позже или свяжитесь с администрацией.'
        };
      }

      const { userBalance, status, error } = await UserManagement.getInfoUser(userId);

      if (!status) {
        throw new Error(error)
      }

      const balance = userBalance.main[SpotTradeFeeCalculator.commissionCoin] ?? 0;

      if (commission > balance) {
        const coin = SpotTradeFeeCalculator.commissionCoin.toUpperCase();
        return {
          status: false,
          message: `Недостаточно средств для комиссии! Необходимо ${commission} ${coin}, доступно: ${balance} ${coin}.`
        };
      }

      const pool = await SingleLiquidityPool.findOne({ firstCoin, secondCoin });
      if (!pool) {
        return {
          status: false,
          message: 'Пул не найден. Попробуйте позже или обратитесь к администрации.'
        };
      }

      const user = pool.poolUser.find((u) => u.id === userId);
      if (!user) {
        return {
          status: false,
          message: 'Инвестиция пользователя не найдена в пуле.'
        };
      }

      const withdrawAmount =
        coinWithdraw === firstCoin ? user.amountFirstCoin
          : coinWithdraw === secondCoin ? user.amountSecondCoin
            : null;

      if (withdrawAmount === null) {
        return {
          status: false,
          message: 'Неверная монета для вывода.'
        };
      }

      if (amount > withdrawAmount) {
        return {
          status: false,
          message: 'Сумма вывода превышает доступную инвестицию в пуле.'
        };
      }

      return { status: true };

    } catch (error) {
      console.error('Withdraw pool validator error:', error.message);
      return {
        status: false,
        message: 'Произошла ошибка. Попробуйте позже или обратитесь к администрации.'
      };
    }
  }

  static async validateWithdrawPoolProfit(userId: number, amount: number): Promise<ValidationResult> {
    const balance = (await ProfitPool.findOne({ id: userId })).profit;

    if (isNaN(amount)) return { status: false, message: 'Некорректная сумма.' };
    if (amount < 0) return { status: false, message: 'Введено не корректное число!' };
    if (amount > balance) return { status: false, message: 'Недостаточно средств для вывода.' };

    return { status: true };
  }

  static async validatePoolData(
    userId: number,
    amount: number,
    selectedInvestCoin: string,
    fee: number
  ): Promise<ValidationResult> {
    const userInfo = await UserManagement.getInfoUser(userId);
    const userBalance = userInfo.userBalance.main[selectedInvestCoin] ?? 0;
    const feeBalance = userInfo.userBalance.main[SpotTradeFeeCalculator.commissionCoin] ?? 0;

    if (isNaN(amount)) return { status: false, message: 'Введите корректное число.' };

    if (amount < 0.00000001) {
      return { status: false, message: 'Минимальная сумма — 0.00000001' };
    }

    if (amount > userBalance) {
      return { status: false, message: `Недостаточно баланса ${selectedInvestCoin}` };
    }

    if (fee > feeBalance) {
      return { status: false, message: `Недостаточно средств для комиссии (${SpotTradeFeeCalculator.commissionCoin})` };
    }

    return { status: true };
  }
}
