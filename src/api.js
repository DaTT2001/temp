import axios from 'axios';
import {
  API_BASE_URL,
  STRAPI_BASE_URL,
  CAMERA_BASE_URL,
} from './config';
// ...existing code...
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
    const apiUrl = `${API_BASE_URL}/daily/${table}?date=${formattedDate}`;

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
  const res = await axios.get(
    `${STRAPI_BASE_URL}/products?populate=image&pagination[page]=1&pagination[pageSize]=1000`
  )
  return res.data.data
}

export const createReport = async (data) => {
  const res = await axios.post(`${STRAPI_BASE_URL}/reports`, { data })
  return res.data.data.documentId
}

export const updateReport = async (id, data) => {
  await axios.put(`${STRAPI_BASE_URL}/reports/${id}`, { data })
}

export const fetchReportData = async (params) => {
  const res = await axios.get('/api/report', { params })
  return res.data
}

export const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('files', file)
  const res = await axios.post(`${STRAPI_BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data[0]?.id
}

export const createProduct = async (data) => {
  await axios.post(`${STRAPI_BASE_URL}/products`, { data })
}

export const fetchRangeData1 = async (table, startDateTime, endDateTime) => {
  try {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start) || isNaN(end)) {
      throw new Error('Invalid date');
    }

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const url = `${API_BASE_URL}/${table}?start_time=${startIso}&end_time=${endIso}`;
    console.log(url);


    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error(`❌ Lỗi khi fetch dữ liệu từ ${table}:`, error);
    throw error;
  }
};

export const fetchRangeData = async (table, startDateTime, endDateTime) => {
  try {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (isNaN(start) || isNaN(end)) {
      throw new Error('Invalid date');
    }

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const url = `${API_BASE_URL}/${table}?start_time=${startIso}&end_time=${endIso}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.statusText}`);
    }

    const result = await response.json();

    const filteredData = (result.data || []).filter(item => {
      // Bỏ qua nếu tất cả sensorX_temperature đều bằng 0
      const sensorValues = Object.entries(item)
        .filter(([key]) => key.includes('sensor') && key.includes('temperature'))
        .map(([, value]) => value);
      return sensorValues.some(val => val !== 0);
    });

    return filteredData;
  } catch (error) {
    console.error(`❌ Lỗi khi fetch dữ liệu từ ${table}:`, error);
    throw error;
  }
};

export const fetchRangeDataResult = async (table, startISO, endISO) => {
  try {
    const startUTC = new Date(startISO).toISOString();
    const endUTC = new Date(endISO).toISOString();

    const url = `${API_BASE_URL}/${table}/sample?start_time=${startUTC}&end_time=${endUTC}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const result = await response.json();

    // ❌ KHÔNG convert nữa vì server đã trả giờ local
    return result;
  } catch (error) {
    console.error(`Error fetching ${table} data:`, error);
    throw error;
  }
};

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
  const res = await fetch(`${CAMERA_BASE_URL}/update-sheet`, {
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
      window.open(data.sheetUrl, "_blank"); // ← mở tab mới
    }

    return data.sheetUrl; // 👈 Trả link ra để code ngoài dùng tiếp
  } else {
    throw new Error(data.message || 'Cập nhật thất bại');
  }
}

export const fetchReportDataById = async (id) => {
  const res = await fetch(`${STRAPI_BASE_URL}/reports/${id}`)
  const data = await res.json()
  return data // hoặc data.data tuỳ API
}