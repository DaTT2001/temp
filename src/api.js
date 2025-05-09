export const API_BASE_URL = 'http://117.6.40.130:8080/api';

export const formatTemperatureData = (record) => ({
//   timestamp: new Date(record.timestamp).toLocaleTimeString(),
  timestamp: record.timestamp,

  sensors: [
    record.sensor1_temperature,
    record.sensor2_temperature,
    record.sensor3_temperature,
    record.sensor4_temperature,
    record.sensor5_temperature,
    record.sensor6_temperature,
    record.sensor7_temperature,
    record.sensor8_temperature,
  ],
});

export const fetchDailyData = async (table, date) => {
  // Kiểm tra đầu vào
  if (!table || !(date instanceof Date) || isNaN(date)) {
    console.error('Invalid input provided to fetchDailyData:', { table, date });
    return [];
  }

  try {
    // *** SỬA LẠI Ở ĐÂY: Lấy năm, tháng, ngày theo giờ địa phương ***
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 vì getMonth từ 0-11
    const day = date.getDate().toString().padStart(2, '0');

    // Tạo chuỗi "YYYY-MM-DD" từ các thành phần địa phương
    const formattedDate = `${year}-${month}-${day}`;
    // *** Kết thúc sửa ***

    // Tạo URL API
    const apiUrl = `${API_BASE_URL}/${table}?date=${formattedDate}`;
    console.log(apiUrl); // Log URL đúng

    // Gọi API
    const response = await fetch(apiUrl);

    // Kiểm tra response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${table} on ${formattedDate}`);
    }

    // Parse JSON
    const result = await response.json();

    // Trả về mảng data
    return result.data || [];

  } catch (error) {
    // Log lỗi
    console.error(`Error fetching daily data for ${table} on ${date.toLocaleDateString()}:`, error); // Log lỗi với ngày địa phương
    return [];
  }
};