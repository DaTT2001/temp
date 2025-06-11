export const API_BASE_URL = 'http://117.6.40.130:8080/api';
import axios from 'axios';
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

export const fetchAllProducts = async () => {
  const res = await axios.get('http://117.6.40.130:1337/api/products?populate=image&pagination[page]=1&pagination[pageSize]=1000')
  return res.data.data
}

export const createReport = async (data) => {
  const res = await axios.post('http://117.6.40.130:1337/api/reports', { data })
  return res.data.data.documentId
}

export const updateReport = async (id, data) => {
  await axios.put(`http://117.6.40.130:1337/api/reports/${id}`, { data })
}

export const fetchReportData = async (params) => {
  const res = await axios.get('/api/report', { params })
  return res.data
}

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('files', file)
  const res = await axios.post('http://117.6.40.130:1337/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data[0]?.id
}

export const createProduct = async (data) => {
  await axios.post('http://117.6.40.130:1337/api/products', { data })
}

export const fetchRangeData = async (table, date, startTime, endTime) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`
  const url = `${API_BASE_URL}/${table}?date=${formattedDate}&start_time=${startTime}&end_time=${endTime}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Fetch error')
  const result = await response.json()
  return result.data || []
}

export async function updateGoogleSheet({
  maKD,
  tenSP,
  loaiLo,
  maLo,
  maDongChay,
  vatLieu,
  t4temp,
  t4time1,
  t4time2,
  t4in,
  t4out,
  t5temp,
  t5time1,
  t5time2,
  t5in,
  t5out,
  t41, t42, t43, t44, t45,
  t51, t52, t53, t54, t55,
  t56, t57, t58, t59, t60, t61,
  nsx,
}) {
  const res = await fetch('http://117.6.40.130:5001/update-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      maKD,
      tenSP,
      loaiLo,
      maLo,
      maDongChay,
      vatLieu,
      t4temp,
      t4time1,
      t4time2,
      t4in,
      t4out,
      t5temp,
      t5time1,
      t5time2,
      t5in,
      t5out,
      t41, t42, t43, t44, t45,
      t51, t52, t53, t54, t55,
      t56, t57, t58, t59, t60, t61,
      nsx,
    })
  });

  const data = await res.json();
  if (data.success) {
    if (data.sheetUrl) {
      console.log("📄 Link báo cáo:", data.sheetUrl);
      window.open(data.sheetUrl, "_blank"); // ← mở tab mới
    }

    return data.sheetUrl; // 👈 Trả link ra để code ngoài dùng tiếp
  } else {
    throw new Error(data.message || 'Cập nhật thất bại');
  }
}

export const fetchReportDataById = async (id) => {
  const res = await fetch(`http://117.6.40.130:1337/api/reports/${id}`)
  const data = await res.json()
  return data // hoặc data.data tuỳ API
}