import {httpClient} from "api";
import {AxiosResponse} from "axios";

import {IMachine, ISelfServeOrder, ITheme} from "../types";

export const fetchMachineDataByUniqueCode: (
  uniqueCode: string
) => Promise<AxiosResponse<IMachine>> = async uniqueCode => {
  return httpClient({
    method: "GET",
    url: `/live-status/machine/${uniqueCode}/details-by-barcode`,
  });
};

export const fetchBusinessThemeByUniqueCode: (
  uniqueCode: string
) => Promise<AxiosResponse<{success: boolean; theme: ITheme}>> = async uniqueCode => {
  return httpClient({
    method: "GET",
    url: `/live-status/machine/${uniqueCode}/business-theme-by-barcode`,
  });
};

export const fetchSendSelfServeOrder: (
  data: ISelfServeOrder
) => Promise<
  AxiosResponse<
    {
      success: boolean;
      turnId: number;
    },
    any
  >
> = async ({machineId, quantity, promotionId}: ISelfServeOrder) => {
  return httpClient({
    method: "POST",
    url: `/live-status/machine/${machineId}/run`,
    data: {quantity, promotionId},
  });
};
