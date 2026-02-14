
export const setUser = (data: any) => {
  localStorage.setItem("currentUser", JSON.stringify(data));
};

export const getUser = (): any | null => {
  const item = localStorage.getItem("currentUser");
  return item ? JSON.parse(item) : null;
};

export const clearUser = () => {
  localStorage.removeItem("currentUser");
};
