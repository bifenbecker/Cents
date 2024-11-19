export default [
  {
    fieldName: "bleach for whites",
    type: "single",
    options: [
      {value: "yes", isDefault: false},
      {value: "no", isDefault: true},
    ],
  },
  {
    fieldName: "wash temperature",
    type: "single",
    options: [
      {value: "cold", isDefault: false},
      {value: "warm", isDefault: true},
      {value: "hot", isDefault: false},
    ],
  },
  {
    fieldName: "extra services",
    type: "multi",
    options: [{value: "color sorted"}, {value: "folded"}, {value: "ironed"}],
  },
];
