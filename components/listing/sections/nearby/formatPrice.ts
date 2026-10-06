const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** 23600 -> "₹23,600" (Indian digit grouping). */
export function formatRupees(amount: number): string {
  return rupees.format(amount);
}

/** Ratings always show one decimal, e.g. 5 -> "5.0". */
export function formatRating(rating: number): string {
  return Number.isInteger(rating) ? rating.toFixed(1) : String(rating);
}
