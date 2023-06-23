import {
  Coin,
  CoinQuantityLike,
  ContractFactory,
  InputType,
  NativeAssetId,
  OutputType,
  Predicate,
  Provider,
  ScriptTransactionRequest,
  TransactionRequestInput,
  Wallet,
} from "fuels";
import { nodeUrl, alicePrivateKey, adminPrivateKey, bobPrivateKey } from "../src/config";
import { TOKENS_BY_SYMBOL } from "../src/constants";
import { LimitOrderPredicateAbi__factory } from "../src/predicates";
import { ProxyContractAbi__factory } from "../src/proxy";
import BN from "../src/utils/BN";

const PROXY_ADDRESS = "0x8924a38ac11879670de1d0898c373beb1e35dca974c4cab8a70819322f6bd9c4";

(async () => {
  const adminWallet = Wallet.fromPrivateKey(adminPrivateKey, nodeUrl);
  const aliceWallet = Wallet.fromPrivateKey(alicePrivateKey, nodeUrl);
  const bobWallet = Wallet.fromPrivateKey(bobPrivateKey, nodeUrl);
  console.log(await aliceWallet.provider.getChainId());
  return;
  const USDC = TOKENS_BY_SYMBOL.USDC;
  const BTC = TOKENS_BY_SYMBOL.BTC;
  const amount0 = BN.parseUnits(20, USDC.decimals);
  const amount1 = BN.parseUnits(0.001, BTC.decimals);
  const exp = BN.parseUnits(1, 9 + USDC.decimals - BTC.decimals);
  const price = amount1.times(exp).div(amount0);

  //todo
  // ------------------ FUNDING ALICE WALLET ------------------
  // const tx1 = await adminWallet.transfer(aliceWallet.address, 10000);
  // await tx1.waitForResult();
  // const tx2 = await adminWallet.transfer(aliceWallet.address, 10000, USDC.assetId);
  // await tx2.waitForResult();
  // const tx3 = await adminWallet.transfer(aliceWallet.address, 10000, BTC.assetId);
  // await tx3.waitForResult();

  // ------------------ INSTANTIATING PREDICATE ------------------
  const configurableConstants = {
    MAKER: aliceWallet.address.toB256(),
    ASSET0: USDC.assetId,
    ASSET1: BTC.assetId,
    PRICE: price.toFixed(0),
    ASSET0_DECIMALS: USDC.decimals,
    ASSET1_DECIMALS: BTC.decimals,
    PRICE_DECIMALS: 9,
    MIN_FULFILL_AMOUNT0: 1,
  };
  const predicate = new Predicate(
    LimitOrderPredicateAbi__factory.bin,
    await aliceWallet.provider.getChainId(), //chainId
    LimitOrderPredicateAbi__factory.abi,
    aliceWallet.provider,
    configurableConstants
  );
  // funding predicate with NativeAsset to pay transaction fees
  const tx4 = await adminWallet.transfer(predicate.address, 1000);
  await tx4.waitForResult();

  // ------------------ CREATE ORDER USING PROXY CONTRACT------------------
  // Alice places a new USDC order
  // With the contract artifacts we can then deploy the contract

  const proxyContract = ProxyContractAbi__factory.connect(PROXY_ADDRESS, aliceWallet);

  const params = {
    predicate_root: { value: predicate.address.toB256() },
    asset0: { value: configurableConstants.ASSET0 },
    asset1: { value: configurableConstants.ASSET1 },
    maker: { value: configurableConstants.MAKER },
    min_fulfill_amount0: configurableConstants.MIN_FULFILL_AMOUNT0,
    price: configurableConstants.PRICE,
    asset0_decimals: configurableConstants.ASSET0_DECIMALS,
    asset1_decimals: configurableConstants.ASSET1_DECIMALS,
    price_decimals: configurableConstants.PRICE_DECIMALS,
  };

  // Executing the Proxy contract call
  await proxyContract.functions
    .send_funds_to_predicate_root(params)
    .callParams({ forward: [amount0.toFixed(0), USDC.assetId] })
    .call();

  // OR

  // const orderPlace = await aliceWallet.transfer(predicate.address, aliceOrderAmount, USDC_ID);
  // await orderPlace.waitForResult();

  /**
   * ------------------ CREATING TRANSACTION INPUTS AND OUTPUTS ------------------
   * Who is supposed to pay the transaction fee for the cancel order transaction?
   * The predicate or Alice? The answer to this question is important because it defines
   * how this transaction will be created.
   *
   *
   * [IF ALICE PAYS]:
   * If Alice is to pay, we need UTXO(s) (or 'coins') from Alice in the transaction inputs
   * with an amount large enough to cover the transaction fees. This requires that these
   * coins be of the NativeAssetId type. As a result, Alice's UTXOs will always be present
   * in the transaction inputs. Therefore, the predicate condition
   * `if input_owner(i).unwrap() == Address::from(MAKER)` will always return true
   * (with Alice being the 'MAKER'). We also need to add predicate's UTXO(s) with sufficient
   * amount to refund Alice's order amount. This means that these predicate coins should
   * have the assetId of USDC_ID.
   *
   * [IF PREDICATE PAYS]:
   * In this case, Alice's UTXO is symbolic, existing within the transaction inputs to
   * allow the predicate if statement `if input_owner(i).unwrap() == Address::from(MAKER)` to
   * return 'true' (with Alice being the 'MAKER'). We will also need the predicate's UTXOs from 2
   * assetIds: 'NativeAssetId' and 'USDC_ID'. The 'NativeAssetId' UTXO(s) should have
   * sufficient funds to cover the transaction fees and the 'USDC_ID' UTXO(s) should have
   * enough amount to refund Alice's order amount.
   *
   * This case is more complex because Alice's symbolic UTXO must be of a third asset type,
   * meaning that it cannot be of 'NativeAsset' or 'USDC_ID'. This is due to the transaction outputs
   * having 2 'CHANGE' type outputs from each of these 2 assets, both addressed to the predicate.
   * Since the Predicate is paying the transaction (NativeAsset), and refunding Alice's order amount
   * (USDC_ID), we need to add 2 'CHANGE' outputs from these 2 assets addressed back to the predicate.
   * A transacation cannot have more than one 'CHANGE' output from the same asset. Therefore
   * Alice's symbolic UTXO needs to be from a third asset to make it possible to return
   * this UTXO amount back to Alice. Without the 'CHANGE' output for Alice's symbolic
   * UTXOs, this would result in this UTXO amount being lost.
   */

  // // ------------------ CASE 1: ALICE PAYING FEES ------------------
  // // Fetching Alice's UTXOs to pay transaction fees
  // const aliceUtxoToPayFee = (await aliceWallet.getResourcesToSpend([[1, NativeAssetId]])) as Coin[];
  //
  // // looping through UTXOs to create transaction inputs
  // const aliceUtxosToPayFees: TransactionRequestInput[] = aliceUtxoToPayFee.map((utxo) => ({
  //   id: utxo.id,
  //   type: InputType.Coin,
  //   amount: utxo.amount,
  //   assetId: utxo.assetId,
  //   owner: utxo.owner.toB256(),
  //   txPointer: "0x00000000000000000000000000000000",
  //   witnessIndex: 0,
  //   maturity: 0,
  // }));
  //
  // // Fetching predicate's UTXOs to refund Alice's order amount
  // const predicateUtxosToRefundAlice = (await predicate.getResourcesToSpend([
  //   [amount0.toFixed(0), USDC.assetId],
  // ])) as Coin[];
  //
  // // looping through UTXOs to create transaction inputs
  // const predicateInputs: TransactionRequestInput[] = predicateUtxosToRefundAlice.map((utxo) => ({
  //   id: utxo.id,
  //   type: InputType.Coin,
  //   amount: utxo.amount,
  //   assetId: utxo.assetId,
  //   owner: utxo.owner.toB256(),
  //   txPointer: "0x00000000000000000000000000000000",
  //   witnessIndex: 0,
  //   maturity: 0,
  //   predicate: predicate.bytes, // predicate's UTXOs should have the predicate field
  // }));
  //
  // const inputs: TransactionRequestInput[] = [...aliceUtxosToPayFees, ...predicateInputs];
  //
  // const outputs: TransactionRequestOutput[] = [
  //   // Change output back to Alice related to Alice's paying fee UTXO(s)
  //   {
  //     type: OutputType.Change,
  //     assetId: NativeAssetId,
  //     to: aliceWallet.address.toB256(),
  //   },
  //   // Coin output to Alice related to the refunding Alice's order predicate's UTXO(s)
  //   {
  //     type: OutputType.Coin,
  //     amount: amount0.toFixed(0),
  //     assetId: USDC.assetId,
  //     to: aliceWallet.address.toB256(),
  //   },
  //   // Change output back to the Predicate related to the refunding of Alice's order UTXO(s)
  //   {
  //     type: OutputType.Change,
  //     assetId: USDC.assetId,
  //     to: predicate.address.toB256(),
  //   },
  // ];

  // // ------------------ CASE 2: PREDICATE PAYING FEES ------------------
  // // Fetching Alice's symbolic UTXO to make the predicate if statement return true
  // const [aliceSymbolicUtxo] = await aliceWallet.getCoins(BTC.assetId);
  //
  // // creating Alice's transaction input
  // const aliceSymbolicInput: TransactionRequestInput = {
  //   id: aliceSymbolicUtxo.id,
  //   type: InputType.Coin,
  //   amount: aliceSymbolicUtxo.amount,
  //   assetId: aliceSymbolicUtxo.assetId,
  //   owner: aliceSymbolicUtxo.owner.toB256(),
  //   txPointer: "0x00000000000000000000000000000000",
  //   witnessIndex: 0,
  //   maturity: 0,
  // };
  //
  // // Fetching predicate's UTXOs to refund Alice's order amount
  // const quantities: CoinQuantityLike[] = [
  //   [1, NativeAssetId],
  //   [amount0.toFixed(0), USDC.assetId],
  // ];
  // const predicateUtxos = (await predicate.getResourcesToSpend(quantities)) as Coin[];
  //
  // // looping through UTXOs to create transaction inputs
  // const predicateInputs: TransactionRequestInput[] = predicateUtxos.map((utxo) => ({
  //   id: utxo.id,
  //   type: InputType.Coin,
  //   amount: utxo.amount,
  //   assetId: utxo.assetId,
  //   owner: utxo.owner.toB256(),
  //   txPointer: "0x00000000000000000000000000000000",
  //   witnessIndex: 0,
  //   maturity: 0,
  //   predicate: predicate.bytes, // predicate's UTXOs should have the predicate field
  // }));
  //
  // const inputs: TransactionRequestInput[] = [aliceSymbolicInput, ...predicateInputs];
  //
  // const outputs: TransactionRequestOutput[] = [
  //   // Change output back to Alice related to Alice's symbolic UTXO
  //   {
  //     type: OutputType.Change,
  //     assetId: BTC.assetId,
  //     to: aliceWallet.address.toB256(),
  //   },
  //   // Coin output to Alice related to the refunding Alice's order predicate's UTXO(s)
  //   {
  //     type: OutputType.Coin,
  //     amount: amount0.toString(),
  //     assetId: USDC.assetId,
  //     to: aliceWallet.address.toB256(),
  //   },
  //   // Change output back to the Predicate related to paying transactions fees UTXO(s)
  //   {
  //     type: OutputType.Change,
  //     assetId: NativeAssetId,
  //     to: predicate.address.toB256(),
  //   },
  //   // Change output back to the Predicate related to the refunding of Alice's order UTXO(s)
  //   {
  //     type: OutputType.Change,
  //     assetId: USDC.assetId,
  //     to: predicate.address.toB256(),
  //   },
  // ];

  // // ------------------ EXECUTING TRANSACTION ------------------
  // const cancelOrderRequest = new ScriptTransactionRequest({
  //   gasLimit: 10000,
  //   gasPrice: 1,
  //   inputs,
  //   outputs,
  //   witnesses: ["0x"],
  // });
  //
  // // Signing the transaction witnesses with Alice's private key
  // const signedRequest = await aliceWallet.populateTransactionWitnessesSignature(cancelOrderRequest);
  //
  // // Sending the transaction to the chain
  // const cancelOrderTx = await aliceWallet.sendTransaction(signedRequest);
  // await cancelOrderTx.waitForResult();
})();
