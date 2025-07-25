import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { CCol, CRow } from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { SensorWidget } from './SensorWidget'

const MAX_DELAY = 5 * 60 * 1000 // 5 phút

const WidgetsDropdown = ({ className, data }) => {
  const sensors = [
    { key: 't4', sensorName: 'T4', partCode: 'Mã linh kiện', offLabel: 'T4' },
    { key: 't5', sensorName: 'T5', partCode: 'Mã linh kiện', offLabel: 'T5' },
    { key: 'g1', sensorName: 'AP3', partCode: 'Mã linh kiện', offLabel: 'AP3' },
    { key: 'g2', sensorName: 'AP2', partCode: 'Mã linh kiện', offLabel: 'AP2' },
    { key: 'g3', sensorName: 'AP1', partCode: 'Mã linh kiện', offLabel: 'AP1' },
  ]
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const [secondsLeft, setSecondsLeft] = React.useState(getCountdownTime(120))

  function getTempColor(temp) {
    if (temp < 100) return 'success'
    if (temp < 300) return 'warning'
    if (temp < 500) return 'danger'
    if (temp < 700) return 'dark'
    return '#b71c1c'
  }
  function getCountdownTime(a) {
    return a * 60
  }
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }
      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  // Hàm kiểm tra lỗi kết nối
  function isConnectionError(sensorData) {
    if (!sensorData || !sensorData.timestamp) return true
    const ts = new Date(sensorData.timestamp.replace(' ', 'T')).getTime()
    const now = Date.now()
    return isNaN(ts) || ts > now || now - ts > MAX_DELAY
  }

  // Phân loại sensor
  const errorSensors = sensors.filter(sensor => {
    const d = data && data[sensor.key]
    return isConnectionError(d)
  })

  const onlineSensors = sensors.filter(sensor => {
    const d = data && data[sensor.key]
    return d && !isConnectionError(d) && Array.isArray(d.sensors) && d.sensors.some(v => v !== 0)
  })

  const offlineSensors = sensors.filter(sensor => {
    const d = data && data[sensor.key]
    return d && !isConnectionError(d) && Array.isArray(d.sensors) && d.sensors.every(v => v === 0)
  })

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      {/* Online */}
      <CRow>
        <CCol sm={5}>
          <h4 className="card-title mb-0 mt-2">Online</h4>
          <div className="small text-body-secondary">
            {data && data.t4 && data.t4.timestamp
              ? `${new Date(data.t4.timestamp).toLocaleString()}`
              : 'No realtime data'}
          </div>
        </CCol>
      </CRow>
      {onlineSensors.map((sensor) => (
        <SensorWidget
          key={sensor.key}
          sensorKey={sensor.key}
          sensorName={sensor.sensorName}
          partCode={""}
          offLabel={sensor.offLabel}
          data={data}
          getTempColor={getTempColor}
        />
      ))}

      {/* Offline */}
      <CRow>
        <CCol sm={5}>
          <h4 className="card-title mb-0 mt-2">Offline</h4>
          <div className="small text-body-secondary">
            {data && data.g1 && data.g1.timestamp
              ? `${new Date(data.g1.timestamp).toLocaleString()}`
              : 'No realtime data'}
          </div>
        </CCol>
      </CRow>
      {offlineSensors.map((sensor) => (
        <SensorWidget
          key={sensor.key}
          sensorKey={sensor.key}
          sensorName={sensor.sensorName}
          partCode={sensor.partCode}
          offLabel={sensor.offLabel}
          data={data}
          getTempColor={getTempColor}
        />
      ))}

      {/* Lỗi kết nối */}
      {errorSensors.length > 0 && (
        <>
          <CRow>
            <CCol sm={5}>
              <h4 className="card-title mb-0 mt-2">Error connection</h4>
            </CCol>
          </CRow>
          {errorSensors.map((sensor) => (
            <SensorWidget
              key={sensor.key}
              sensorKey={sensor.key}
              sensorName={sensor.sensorName}
              partCode={sensor.partCode}
              offLabel={sensor.offLabel}
              data={data}
              getTempColor={getTempColor}
              error
            />
          ))}
        </>
      )}
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown