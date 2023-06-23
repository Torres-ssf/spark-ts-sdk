import { Order } from "../src";
import { TOKENS_BY_SYMBOL } from "../src/constants";
import BN from "../src/utils/BN";
import { nodeUrl, privateKey } from "../src/config";
import { Wallet } from "fuels";

test("create order", () => {
  const token0 = TOKENS_BY_SYMBOL.USDC;
  const amount0 = BN.parseUnits(20, token0.decimals);
  const token1 = TOKENS_BY_SYMBOL.BTC;
  const amount1 = BN.parseUnits(0.001, token1.decimals);
  const exp = BN.parseUnits(1, 9 + token0.decimals - token1.decimals);
  const price = amount1.times(exp).div(amount0);

  const wallet = Wallet.fromPrivateKey(privateKey, nodeUrl);
  console.log("wallet", wallet);

  // console.log(price.toString());
  const configurableConstants = {
    ASSET0: token0.assetId,
    ASSET1: token1.assetId,
    MAKER: wallet.address.toB256(),
    PRICE: price.toFixed(0),
    MIN_FULFILL_AMOUNT0: "",
    ASSET0_DECIMALS: token0.decimals,
    ASSET1_DECIMALS: token1.decimals,
  };
  const order = new Order(configurableConstants, nodeUrl);
  console.log(order);
});
