/**
 * Truncates a blockchain address to show only the first and last few characters
 * @param address The full address to truncate
 * @param startChars Number of characters to show at the start (default: 6)
 * @param endChars Number of characters to show at the end (default: 4)
 * @returns Truncated address string with ellipsis in the middle
 */
export const truncateAddress = (
  address?: string | null,
  startChars: number = 6,
  endChars: number = 4
): string => {
  if (!address) return "Not Connected";
  
  // If address is shorter than the combined length of start and end chars, return the full address
  if (address.length <= startChars + endChars) return address;
  
  return `${address.substring(0, startChars)}...${address.substring(
    address.length - endChars
  )}`;
};