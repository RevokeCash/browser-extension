export const shortenAddress = (address?: string, characters: number = 6): string | undefined => {
  return address && `${address.substr(0, 2 + characters)}...${address.substr(address.length - characters, characters)}`;
};

export const shortenString = (name?: string, maxLength: number = 16): string | undefined => {
  if (!name) return undefined;
  if (name.length <= maxLength) return name;
  return `${name.substr(0, maxLength - 3).trim()}...`;
};
