// import BN from "../src/utils/BN";
// import { TOKENS_BY_SYMBOL } from "../src/constants";
// import { LimitOrderPredicateAbi__factory } from "../src/predicates";
// import {
//   InputType,
//   OutputType,
//   Predicate,
//   Provider,
//   ScriptTransactionRequest,
//   Wallet,
// } from "fuels";
// import { nodeUrl, privateKey } from "../src/config";

(async () => {
  console.log("mocked test");
  // const eth = TOKENS_BY_SYMBOL.ETH;
  // const token0 = TOKENS_BY_SYMBOL.USDC;
  // const amount0 = BN.parseUnits(20, token0.decimals);
  // const token1 = TOKENS_BY_SYMBOL.BTC;
  // const amount1 = BN.parseUnits(0.001, token1.decimals);
  // const exp = BN.parseUnits(1, 9 + token0.decimals - token1.decimals);
  // const price = amount1.times(exp).div(amount0);
  //
  // const wallet = Wallet.fromPrivateKey(privateKey, nodeUrl);
  //
  // const coinsNativeAsset = await wallet.getCoins(eth.assetId);
  // const coinsToken0Asset = await wallet.getCoins(token0.assetId);
  // // const coinsToken1Asset = await wallet.getCoins(token1.assetId);
  //
  // const ethUTXO = coinsNativeAsset.find(
  //   (coin) => coin.status === "UNSPENT" && coin.amount.toNumber() >= 1
  // )!;
  // const token0UTXO = coinsToken0Asset.find((coin) => coin.status === "UNSPENT")!;
  // // const otherToken1UTXO = coinsToken1Asset.find((coin) => coin.status === "UNSPENT")!;
  //
  // // console.log(price.toString());
  // const configurableConstants = {
  //   ASSET0: token0.assetId,
  //   ASSET1: token1.assetId,
  //   MAKER: wallet.address.toB256(),
  //   PRICE: price.toFixed(0),
  //   ASSET0_DECINALS: token0.decimals,
  //   ASSET1_DECINALS: token1.decimals,
  // };
  // console.log(configurableConstants);
  // const predicate = new Predicate(
  //   LimitOrderPredicateAbi__factory.bin,
  //   LimitOrderPredicateAbi__factory.abi,
  //   new Provider(nodeUrl),
  //   configurableConstants
  // );
  //
  // console.log(predicate.address.toB256());
  //
  // const initialPredicateBalance = await predicate.getBalance(token0.assetId);
  // console.log("initialPredicateBalance", initialPredicateBalance.toString());
  //
  // const depositTx = await wallet
  //   .transfer(predicate.address, amount0.toFixed(0), token0.assetId, { gasPrice: 1 })
  //   .catch((e) => console.error(`depositTx ${e}`));
  // await depositTx?.waitForResult();
  // //
  // const feeTx = await wallet
  //   .transfer(predicate.address, 1, TOKENS_BY_SYMBOL.ETH.assetId, { gasPrice: 1 })
  //   .catch((e) => console.error(`feeTx ${e}`));
  // await feeTx?.waitForResult();
  //
  // const predicateBalances = await predicate.getBalances();
  // console.log(
  //   "predicateBalances",
  //   predicateBalances.map((v) => ({
  //     amount: v.amount.toString(),
  //     assetId: v.assetId.toString(),
  //   }))
  // );
  // //---------------------
  // // const cancelTx = await wallet.transfer(predicate.address, 0, token0.assetId, {
  // //   gasPrice: 1,
  // // });
  // // await cancelTx.waitForResult();
  // //
  // // const finalPredicateBalance = await predicate.getBalances();
  // // console.log(
  // //   "finalPredicateBalance",
  // //   finalPredicateBalance.map((v) => v.amount.toString())
  // // );
  //
  // // creating request
  // const request = new ScriptTransactionRequest({
  //   gasLimit: 10000,
  //   gasPrice: 1,
  //   inputs: [
  //     {
  //       // other asset UTXO
  //       type: InputType.Coin,
  //       id: token0UTXO.id,
  //       owner: token0UTXO.owner.toB256(),
  //       amount: token0UTXO.amount,
  //       assetId: token0.assetId,
  //       txPointer: "0x00000000000000000000000000000000",
  //       witnessIndex: 0,
  //       maturity: 0,
  //     },
  //     {
  //       // native asset UTXO to pay the transaction
  //       type: InputType.Coin,
  //       id: ethUTXO.id,
  //       owner: ethUTXO.owner.toB256(),
  //       amount: ethUTXO.amount,
  //       assetId: eth.assetId,
  //       txPointer: "0x00000000000000000000000000000000",
  //       witnessIndex: 0,
  //       maturity: 0,
  //     },
  //   ],
  //   outputs: [
  //     {
  //       // output coin with amount that should be fowarded to predicate
  //       type: OutputType.Coin,
  //       assetId: token0.assetId,
  //       amount: 0,
  //       to: predicate.address.toB256(),
  //     },
  //     {
  //       // output change from other asset to the sender of the transaction
  //       type: OutputType.Change,
  //       assetId: token0.assetId,
  //       to: wallet.address.toB256(),
  //     },
  //     {
  //       // output change from native asset to the sender of the transaction
  //       type: OutputType.Change,
  //       assetId: eth.assetId,
  //       to: wallet.address.toB256(),
  //     },
  //   ],
  //   witnesses: ["0x"],
  // });
  //
  // try {
  //   const transaction = await wallet.populateTransactionWitnessesSignature(request);
  //   const tx = await wallet.provider.sendTransaction(transaction);
  //   await tx.waitForResult();
  // } catch (e) {
  //   console.log("error", e);
  // }
})();
