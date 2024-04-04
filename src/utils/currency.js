function formatVND(amount) {
  // Check if the input is a number
  if (isNaN(amount)) {
    return "Invalid input";
  }

  // Round to 2 decimal places
  amount = parseFloat(amount.toFixed(2));

  // Add commas for thousands separator
  let parts = amount.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Concatenate VND sign and return formatted string
  return parts.join(".") + " đ";
}

export { formatVND };
