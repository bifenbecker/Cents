export const getUpdatedMachinesList = (list, devicePayload) => {
  if (!list?.length) {
    return [];
  }

  const machinesList = [...(list || [])];
  const {
    machineId,
    deviceId,
    deviceName,
    status,
    avgTurnsPerDay,
    avgSelfServeRevenuePerDay,
  } = devicePayload || {};

  const updatedMachineIdx = machinesList.findIndex((m) => m?.id === machineId);
  if (updatedMachineIdx > -1) {
    const updatedMachine = machinesList[updatedMachineIdx];
    machinesList.splice(updatedMachineIdx, 1, {
      ...updatedMachine,
      avgTurnsPerDay,
      avgSelfServeRevenuePerDay,
      device: {
        ...updatedMachine.device,
        id: deviceId,
        name: deviceName,
        status,
      },
    });
  }
  return machinesList;
};

export const prepareCustomerOptions = (list) => {
  if (!list) {
    return [];
  }
  return list.map((customer) => {
    return getCustReactSelectOptionFromCustomer(customer);
  });
};

export const getCustReactSelectOptionFromCustomer = (customer) => {
  if (customer.id) {
    return {
      value: customer?.id,
      label: `${customer?.fullName} \xa0 \xa0 \xa0 \xa0 ${formatPhoneNumber(
        customer?.phoneNumber
      )}`,
    };
  } else {
    return customer;
  }
};

export const getDryerTime = (time, quantity) => {
  const dryerTime = time * quantity;
  let hours, minutes;
  hours = Math.floor(dryerTime / 60);
  minutes = dryerTime % 60;
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return `${hours} : ${minutes}`;
};

export const updatePairedMachinesList = (list, pairedMachines) => {
  if (!list?.length) {
    return [];
  }

  const machinesList = [...(list || [])];

  pairedMachines.forEach((machine) => {
    const idx = machinesList.findIndex(
      (m) => m?.id && machine?.id && m?.id === machine?.id
    );
    if (idx > -1) {
      machinesList.splice(idx, 1, {
        ...machinesList[idx],
        device: {
          id: machine?.device?.id,
          name: machine?.device?.name,
          status: machine?.device?.status,
        },
      });
    }
  });
  return machinesList;
};

export const unpairMachineAndUpdateList = (list, unpairedMachineId) => {
  if (!list?.length) {
    return [];
  }

  const machinesList = [...(list || [])];

  const idx = machinesList.findIndex(
    (m) => m?.id && unpairedMachineId && m?.id === unpairedMachineId
  );

  if (idx > -1) {
    machinesList.splice(idx, 1, {
      ...machinesList[idx],
      device: {},
    });
  }

  return machinesList;
};

function formatPhoneNumber(phoneNumberString) {
  var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
  var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    var intlCode = match[1] ? "+1 " : "";
    return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
  }
  return "";
}
