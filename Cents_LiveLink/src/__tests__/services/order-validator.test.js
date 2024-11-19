import {ORDER_VALIDATOR_CALLED_FROM} from "../../services/order-validator";

describe("OrderValidator Service", () => {
  describe("ORDER_VALIDATOR_CALLED_FROM values", () => {
    it("should have proper values", () => {
      expect(ORDER_VALIDATOR_CALLED_FROM.CREATE_ONLINE_ORDER).toBeDefined();
      expect(ORDER_VALIDATOR_CALLED_FROM.MANAGE_ORDER).toBeDefined();
    });
  });
});
