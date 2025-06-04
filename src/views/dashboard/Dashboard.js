import React from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import { useSelector } from 'react-redux'
import { startPolling, stopPolling } from 'src/realtimePolling'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

const Dashboard = () => {
  const latestData = useSelector(state => state.latestData)
  React.useEffect(() => {
    const cleanup = startPolling()
    return () => {
      if (cleanup) cleanup()
      stopPolling()
    }

  }, [latestData])

  const sensorKeys = ['t4', 't5', 'g1', 'g2', 'g3']
  const totalSensors = sensorKeys.length * 8 // mỗi cảm biến có 8 sensor

  let onlineCount = 0
  let offlineCount = 0
  let errorCount = 0

  const now = Date.now()
  const MAX_DELAY = 5 * 60 * 1000 // 0.5 giây để test

  sensorKeys.forEach(key => {
    const item = latestData[key]
    if (item && Array.isArray(item.sensors) && item.timestamp) {
      // Ép về UTC để so sánh chuẩn
      const ts = new Date(item.timestamp.replace(' ', 'T')).getTime()
      console.log('now:', now, 'ts:', ts, 'diff:', now - ts)
      if (isNaN(ts) || ts > now || now - ts > MAX_DELAY) {
        errorCount += 8
      } else {
        onlineCount += item.sensors.filter(v => v !== 0).length
        offlineCount += item.sensors.filter(v => v === 0).length
      }
    } else {
      errorCount += 8
    }
  })

  const progressExample = [
    {
      title: 'Online',
      value: `${onlineCount} Sensors`,
      percent: Math.round((onlineCount / totalSensors) * 100),
      color: 'success',
    },
    {
      title: 'Offline',
      value: `${offlineCount} Sensors`,
      percent: Math.round((offlineCount / totalSensors) * 100),
      color: 'warning',
    },
    {
      title: 'Error Connection',
      value: `${errorCount} Sensors`,
      percent: Math.round((errorCount / totalSensors) * 100),
      color: 'danger',
    },
  ]

  return (
    <>
      <WidgetsDropdown className="mb-4" data={latestData} />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Charts
              </h4>
              <div className="small text-body-secondary">
                {latestData && latestData.t4 && latestData.t4.timestamp
                  ? `${new Date(latestData.t4.timestamp).toLocaleString()}`
                  : 'No realtime data'}
              </div>
            </CCol>
          </CRow>
          <MainChart data={latestData} />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {progressExample.map((item, index) => (
              <CCol key={index}>
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )
}

export default Dashboard
