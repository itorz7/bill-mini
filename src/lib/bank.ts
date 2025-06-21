const normalizeName = (name: string): string => {
  const thaiPrefixes = [
    "นาย",
    "นางสาว",
    "นาง",
    "น.ส.",
    "นส.",
    "ด.ช.",
    "ดช.",
    "ด.ญ.",
    "ดญ.",
    "ดช",
    "ดญ",
    "เด็กชาย",
    "เด็กหญิง",
    "MR.",
    "MS.",
    "MR",
    "MS",
    "MISS",
  ];

  let cleanedName = name;
  for (const prefix of thaiPrefixes) {
    const regex = new RegExp(`^${prefix}\\s*`, "i");
    cleanedName = cleanedName.replace(regex, "");
  }

  cleanedName = cleanedName.toLowerCase();
  cleanedName = cleanedName.replace(/[^a-z0-9ก-ฮ\s]+/gi, "");
  cleanedName = cleanedName.replace(/\s{2,}/g, " ").trim();

  return cleanedName;
};

export const checkAccount = (account: string, reference: string): boolean => {
  const cleanAccount = account.toUpperCase().replace(/-/g, "");
  const cleanReference = reference.replace(/-/g, "");

  if (cleanAccount.length !== cleanReference.length) {
    return false;
  }

  const replaced = [...cleanReference].reduce((acc: string, char: string) => {
    return acc.replace(char, "X");
  }, cleanAccount);

  return !/[^X]/.test(replaced);
};

export const checkName = (name: string, list: string[]): boolean => {
  const normalizedName = normalizeName(name);
  return list.some((listName) => {
    return normalizeName(listName).includes(normalizedName);
  });
};