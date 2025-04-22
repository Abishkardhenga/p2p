// convert a address into trunket addres where first few digit adn last few digit to show and in middle there should be ....


export const truncateAddress = (address: string, start: number = 6, end: number = 4) => {
  if (address.length <= start + end) {
    return address
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`
}


