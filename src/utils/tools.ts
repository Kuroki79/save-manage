export const parseCustomDate = (dateString: string) => {
  // 确保输入的字符串符合预期格式
  if (!/^\d{8}\s\d{6}$/.test(dateString)) {
    throw new Error("Invalid date format. Expected 'YYYYMMDD HHmmss'");
  }
  
  const year = parseInt(dateString.substr(0, 4));
  const month = parseInt(dateString.substr(4, 2));
  const day = parseInt(dateString.substr(6, 2));
  const hour = parseInt(dateString.substr(9, 2));
  const minute = parseInt(dateString.substr(11, 2));
  const second = parseInt(dateString.substr(13, 2));
  
  return new Date(year, month - 1, day, hour, minute, second);
};