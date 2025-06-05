import CustomOrder from "../../models/spotTrade/modelOrder";

export async function generateOrderNumberSpotTrade(): Promise<number> {
  return (await CustomOrder.countDocuments()) + 1;
}