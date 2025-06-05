import CustomP2POrder from "../../models/p2p/modelP2POrder";

export async function generateOrderNumberP2P(): Promise<number> {
  return (await CustomP2POrder.countDocuments()) + 1;
}