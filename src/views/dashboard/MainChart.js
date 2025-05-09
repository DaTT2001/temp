import React, { useEffect, useRef } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const sensorKeys = ['t4', 't5', 'g1', 'g2', 'g3']
const sensorLabels = ['Sensor 1', 'Sensor 2', 'Sensor 3', 'Sensor 4', 'Sensor 5', 'Sensor 6', 'Sensor 7', 'Sensor 8']
const sensorColors = [
  getStyle('--cui-info'),
  getStyle('--cui-success'),
  getStyle('--cui-danger'),
  getStyle('--cui-warning'),
  getStyle('--cui-primary'),
]

const MainChart = ({ data }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])
  const sensorLabelMap = {
    t4: 'T4',
    t5: 'T5',
    g1: '1600T',
    g2: '1000T',
    g3: '400T',
  }
  // Tạo datasets cho từng cảm biến, chỉ lấy nếu có ít nhất 1 giá trị khác 0
  const datasets = sensorKeys
  .map((key, idx) => {
    const item = data && data[key]
    if (
      item &&
      Array.isArray(item.sensors) &&
      item.sensors.length === 8 &&
      item.sensors.some(v => v !== 0)
    ) {
      return {
        label: sensorLabelMap[key] || key.toUpperCase(),
        backgroundColor: 'transparent',
        borderColor: sensorColors[idx % sensorColors.length],
        pointHoverBackgroundColor: sensorColors[idx % sensorColors.length],
        borderWidth: 2,
        data: item.sensors,
      }
    }
    return null
  })
  .filter(Boolean)

  return (
    <CChartLine
      ref={chartRef}
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels: sensorLabels,
        datasets: datasets,
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            grid: {
              color: getStyle('--cui-border-color-translucent'),
              drawOnChartArea: false,
            },
            ticks: {
              color: getStyle('--cui-body-color'),
            },
          },
          y: {
            beginAtZero: true,
            border: {
              color: getStyle('--cui-border-color-translucent'),
            },
            grid: {
              color: getStyle('--cui-border-color-translucent'),
            },
            // min: 0,GO.
            // max: 500, // max theo range của bạn
            ticks: {
              color: getStyle('--cui-body-color'),
              maxTicksLimit: 10,
              stepSize: 50,
            },
          },
        },
        elements: {
          line: {
            tension: 0.4,
          },
          point: {
            radius: 3,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3,
          },
        },
      }}
    />
  )
}

export default MainChart