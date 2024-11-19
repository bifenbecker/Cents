import {httpClient} from "api";
import {AxiosResponse} from "axios";
import {IAddCredit} from "../types";

interface FillBalanceResponse {
  availableCredits: number;
  success: boolean;
}

export const fetchAddCredit: (
  data: IAddCredit
) => Promise<AxiosResponse<FillBalanceResponse, any>> = async data => {
  return httpClient({
    method: "POST",
    url: "/live-status/customer/payment/fill-balance",
    data,
  });
};
