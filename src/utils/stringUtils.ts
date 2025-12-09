export const truncateInMiddle = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  const half = Math.floor((maxLength - 3) / 2);
  const start = text.slice(0, half);
  const end = text.slice(text.length - half);
  return `${start}...${end}`;
};
