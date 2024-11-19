import {FetchingStatus} from "types/common";
import {IAvailableCredit} from "../../types";

const initialData: IAvailableCredit = {
  funds: {
    data: {
      amount: null,
    },
    fetchingStatus: FetchingStatus.Initial,
    error: {
      text: "",
      code: "",
    },
  },
};

export default initialData;
