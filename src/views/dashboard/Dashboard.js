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
    console.log('latestData', latestData);
    
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

  sensorKeys.forEach(key => {
    const item = latestData[key]
    if (item && Array.isArray(item.sensors)) {
      onlineCount += item.sensors.filter(v => v !== 0).length
      offlineCount += item.sensors.filter(v => v === 0).length
    } else {
      offlineCount += 8 // nếu không có data thì coi như offline hết
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
            {progressExample.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
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
      {/* <WidgetsBrand className="mb-4" withCharts /> */}
      {/* <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Traffic {' & '} Sales</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-body-secondary text-truncate small">Target</div>
                        <div className="fs-5 fw-semibold">9,123</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">
                         NG
                        </div>
                        <div className="fs-5 fw-semibold">10</div>
                      </div>
                    </CCol>
                  </CRow>
                  <hr className="mt-0" />
                </CCol>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Ok </div>
                        <div className="fs-5 fw-semibold">120</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Rate NG</div>
                        <div className="fs-5 fw-semibold">0.11%</div>
                      </div>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow> */}
    </>
  )
}

export default Dashboard
