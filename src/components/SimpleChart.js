import React from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Đăng ký các thành phần cần thiết cho ECharts
echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer])

// Định nghĩa theme light/dark cho ECharts
const lightTheme = {
  color: [
    '#0d6efd', '#20c997', '#ffc107', '#fd7e14',
    '#e83e8c', '#6f42c1', '#17a2b8', '#adb5bd'
  ],
  textStyle: { color: '#222' },
  legend: { textStyle: { color: '#222' } },
  tooltip: { backgroundColor: 'rgba(255,255,255,0.97)', borderColor: '#bbb', textStyle: { color: '#222' } },
  axisLabel: { color: '#222' },
  axisLine: { lineStyle: { color: '#bbb' } },
  axisTick: { lineStyle: { color: '#bbb' } },
  splitLine: { lineStyle: { color: ['#eee'] } },
}
const darkTheme = {
  color: [
    '#83bff6', '#a9d96c', '#fddb7d', '#f19090',
    '#8cd3e7', '#6bc89a', '#fdab89', '#b38fcf'
  ],
  textStyle: { color: '#ccc' },
  legend: { textStyle: { color: '#ccc' } },
  tooltip: { backgroundColor: 'rgba(30,30,30,0.9)', borderColor: '#555', textStyle: { color: '#ccc' } },
  axisLabel: { color: '#ccc' },
  axisLine: { lineStyle: { color: '#555' } },
  axisTick: { lineStyle: { color: '#555' } },
  splitLine: { lineStyle: { color: ['#333'] } },
}
echarts.registerTheme('light', lightTheme)
echarts.registerTheme('dark', darkTheme)

const sensorNames = Array.from({ length: 6 }, (_, i) => `Sensor ${i + 1}`)

const SimpleChart = ({ data, colorMode = 'light', sale, temp }) => {
  // Chuẩn hóa dữ liệu
  const normalized = data.map(d => ({
    timestamp: d.timestamp,
    sensors: [
      d.sensor3_temperature,
      d.sensor4_temperature,
      d.sensor5_temperature,
      d.sensor6_temperature,
      d.sensor7_temperature,
      d.sensor8_temperature,
    ],
  }))

  // Xác định theme thực tế cho ECharts
  const echartsTheme = colorMode === 'dark' ? 'dark' : 'light'

  // Nếu không có data thì show thông báo
  if (!data || data.length === 0) {
    return (
      <ReactECharts
        option={{
          title: {
            text: 'Temperature Chart',
            subtext: 'No data available',
            left: 'center',
          },
        }}
        theme={echartsTheme}
        style={{ height: 300, width: '100%' }}
      />
    )
  }

  // Lọc dữ liệu hợp lệ
  const validData = normalized.filter(item => item && Array.isArray(item.sensors))

  const option = {
    title: {
      text: `${sale || "Charts"}`,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: [...sensorNames, 'Average'],
      top: 40,
      type: 'scroll',
    },
    grid: { left: 40, right: 20, top: 70, bottom: 40 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: validData.map(d => d.timestamp),
      axisLabel: {
        rotate: 30,
        formatter: value => {
          // Nếu timestamp là ISO string hoặc số, chuyển sang Date
          const date = new Date(value)
          // Hiện giờ:phút:giây
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          // Nếu chỉ muốn giờ:phút thì dùng:
          // return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      },
    },
    yAxis: {
      type: 'value',
      name: 'Temperature (°C)',
      nameLocation: 'middle',
      nameGap: 45,
      axisLabel: { formatter: '{value} °C' },
    },
    series: [
      // Vẽ đủ 6 dòng sensor3 → sensor8
      ...sensorNames.map((name, i) => ({
        name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: validData.map(d =>
          d.sensors && typeof d.sensors[i] === 'number' ? d.sensors[i] : null
        ),
        emphasis: { focus: 'series' },
      })),

      // Đường chuẩn hóa (Standard Line)
      {
        name: 'Standard Line',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: validData.map(() => temp || 0), // Nếu không có temp thì mặc định là 0
        lineStyle: {
          type: 'dashed',
          color: '#ff0000',
          width: 2,
        },
        emphasis: { focus: 'series' },
      },

      // Đường trung bình (Average)
      {
        name: 'Average',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: validData.map(d => {
          const nums = d.sensors.filter(v => typeof v === 'number');
          if (nums.length === 0) return null;
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
          return Number(avg.toFixed(2));
        }),
        lineStyle: {
          type: 'dashed',
          color: '#198754', // xanh lá nổi bật hơn
          width: 2,
        },
        emphasis: { focus: 'series' },
      },
    ],

  }

  return (
    <ReactECharts
      option={option}
      theme={echartsTheme}
      notMerge={true}
      lazyUpdate={true}
      style={{ height: 300, width: '100%' }}
    />
  )
}

export default SimpleChart