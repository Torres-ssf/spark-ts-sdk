import { Predicate, Provider } from "fuels";
import { LimitOrderPredicateAbi__factory } from "./predicates";
import { LimitOrderPredicateAbiConfigurables } from "./predicates/factories/LimitOrderPredicateAbi__factory";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class Order extends Predicate {
  constructor(
    configurableConstants: Omit<LimitOrderPredicateAbiConfigurables, "PRICE_DECIMALS">,
    nodeUrl?: string
  ) {
    super(
      LimitOrderPredicateAbi__factory.bin,
      LimitOrderPredicateAbi__factory.abi,
      new Provider(nodeUrl ?? "defaultRpc"),
      { ...configurableConstants, PRICE_DECIMALS: 9 }
    );
  }
}
