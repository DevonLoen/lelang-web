export const formatDateEnUS = (date: Date | null): string => {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toLocaleDateString("en-US");
};
