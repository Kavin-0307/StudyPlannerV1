export const extractList = (res: any) => {
  if (Array.isArray(res.data)) return res.data;
  if (res.data?.data) return res.data.data;
  return [];
};

export const extractObject = (res: any) => {
  return res.data?.data || res.data;
};