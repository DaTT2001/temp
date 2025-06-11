import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { fetchRangeData, updateGoogleSheet, updateReport } from '../api'
import { CButton, CSpinner, CAlert } from '@coreui/react'
import { toast } from 'react-toastify'

const toVNTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const hours = date.getUTCHours() + 7
  const minutes = date.getUTCMinutes()
  const h = hours >= 24 ? hours - 24 : hours
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const pickEvenlySpaced = (data, count) => {
  if (!data || data.length === 0) return Array(count).fill(null)
  if (data.length <= count) return [...data, ...Array(count - data.length).fill(null)]
  const result = []
  const used = new Set()
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(i * (data.length - 1) / (count - 1))
    // Nếu index đã dùng, tăng lên cho tới khi chưa dùng (tránh trùng)
    while (used.has(idx) && idx < data.length) idx++
    if (idx >= data.length) idx = data.length - 1
    result.push(data[idx])
    used.add(idx)
  }
  return result
}

const ReportResult = ({ reportId, partInfos }) => {
  const [reportData, setReportData] = useState(null)
  const [t4Points, setT4Points] = useState([])
  const [t5Points, setT5Points] = useState([])
  const [loading, setLoading] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(`http://192.168.10.87:1337/api/reports/${reportId}`)
        if (response.data && response.data.data) {
          setReportData(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching report:', error)
      }
    }
    if (reportId) fetchReportData()
  }, [reportId])

  useEffect(() => {
    const fetchT4T5 = async () => {
      if (!reportData) return
      const t4Date = reportData.t4start ? new Date(reportData.t4start) : null
      const t5Date = reportData.t5start ? new Date(reportData.t5start) : null

      if (t4Date && reportData.t4start && reportData.t4end) {
        const t4All = await fetchRangeData(
          't4',
          t4Date,
          toVNTime(reportData.t4start),
          toVNTime(reportData.t4end)
        )
        const sampledT4 = pickEvenlySpaced(t4All, 5)
        setT4Points(sampledT4)
      }

      if (t5Date && reportData.t5start && reportData.t5end) {
        const t5All = await fetchRangeData(
          't5',
          t5Date,
          toVNTime(reportData.t5start),
          toVNTime(reportData.t5end)
        )
        const sampledT5 = pickEvenlySpaced(t5All, 11)
        setT5Points(sampledT5)
      }
    }

    fetchT4T5()
  }, [reportData])

  useEffect(() => {
    // Đủ 5 điểm T4 và 11 điểm T5, không có null
    const t4ok = t4Points.length === 5 && t4Points.every(p => p && typeof p.sensor1_temperature !== 'undefined')
    const t5ok = t5Points.length === 11 && t5Points.every(p => p && typeof p.sensor1_temperature !== 'undefined')
    setDataReady(t4ok && t5ok)
  }, [t4Points, t5Points])

  const handleUpdateSheet = async () => {
    if (reportData && partInfos && partInfos.length > 0 && t4Points.length && t5Points.length && dataReady) {
      setLoading(true)
      try {
        const payload = {
          maKD: partInfos[0]?.sale || 0,
          tenSP: partInfos[0]?.name || '',
          loaiLo: '',
          maLo: '',
          maDongChay: `流水号Mã dòng chảy:`,
          vatLieu: partInfos[0]?.materialgrade || '',
          t4temp: partInfos[0]?.heatt4 || 0,
          t4time1: partInfos[0]?.t4time1 || 0,
          t4time2: partInfos[0]?.t4time2 || 0,
          t4in: toVNTime(reportData.t4start),
          t4out: toVNTime(reportData.t4end),
          t5temp: partInfos[0]?.heatt5 || 0,
          t5time1: partInfos[0]?.t5time1 || 0,
          t5time2: partInfos[0]?.t5time2 || 0,
          t5in: toVNTime(reportData.t5start),
          t5out: toVNTime(reportData.t5end),
          // Dữ liệu nhiệt độ từ t4 và t5
          t41: t4Points[0]?.sensor1_temperature ?? 0,
          t42: t4Points[1]?.sensor1_temperature ?? 0,
          t43: t4Points[2]?.sensor1_temperature ?? 0,
          t44: t4Points[3]?.sensor1_temperature ?? 0,
          t45: t4Points[4]?.sensor1_temperature ?? 0,
          t51: t5Points[0]?.sensor1_temperature ?? 0,
          t52: t5Points[1]?.sensor1_temperature ?? 0,
          t53: t5Points[2]?.sensor1_temperature ?? 0,
          t54: t5Points[3]?.sensor1_temperature ?? 0,
          t55: t5Points[4]?.sensor1_temperature ?? 0,
          t56: t5Points[5]?.sensor1_temperature ?? 0,
          t57: t5Points[6]?.sensor1_temperature ?? 0,
          t58: t5Points[7]?.sensor1_temperature ?? 0,
          t59: t5Points[8]?.sensor1_temperature ?? 0,
          t60: t5Points[9]?.sensor1_temperature ?? 0,
          t61: t5Points[10]?.sensor1_temperature ?? 0,
          nsx: `Ngày sản xuất 生产日期：${new Date().toLocaleDateString('zh-CN')}`,
        }
        // In ra console để kiểm tra giá trị
        console.log('T4 points:', t4Points)
        console.log('T5 points:', t5Points)
        console.log('Payload:', payload)

        const url = await updateGoogleSheet(payload)
        toast.success('Cập nhật Google Sheet thành công!')
        setSheetUrl(url || '')
        if (url && reportId) {
          await updateReport(reportId, { reportLink: url })
        }
      } catch (err) {
        toast.error('Cập nhật Google Sheet thất bại!')
        setSheetUrl('')
        console.error('Update Google Sheet failed:', err)
      }
      setLoading(false)
    }
  }

  return (
    <div style={{ height: 300, marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {!sheetUrl && (
        <>
          {!dataReady && (
            <div style={{ marginBottom: 16, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CSpinner size="sm" color="primary" />
              <span>Đang lấy dữ liệu nhiệt độ...</span>
            </div>
          )}
          <CButton
            color="primary"
            onClick={handleUpdateSheet}
            disabled={loading || !reportData || !partInfos || partInfos.length === 0 || !dataReady}
          >
            {loading && <CSpinner size="sm" className="me-2" />}
            Create Report
          </CButton>
        </>
      )}
      {sheetUrl && (
        <CAlert color="info" className="mt-4 py-2 px-3 mb-0 text-center" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
            View Report
          </a>
          <CButton color="secondary" size="sm" style={{ width: 140 }} onClick={() => window.location.href = '/'}>
            Reload Page
          </CButton>
        </CAlert>
      )}
    </div>
  )
}

export default ReportResult