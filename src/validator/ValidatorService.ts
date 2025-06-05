import { PoolValidator } from './PoolValidator';
import { MinterValidator } from './MinterValidator';
import { UserValidator } from './UserValidator';
import { WithdrawalValidator } from './WithdrawalValidator';
import { P2PValidator } from './P2PValidator';
import { SpotTradeValidator } from './SpotTradeValidator';

export const ValidatorService = {
  Pool: PoolValidator,
  Minter: MinterValidator,
  User: UserValidator,
  Withdrawal: WithdrawalValidator,
  P2P: P2PValidator,
  SpotTrade: SpotTradeValidator
};
