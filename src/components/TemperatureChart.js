import React, { useEffect, useState, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { fetchDailyData, formatTemperatureData } from '../api' // Đảm bảo đường dẫn đúng
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  useColorModes, // Hook để lấy theme từ CoreUI/Local Storage
} from '@coreui/react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';

echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, DataZoomComponent, LineChart, CanvasRenderer
]);

// --- Định nghĩa ECharts Themes ---
const lightTheme = {
    color: [
      '#1976d2', // Blue
      '#ff9800', // Orange
      '#e53935', // Red
      '#8e24aa', // Purple
      '#43a047', // Green
      '#fbc02d', // Yellow
      '#00bcd4', // Cyan
      '#757575', // Grey
    ],
    textStyle: { color: '#222' },
    title: { textStyle: { color: '#222' }, subtextStyle: { color: '#666' } },
    legend: { textStyle: { color: '#333' } },
    tooltip: { backgroundColor: 'rgba(255,255,255,0.97)', borderColor: '#bbb', textStyle: { color: '#222' } },
    axisLabel: { color: '#333' },
    axisLine: { lineStyle: { color: '#bbb' } },
    axisTick: { lineStyle: { color: '#bbb' } },
    splitLine: { lineStyle: { color: ['#eee'] } },
    toolbox: { iconStyle: { borderColor: '#666' } },
    dataZoom: {
      textStyle: { color: '#333' },
      borderColor: "#bbb",
      fillerColor: "rgba(25, 118, 210, 0.15)",
      dataBackground: { lineStyle: { color: "#bbb" }, areaStyle: { color: "#e3f2fd" } },
      handleStyle: { color: "#1976d2", borderColor: "#888" }
    }
  };
const darkTheme = {
  color: ['#83bff6', '#a9d96c', '#fddb7d', '#f19090', '#8cd3e7', '#6bc89a', '#fdab89', '#b38fcf'],
  textStyle: { color: '#ccc' },
  title: { textStyle: { color: '#eee' }, subtextStyle: { color: '#888' } },
  legend: { textStyle: { color: '#ccc' } },
  tooltip: { backgroundColor: 'rgba(30,30,30,0.9)', borderColor: '#555', textStyle: { color: '#ccc' } },
  axisLabel: { color: '#ccc' },
  axisLine: { lineStyle: { color: '#555' } },
  axisTick: { lineStyle: { color: '#555' } },
  splitLine: { lineStyle: { color: ['#333'] } },
  toolbox: { iconStyle: { borderColor: '#aaa' } },
  dataZoom: { textStyle: { color: '#ccc' }, borderColor: "#555", fillerColor: "rgba(131,191,246,0.2)", dataBackground: { lineStyle: { color: "#555" }, areaStyle: { color: "#333" } }, handleStyle: { color: "#83bff6", borderColor: "#777" } }
};
// Đăng ký themes với ECharts
echarts.registerTheme('light', lightTheme);
echarts.registerTheme('dark', darkTheme);
// --- Kết thúc Themes ---

// --- Hàm Helpers ---
// Format timestamp thành HH:MM:SS
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    // Sử dụng 'en-GB' để có định dạng 24 giờ HH:MM:SS
    return new Date(timestamp).toLocaleTimeString('en-GB');
  } catch (e) { console.error("Error formatting time:", timestamp, e); return ''; }
};
// Format Date object thành YYYY-MM-DD (theo giờ địa phương)
const formatDateToYYYYMMDD = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    // Trả về ngày hôm nay nếu date không hợp lệ để tránh lỗi input
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 vì getMonth từ 0-11
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
// --- Kết thúc Helpers ---

// Component biểu đồ nhiệt độ dùng chung
const TemperatureChart = ({ tableName, chartTitle }) => {
  // Lấy theme hiện tại từ CoreUI (thường là từ Local Storage)
  // Key phải khớp với key dùng trong AppHeader.js
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
console.log(colorMode); // Log theme hiện tại để kiểm tra

  // State quản lý dữ liệu, ngày, loading, lỗi
  const [historicalData, setHistoricalData] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date()) // Mặc định là ngày hiện tại
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Refs để lưu trạng thái zoom và legend của ECharts mà không gây re-render
  const echartsRef = useRef(null);
  const legendStateRef = useRef({}); // Lưu trạng thái ẩn/hiện của legend
  const zoomStateRef = useRef({ start: 0, end: 100 }); // Lưu % zoom

  // Hàm gọi API để lấy dữ liệu lịch sử theo ngày và bảng
  const fetchDataForDate = async (date) => {
    setLoading(true) // Bắt đầu loading
    setError(null) // Xóa lỗi cũ
    try {
      const rawData = await fetchDailyData(tableName, date) // Gọi API
      // Format và sắp xếp dữ liệu nhận được
      const formattedData = rawData.map(record => formatTemperatureData(record))
      formattedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setHistoricalData(formattedData) // Cập nhật state dữ liệu
      zoomStateRef.current = { start: 0, end: 100 }; // Reset zoom khi có dữ liệu mới
    } catch (err) {
      // Xử lý lỗi nếu gọi API thất bại
      const errorMsg = `Failed to fetch data for ${tableName} on ${date.toLocaleDateString()}. Check console.`
      setError(errorMsg)
      console.error(`Error fetching data for ${tableName}:`, err);
      setHistoricalData([]) // Xóa dữ liệu cũ nếu lỗi
    } finally {
      setLoading(false) // Kết thúc loading dù thành công hay thất bại
    }
  }

  // useEffect để fetch dữ liệu khi component mount lần đầu hoặc khi ngày/bảng thay đổi
  useEffect(() => {
    fetchDataForDate(selectedDate)
  }, [selectedDate, tableName]) // Dependencies: chạy lại khi selectedDate hoặc tableName thay đổi

  // Hàm xử lý khi người dùng chọn ngày mới từ input date
  const handleDateChange = (event) => {
    const dateString = event.target.value; // Lấy chuỗi "YYYY-MM-DD"
    // Tạo Date object từ chuỗi, giữ múi giờ địa phương
    const [year, month, day] = dateString.split('-').map(Number);
    // new Date(year, monthIndex, day) - monthIndex là 0-11
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate) // Cập nhật state ngày đã chọn
  }

  // Xác định theme thực tế cho ECharts ('light' hoặc 'dark'), xử lý trường hợp 'auto'
  const echartsTheme = useMemo(() => {
    if (colorMode === 'auto') {
      // Kiểm tra cài đặt theme của hệ điều hành nếu là 'auto'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    // Nếu là 'light' hoặc 'dark', dùng trực tiếp giá trị đó
    return colorMode;
  }, [colorMode]); // Tính toán lại khi colorMode từ useColorModes thay đổi
  
  // Tạo cấu hình (option) cho ECharts, tính toán lại khi dependencies thay đổi
  const echartOptions = useMemo(() => {
    const SENSOR_NAMES = Array.from({ length: 8 }, (_, i) => `Sensor ${i + 1}`);
    const formattedDateStr = selectedDate.toLocaleDateString('en-GB'); // Định dạng DD/MM/YYYY

    // Xử lý trạng thái loading, error, hoặc không có dữ liệu -> hiển thị thông báo trên biểu đồ
    if (loading || error || !historicalData || historicalData.length === 0) {
      let subtext = `Date: ${formattedDateStr}`;
      if (loading) subtext = 'Loading data...';
      if (error) subtext = `Error: ${error}`; // Hiển thị lỗi nếu có
      if (!loading && !error && (!historicalData || historicalData.length === 0)) {
          subtext = `No data available for ${formattedDateStr}`;
      }
      // Trả về cấu hình tối thiểu chỉ có tiêu đề và phụ đề thông báo
      return {
        title: {
          text: chartTitle,
          subtext: subtext,
          left: 'center',
          // textStyle và subtextStyle sẽ được theme quản lý
        },
      };
    }

    // Lọc dữ liệu hợp lệ (phòng trường hợp API trả về bản ghi không đúng cấu trúc)
    const validData = historicalData.filter(item => item && Array.isArray(item.sensors));

    // Trả về cấu hình ECharts hoàn chỉnh khi có dữ liệu
    return {
      // backgroundColor sẽ do theme quản lý
      title: {
        text: chartTitle,
        subtext: `Date: ${formattedDateStr}`,
        left: 'center',
      },
      tooltip: { // Cấu hình tooltip khi hover
        trigger: 'axis', // Kích hoạt khi hover trên trục X
        axisPointer: { type: 'cross' }, // Hiển thị đường gióng
      },
      legend: { // Cấu hình chú giải (Sensors)
        data: SENSOR_NAMES,
        top: 50, // Vị trí dưới tiêu đề
        type: 'scroll', // Cho phép cuộn nếu quá nhiều legend
        selected: legendStateRef.current, // Áp dụng trạng thái ẩn/hiện đã lưu từ ref
      },
      grid: { // Khoảng cách lề của khu vực vẽ biểu đồ
        top: 100, bottom: 80, left: '5%', right: '5%', containLabel: true
      },
      toolbox: { // Các công cụ tiện ích (lưu ảnh, zoom, khôi phục)
        right: 20,
        feature: {
          saveAsImage: { name: `${tableName}_Chart_${formattedDateStr.replace(/\//g, '-')}` },
          dataZoom: { yAxisIndex: 'none' }, // Chỉ cho phép zoom/pan trục X
          restore: {}, // Nút khôi phục về trạng thái ban đầu
        },
      },
      xAxis: { // Cấu hình trục X (Thời gian)
        type: 'category', // Kiểu trục category
        boundaryGap: false, // Đường line bắt đầu từ trục Y
        data: validData.map(d => formatTime(d.timestamp)), // Dữ liệu là mảng thời gian đã format
      },
      yAxis: { // Cấu hình trục Y (Nhiệt độ)
        type: 'value', // Kiểu trục giá trị số
        name: 'Temperature (°C)', // Tên trục
        nameLocation: 'middle', // Vị trí tên trục
        nameGap: 45, // Khoảng cách tên trục và trục
        axisLabel: { formatter: '{value} °C' }, // Format nhãn trên trục
      },
      dataZoom: [ // Cấu hình zoom/pan
        { // Thanh trượt zoom ở dưới
          type: 'slider', xAxisIndex: 0, filterMode: 'filter', // filterMode giúp giữ nguyên hình dạng đường line khi zoom
          start: zoomStateRef.current.start, end: zoomStateRef.current.end, // Áp dụng % zoom đã lưu
          height: 25, bottom: 20,
        },
        { // Zoom bằng cách kéo thả chuột/touch bên trong biểu đồ
          type: 'inside', xAxisIndex: 0,
          start: zoomStateRef.current.start, end: zoomStateRef.current.end,
        },
      ],
      series: SENSOR_NAMES.map((name, i) => ({ // Dữ liệu các đường line (mỗi sensor một series)
        name: name, // Tên series khớp với legend
        type: 'line', // Kiểu biểu đồ đường
        smooth: true, // Làm mượt đường line
        showSymbol: false, // Ẩn các điểm marker trên đường line
        // Lấy dữ liệu sensor thứ i, dùng null nếu giá trị không hợp lệ/thiếu
        data: validData.map(d => (d.sensors && typeof d.sensors[i] === 'number') ? d.sensors[i] : null),
        emphasis: { focus: 'series' }, // Hiệu ứng khi hover: làm nổi bật series đang hover
      })),
    };
    // Dependencies của useMemo: tính toán lại options khi các giá trị này thay đổi
  }, [historicalData, selectedDate, loading, error, tableName, chartTitle, echartsTheme]);

  // Callback xử lý sự kiện zoom từ ECharts
  const handleDataZoom = (params) => {
    // Lấy % start/end từ event (có thể nằm trong batch nếu có nhiều dataZoom)
    const { start, end } = params.batch ? params.batch[0] : params;
    if (start !== undefined && end !== undefined) {
      // Lưu trạng thái zoom vào ref để không gây re-render
      zoomStateRef.current = { start, end };
    }
  };

  // Callback xử lý sự kiện thay đổi legend (click vào tên sensor) từ ECharts
  const handleLegendChange = (params) => {
    // Lưu trạng thái selected (ẩn/hiện) của legend vào ref
    legendStateRef.current = params.selected;
  };

  // Tạo ID động cho input date để tránh trùng lặp ID khi có nhiều biểu đồ trên cùng trang
  const datePickerId = `datePicker-${tableName}`;

  // Render JSX của component
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>{chartTitle}</strong> {/* Hiển thị tiêu đề từ props */}
        <div className="small text-body-secondary">
          {/* Hiển thị ngày đã chọn */}
          Date: {selectedDate.toLocaleDateString('en-GB')}
        </div>
      </CCardHeader>
      <CCardBody>
        {/* Input chọn ngày và spinner loading */}
        <CRow className="mb-3 align-items-center">
          <CCol xs="auto">
            <label htmlFor={datePickerId} className="col-form-label">Select Date:</label>
          </CCol>
          <CCol xs="auto">
            <input
              type="date"
              id={datePickerId} // ID động
              className="form-control"
              value={formatDateToYYYYMMDD(selectedDate)} // Value từ state đã format
              onChange={handleDateChange} // Hàm xử lý khi chọn ngày
              disabled={loading} // Vô hiệu hóa khi đang load dữ liệu
            />
          </CCol>
          {/* Hiển thị spinner khi đang loading */}
          {loading && <CCol xs="auto"><CSpinner size="sm" /> Loading...</CCol>}
        </CRow>

        {/* Hiển thị thông báo lỗi nếu có (và không đang loading) */}
        {error && !loading && <div className="alert alert-danger" role="alert">{error}</div>}

        {/* Component ReactECharts để vẽ biểu đồ */}
        <ReactECharts
          key={echartsTheme} // Đảm bảo vẽ lại khi theme thay đổi
          ref={echartsRef} // Ref để có thể truy cập instance ECharts nếu cần sau này
          option={echartOptions} // Cấu hình biểu đồ đã tạo ở trên
          theme={echartsTheme} // Áp dụng theme 'light' hoặc 'dark' đã xác định
          notMerge={true} // Quan trọng: Không merge cấu hình cũ khi update, vẽ lại hoàn toàn
          lazyUpdate={true} // Tối ưu hiệu năng, chỉ update khi cần
          style={{ height: '500px', width: '100%' }} // Kích thước biểu đồ
          onEvents={{ // Gắn các hàm xử lý sự kiện của ECharts
            'datazoom': handleDataZoom, // Sự kiện zoom/pan
            'legendselectchanged': handleLegendChange, // Sự kiện click legend
          }}
        />
      </CCardBody>
    </CCard>
  );
}

// Định nghĩa kiểu dữ liệu và yêu cầu cho props sử dụng PropTypes
TemperatureChart.propTypes = {
  tableName: PropTypes.string.isRequired, // Tên bảng là bắt buộc và phải là string
  chartTitle: PropTypes.string.isRequired, // Tiêu đề là bắt buộc và phải là string
}

export default TemperatureChart;