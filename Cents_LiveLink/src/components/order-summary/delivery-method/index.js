import React, {useState, useMemo} from "react";
import {Text, Image, Flex, Button} from "rebass/styled-components";

import {IllustrationDelivery} from "../../../assets/images";

import useWindowSize from "../../../hooks/useWindowSize";

import {setOnlineOrderReturnMethod, fetchOrderDetail} from "../../../api/order";
import {RETURN_METHODS_DISPLAY, RETURN_METHODS} from "../constants";

import {DockModal, ToastError} from "../../common";
import {toast} from "react-toastify";

const DeliveryMethod = props => {
  const {isOpen, orderToken, setOrder} = props;
  const [loading, setLoading] = useState(false);
  const [width, height] = useWindowSize();

  const setReturnMethod = async returnMethod => {
    try {
      setLoading(true);
      await setOnlineOrderReturnMethod(orderToken, {returnMethod});
      const res = await fetchOrderDetail(orderToken);
      const order = res?.data?.order;
      setOrder(order);
    } catch (err) {
      toast.error(
        <ToastError
          message={err?.response?.data?.error || "Could not select the return method"}
        />
      );
    } finally {
      setLoading(false);
    }
  };

  const getSize = useMemo(() => {
    if (height >= 568) {
      return 445;
    } else {
      return 0.75 * height;
    }
  }, [height]);

  const fontSize = width < 300 ? "16px" : width <= 340 ? "20px" : "24px";

  return (
    <DockModal
      isOpen={!!isOpen}
      provideBackOption={false}
      fixedSize
      size={getSize}
      loading={loading}
    >
      <Flex {...styles.mainWrapper}>
        <Text {...styles.description} fontSize={fontSize}>
          Save time! Get your laundry delivered back to you.
        </Text>
        <Image src={IllustrationDelivery} {...styles.image} />
        <Flex {...styles.footer.wrapper}>
          {Object.entries(RETURN_METHODS_DISPLAY).map(([method, display], index) => (
            <Button
              variant={method === RETURN_METHODS.delivery ? "primary" : "outline"}
              {...styles.footer.button}
              onClick={() => setReturnMethod(method)}
              key={index}
            >
              {display}
            </Button>
          ))}
        </Flex>
      </Flex>
    </DockModal>
  );
};

const styles = {
  mainWrapper: {
    sx: {
      height: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    padding: "20px",
  },

  description: {
    color: "BLACK",
    fontWeight: 500,
    lineHeight: "28px",
  },

  image: {
    width: "100%",
    height: ["225px", "225px", "225px", "300px", "300px"],
  },
  footer: {
    wrapper: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    button: {
      width: "100%",
      height: "62px",
      fontSize: "14px",
      margin: "0px 5px",
      sx: {
        textTransform: "uppercase",
      },
    },
  },
  error: {
    pb: "10px",
  },
};

export default DeliveryMethod;
