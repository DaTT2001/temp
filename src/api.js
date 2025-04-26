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
  try {
    const formattedDate = date.toISOString().split('T')[0];
    const response = await fetch(
      `${API_BASE_URL}/${table}?date=${formattedDate}`
    );
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu từ ${table}:`, error);
    return [];
  }
};