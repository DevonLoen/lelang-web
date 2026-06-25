export const formatDateEnUS = (date: Date | null): string => {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toLocaleDateString("en-US");
};

export const formatDateReq = (date: string | null): string => {
  if (!date) {
    return "";
  }

  const dateObject = new Date(date);

  if (isNaN(dateObject.getTime())) {
    return "";
  }

  const year = dateObject.getFullYear();

  const month = String(dateObject.getMonth() + 1).padStart(2, "0");

  const day = String(dateObject.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
