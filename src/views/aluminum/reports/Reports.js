import React, { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CButton, CRow, CCol, CAlert,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import { startPolling, stopPolling } from 'src/realtimePolling'
import { useSelector } from 'react-redux'
import { STRAPI_URL, CAMERA_BASE_URL } from 'src/config'
import PartCodeForm from '../../../components/PartCodeForm'
import PartInfoList from '../../../components/PartInfoList'
import ReportResult from '../../../components/ReportResult'
import CameraSnapshot from '../../../components/CameraSnapshot'
import LinearProgress from '@mui/material/LinearProgress'
// import { useStep } from 'src/hooks/useStep'
import {
  fetchAllProducts,
  createReport,
  updateReport,
  fetchReportData,
  fetchRangeData1,
  fetchReportDataById,
} from '../../../api'
// MUI Stepper
import { Stepper, Step, StepLabel } from '@mui/material'
import SimpleChart from '../../../components/SimpleChart'
import { useColorModes } from '@coreui/react'
import store from 'src/store'

const stepKeys = ['idle', 'checked', 't4', 'wait-t5', 't5', 'done']

function getProgressPercent(start, end) {
  if (!start || !end) return 0
  const now = Date.now()
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  if (now <= startMs) return 0
  if (now >= endMs) return 100
  return Math.round(((now - startMs) / (endMs - startMs)) * 100)
}

const Reports = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const reportIdParam = params.get('reportId')

  const latestData = useSelector(state => state.latestData)
  const [step, setStep] = useState('idle')
  const [t4Done, setT4Done] = useState(false)
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [partCodes, setPartCodes] = useState(() => {
    const saved = localStorage.getItem('partCodes')
    return saved ? JSON.parse(saved) : ['']
  })

  const [partInfos, setPartInfos] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [reportId, setReportId] = useState(null)
  const [report, setReport] = useState(null)
  const [t4Seconds, setT4Seconds] = useState(0)
  const [t5Seconds, setT5Seconds] = useState(0)
  const [t4StartTime, setT4StartTime] = useState(null)
  const [t4EndTime, setT4EndTime] = useState(null)
  const [t5StartTime, setT5StartTime] = useState(null)
  const [t5EndTime, setT5EndTime] = useState(null)
  const [tick, setTick] = useState(0)
  const [chartData, setChartData] = useState([])
  const [showCamera, setShowCamera] = useState(false)

  // Polling
  React.useEffect(() => {
    const cleanup = startPolling(store)
    return () => {
      if (cleanup) cleanup()
      stopPolling(store)
    }
  }, [])

  // Tự động cập nhật tick mỗi 1 giây để kiểm tra tiến trình
  React.useEffect(() => {
    const interval = setInterval(() => setTick(tick => tick + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    let interval
    if ((step === 't4' || step === 't5') && t4StartTime && t4EndTime) {
      interval = setInterval(async () => {
        // Lấy ngày và giờ bắt đầu, cộng thêm 7 tiếng
        const dateObj = new Date(step === 't4' ? t4StartTime : t5StartTime)
        dateObj.setHours(dateObj.getHours() + 7)
        const now = new Date()
        now.setHours(now.getHours() + 7)
        const startDateTime = dateObj.toISOString()
        const endDateTime = now.toISOString()
        const tableName = step === 't4' ? 't4' : 't5'
        const data = await fetchRangeData1(tableName, startDateTime, endDateTime)
        setChartData(data)
      }, 10000)
    }
    return () => clearInterval(interval)
  }, [step, t4StartTime, t5StartTime, t4EndTime, t5EndTime])

  React.useEffect(() => {
    if (reportIdParam) {
      // Fetch report theo id
      (async () => {
        setLoading(true)
        try {
          const res = await fetchReportDataById(reportIdParam) // Bạn cần viết hàm này
          const reportData = res.data
          setReportId(reportIdParam)
          setReport(reportData)
          if (reportData.sale) {
            try {
              const allProducts = await fetchAllProducts()
              // Nếu sale là chuỗi nhiều mã cách nhau bằng dấu cách
              const codes = reportData.sale.split(' ').filter(Boolean)
              const infos = codes
                .map(code => allProducts.find(p => p.sale === code || p.ERPCode === code || p.documentId === code))
                .filter(Boolean)
              setPartInfos(infos)
              setPartCodes(codes)
            } catch (err) {
              setPartInfos([])
            }
          }
          // Xác định step hiện tại
          if (!reportData.t4end) {
            setStep('t4')
            setT4StartTime(reportData.t4start)
            setT4EndTime(reportData.t4end)
            setProcessing(true)
          } else if (!reportData.t5start) {
            // Nếu t4EndTime < now thì chuyển luôn sang wait-t5
            if (new Date(reportData.t4end).getTime() < Date.now()) {
              setStep('wait-t5')
              setT4StartTime(reportData.t4start)
              setT4EndTime(reportData.t4end)
              setT4Done(true)
              setProcessing(false)
            } else {
              setStep('t4')
              setT4StartTime(reportData.t4start)
              setT4EndTime(reportData.t4end)
              setProcessing(true)
            }
          } else if (!reportData.t5end) {
            // Nếu t5EndTime < now thì chuyển luôn sang done
            if (new Date(reportData.t5end).getTime() < Date.now()) {
              setStep('done')
              setProcessing(false)
              // Đánh dấu isFinished nếu cần
              if (reportData.isFinished !== 'yes') {
                updateReport(reportIdParam, { isFinished: 'yes' }).catch(() => { })
              }
            } else {
              setStep('t5')
              setT5StartTime(reportData.t5start)
              setT5EndTime(reportData.t5end)
              setProcessing(true)
            }
          } else {
            setStep('done')
            setProcessing(false)
            // Đánh dấu isFinished nếu cần
            if (reportData.isFinished !== 'yes') {
              updateReport(reportIdParam, { isFinished: true }).catch(() => { })
            }
          }
        } catch (err) {
          setError('Không tìm thấy báo cáo!')
        }
        setLoading(false)
      })()
    }
    // eslint-disable-next-line
  }, [reportIdParam])

  // Handlers
  const handleAddCode = () => setPartCodes([...partCodes, ''])
  const handleRemoveCode = (idx) => setPartCodes(partCodes.filter((_, i) => i !== idx))
  const handleChangeCode = (idx, value) => {
    const newCodes = [...partCodes]
    newCodes[idx] = value
    setPartCodes(newCodes)
  }

  const handleCheckParts = async (e) => {
    e.preventDefault()
    setError('')
    setPartInfos([])
    setReport(null)
    setLoading(true)
    try {
      const allProducts = await fetchAllProducts()
      const infos = partCodes
        .filter(Boolean)
        .map(code => allProducts.find(p => p.sale === code || p.ERPCode === code || p.documentId === code))
        .filter(Boolean)
      if (infos.length !== partCodes.filter(Boolean).length) {
        setError('Không tìm thấy mã linh kiện hoặc lỗi kết nối!')
        setLoading(false)
        return
      }
      const first = infos[0]
      const allSame = infos.every(info =>
        info.heatt4 == first.heatt4 &&
        info.t4time1 == first.t4time1 &&
        info.t4time2 == first.t4time2 &&
        info.heatt5 == first.heatt5 &&
        info.t5time1 == first.t5time1 &&
        info.t5time2 == first.t5time2
      )
      if (!allSame) {
        setError('All components must have the same temperature and time parameters to be processed in the same batch!')
        setLoading(false)
        return
      }
      setPartInfos(infos)
      setStep('checked')
    } catch (err) {
      console.error('LỖI fetchAllProducts:', err)
      setError('Part code not found or connection error!')
    }
    setLoading(false)
  }

  const handleStart = async () => {
    setError('')
    setProcessing(true)

    // Kiểm tra latestData trước khi bắt đầu T4
    // if (
    //   !latestData ||
    //   !latestData.t4 ||
    //   !Array.isArray(latestData.t4.sensors) ||
    //   latestData.t4.sensors.every(v => v === 0)
    // ) {
    //   setError('Don\'t receive data from hardware (latestData = 0)!')
    //   toast.error('Don\'t receive data from hardware (latestData = 0)!')
    //   setProcessing(false)
    //   return
    // }

    setStep('t4')
    const maxT4 = Math.max(...partInfos.map(i => (Number(i.t4time1) || 0) + (Number(i.t4time2) || 0)))
    setT4Seconds(maxT4 * 60)
    const now = new Date()
    const pad = n => n.toString().padStart(2, '0')
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const codeStr = partCodes.filter(Boolean).join(' ')
    const reportcode = `${dateStr} ${codeStr}`
    const t4start = now.toISOString()
    const t4end = new Date(now.getTime() + maxT4 * 60 * 1000).toISOString()
    setT4StartTime(t4start)
    setT4EndTime(t4end)
    try {
      const id = await createReport({ t4start, t4end, reportcode, sale: codeStr, t4temp: partInfos[0].heatt4, t5temp: partInfos[0].heatt5 })
      setReportId(id)
    } catch {
      setError('Can not create report!')
      setProcessing(false)
    }
  }

  const handleStartT5 = async () => {
    setError('')
    setProcessing(true)
    // if (
    //   !latestData ||
    //   !latestData.t5 ||
    //   !Array.isArray(latestData.t5.sensors) ||
    //   latestData.t5.sensors.every(v => v === 0)
    // ) {
    //   setError('Don\'t receive data from hardware (latestData = 0)!')
    //   toast.error('Don\'t receive data from hardware (latestData = 0)!')
    //   setProcessing(false)
    //   return
    // }
    setStep('t5')
    const maxT5 = Math.max(...partInfos.map(i => (Number(i.t5time1) || 0) + (Number(i.t5time2) || 0)))
    setT5Seconds(maxT5 * 60)
    const now = new Date()
    const t5start = now.toISOString()
    const t5end = new Date(now.getTime() + maxT5 * 60 * 1000).toISOString()
    setT5StartTime(t5start)
    setT5EndTime(t5end)
    if (reportId) {
      try {
        await updateReport(reportId, { t5start, t5end })
      } catch {
        setError('Không thể cập nhật báo cáo!')
        setProcessing(false)
      }
    }
  }

  const fetchReport = async () => {
    setProcessing(false)
    setLoading(true)
    try {
      const res = await fetchReportData({
        from: Date.now(),
        duration: Math.max(...partInfos.map(i => Number(i.t5time2) || 0)),
        codes: partCodes.filter(Boolean).join(','),
      })
      setReport(res)
      setStep('done')
    } catch {
      setError('Lỗi lấy dữ liệu báo cáo!')
    }
    setLoading(false)
  }

  React.useEffect(() => {
    if (step === 't4' && t4StartTime && t4EndTime && getProgressPercent(t4StartTime, t4EndTime) >= 100) {
      setStep('wait-t5')
      setT4Done(true)
      setProcessing(false)
    }
    if (step === 't5' && t5StartTime && t5EndTime && getProgressPercent(t5StartTime, t5EndTime) >= 100) {
      setProcessing(false)
      setStep('done')
      fetchReport()
    }
    // eslint-disable-next-line
  }, [tick, step, t4StartTime, t4EndTime, t5StartTime, t5EndTime])

  return (
    <CRow className="justify-content-center mt-1">
      <CCol md={6}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h4>Component Heat Report</h4>
          </CCardHeader>
          {/* <ReportResult reportId={reportId} partInfos={partInfos}/> */}
          {/* MUI Stepper */}
          <div
            style={{
              background: colorMode === 'dark' ? '#23272f' : '#fff',
              padding: 16,
              borderRadius: 8,
              color: colorMode === 'dark' ? 'white' : '#222',
            }}
          >
            <Stepper
              activeStep={stepKeys.indexOf(step)}
              alternativeLabel
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: 16,
                  color: colorMode === 'dark' ? '#fff !important' : '#222 !important',
                  transition: 'color 0.2s',
                },
                '& .MuiStepLabel-label.Mui-active': {
                  color: colorMode === 'dark' ? '#0d6efd !important' : '#1976d2 !important',
                  fontWeight: 'bold !important',
                },
                '& .MuiStepLabel-label.Mui-completed': {
                  color: colorMode === 'dark' ? '#0d6efd !important' : '#1976d2 !important',
                },
                marginBottom: 2,
              }}
            >
              <Step><StepLabel>Enter name</StepLabel></Step>
              <Step><StepLabel>Check</StepLabel></Step>
              <Step><StepLabel>T4</StepLabel></Step>
              <Step><StepLabel>Wait T5</StepLabel></Step>
              <Step><StepLabel>T5</StepLabel></Step>
              <Step><StepLabel>Report</StepLabel></Step>
            </Stepper>
          </div>
          {/* Countdown info */}
          {(step === 't4' || step === 't5') && processing && (
            <div
              style={{
                background: colorMode === 'dark' ? '#23272f' : '#f0f4f8',
                borderRadius: 8,
                padding: 16,
                margin: 16,
                textAlign: 'center',
                color: colorMode === 'dark' ? 'white' : '#222',
              }}
            >
              <h5 style={{ marginBottom: 12 }}>
                {step === 't4' ? 'Running T4 Process' : 'Running T5 Process'}
              </h5>
              <LinearProgress
                variant="determinate"
                value={
                  step === 't4'
                    ? getProgressPercent(t4StartTime, t4EndTime)
                    : getProgressPercent(t5StartTime, t5EndTime)
                }
                sx={{
                  height: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  background: colorMode === 'dark' ? '#444' : undefined,
                  '& .MuiLinearProgress-bar': {
                    background: colorMode === 'dark' ? '#0d6efd' : undefined,
                  },
                }}
              />
              <div style={{ fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>
                {step === 't4'
                  ? `${getProgressPercent(t4StartTime, t4EndTime)}%`
                  : `${getProgressPercent(t5StartTime, t5EndTime)}%`}
              </div>
              <div style={{ fontSize: 14, color: colorMode === 'dark' ? '#aaa' : '#888' }}>
                Estimated Time: {step === 't4'
                  ? new Date(t4EndTime).toLocaleTimeString()
                  : new Date(t5EndTime).toLocaleTimeString()}
              </div>
            </div>
          )}
          <CCardBody
            style={{
              background: colorMode === 'dark' ? '#23272f' : undefined,
              color: colorMode === 'dark' ? 'white' : undefined,
            }}
          >
            {/* Chỉ hiện form nhập mã ở bước idle và checked */}
            {(step === 'idle' || step === 'checked') && (
              <PartCodeForm
                partCodes={partCodes}
                loading={loading}
                handleAddCode={handleAddCode}
                handleRemoveCode={handleRemoveCode}
                handleChangeCode={handleChangeCode}
                handleCheckParts={handleCheckParts}
              />
            )}

            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

            {/* Hiện danh sách linh kiện và nút bắt đầu T4 ở bước checked */}
            {step === 'checked' && partInfos.length > 0 && (
              <PartInfoList partInfos={partInfos} onStart={handleStart} processing={processing} />
            )}

            {/* Hiện nút xác nhận bắt đầu T5 ở bước wait-t5 */}
            {step === 'wait-t5' && t4Done && (
              <CAlert color="warning" className="mt-3 d-flex justify-content-between align-items-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span>T4 completed. Press confirm to start T5.</span>
                  {/* Nút trạng thái T5 */}
                  <CButton
                    color={
                      latestData &&
                        latestData.t5 &&
                        Array.isArray(latestData.t5.sensors) &&
                        latestData.t5.sensors.some(v => v !== 0)
                        ? 'success'
                        : 'danger'
                    }
                    size="sm"
                    disabled
                    style={{ minWidth: 90, fontWeight: 'bold' }}
                  >
                    {latestData &&
                      latestData.t5 &&
                      Array.isArray(latestData.t5.sensors) &&
                      latestData.t5.sensors.some(v => v !== 0)
                      ? 'T5 ONLINE'
                      : 'T5 OFFLINE'}
                  </CButton>

                </div>
                <CButton color="primary" size="sm" onClick={handleStartT5}>
                  Confirm to start T5
                </CButton>
              </CAlert>
            )}

            {/* Hiện kết quả báo cáo ở bước done */}
            {step === 'done' && reportId && <ReportResult reportId={reportId} partInfos={partInfos} />}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={6}>
        <CCard className="">
          <CCardHeader
            style={{
              background: colorMode === 'dark' ? '#23272f' : undefined,
              color: colorMode === 'dark' ? 'white' : undefined,
            }}
          >
            <h5 className="mb-0">Product under heat treatment</h5>
          </CCardHeader>
          <CCardBody
            style={{
              background: colorMode === 'dark' ? '#23272f' : undefined,
              color: colorMode === 'dark' ? 'white' : undefined,
            }}
          >
            {partInfos && partInfos.length > 0 ? (
              <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 0 }}>
                {partInfos.map((info, idx) => (
                  <li key={idx} style={{
                    marginBottom: 16,
                    padding: 12,
                    border: '1px solid #444',
                    borderRadius: 8,
                    background: colorMode === 'dark' ? '#181b20' : '#fafbfc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    color: colorMode === 'dark' ? 'white' : '#222',
                    justifyContent: 'space-between',
                  }}>

                    {info.image?.formats?.thumbnail?.url ? (
                      <img
                        src={`${STRAPI_URL}${info.image.formats.thumbnail.url}`}
                        alt={info.name}
                        style={{ width: 160, height: 120, objectFit: 'fill', borderRadius: 8, border: '1px solid #ddd' }}
                      />
                    ) : info.image?.url ? (
                      <img
                        src={`${STRAPI_URL}${info.image.url}`}
                        alt={info.name}
                        style={{ width: 160, height: 120, objectFit: 'fill', borderRadius: 8, border: '1px solid #ddd' }}
                      />
                    ) : null}
                    <div>
                      <div><b>Sale No:</b> {info.sale || info.ERPCode || info.documentId}</div>
                      <div><b>Name:</b> {info.name}</div>
                      <div><b>Customer:</b> {info.customer}</div>
                      <div><b>T4:</b> {info.heatt4}℃ | {info.t4time1} + {info.t4time2} m</div>
                      <div><b>T5:</b> {info.heatt5}℃ | {info.t5time1} + {info.t5time2} m</div>
                    </div>
                    {/* Camera view */}
                    <CameraSnapshot url={`${CAMERA_BASE_URL}/api/camera/snapshot`} />
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: colorMode === 'dark' ? '#aaa' : '#888' }}>None products</div>
            )}

            {/* Modal phóng to camera */}
            {showCamera && (
              <div
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.7)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => setShowCamera(false)}
              >
                <img
                  src={`${CAMERA_BASE_URL}/api/camera/snapshot`}
                  alt="Camera Snapshot"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    border: '4px solid #fff',
                    borderRadius: 12,
                    boxShadow: '0 0 24px #000',
                  }}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}

          </CCardBody>
        </CCard>
        <CCard className="mt-1">
          <CCardHeader
            style={{
              background: colorMode === 'dark' ? '#23272f' : undefined,
              color: colorMode === 'dark' ? 'white' : undefined,
            }}
          >
            <b>Temperature Chart (Realtime)</b>
          </CCardHeader>
          <CCardBody
            style={{
              background: colorMode === 'dark' ? '#23272f' : undefined,
              color: colorMode === 'dark' ? 'white' : undefined,
            }}
          >
            <SimpleChart
              data={chartData}
              colorMode={colorMode}
              temp={
                step === 't4'
                  ? (partInfos[0]?.heatt4 || '')
                  : step === 't5'
                    ? (partInfos[0]?.heatt5 || '')
                    : ''
              }
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Reports