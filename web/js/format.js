// Number formatting helpers (peso amounts, months).

export const peso = (value) =>
  "₱" + Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const percent = (ratio) => (ratio * 100).toFixed(1) + "%";

export const months = (value) =>
  value === null ? "not reachable" : `${value} months`;
