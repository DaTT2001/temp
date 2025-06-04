// export default ReportResult
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

const ReportResult = ({ reportId, partInfos }) => {
  const [reportData, setReportData] = useState(null)
  const [t4Data, setT4Data] = useState([])
  const [t5Data, setT5Data] = useState([])
  const [loading, setLoading] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')

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
      // T4
      const t4Date = reportData.t4start ? new Date(reportData.t4start) : null
      if (t4Date && !isNaN(t4Date) && reportData.t4start && reportData.t4end) {
        const t4 = await fetchRangeData(
          't4',
          t4Date,
          toVNTime(reportData.t4start),
          toVNTime(reportData.t4end)
        )
        setT4Data(t4)
      }
      // T5
      const t5Date = reportData.t5start ? new Date(reportData.t5start) : null
      if (t5Date && !isNaN(t5Date) && reportData.t5start && reportData.t5end) {
        const t5 = await fetchRangeData(
          't5',
          t5Date,
          toVNTime(reportData.t5start),
          toVNTime(reportData.t5end)
        )
        setT5Data(t5)
      }
    }
    fetchT4T5()
  }, [reportData])

  const handleUpdateSheet = async () => {
    if (reportData && partInfos && partInfos.length > 0 && t4Data && t5Data) {
      setLoading(true)
      try {
        const url = await updateGoogleSheet({
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
          t41: t4Data[0]?.sensor1_temperature ?? 0,
          t42: t4Data[1]?.sensor1_temperature ?? 0,
          t43: t4Data[2]?.sensor1_temperature ?? 0,
          t44: t4Data[3]?.sensor1_temperature ?? 0,
          t45: t5Data[0]?.sensor1_temperature ?? 0,
          t51: t5Data[1]?.sensor1_temperature ?? 0,
          t52: t5Data[2]?.sensor1_temperature ?? 0,
          t53: t5Data[3]?.sensor1_temperature ?? 0,
          t54: t5Data[4]?.sensor1_temperature ?? 0,
          t55: t5Data[5]?.sensor1_temperature ?? 0,
          t56: t5Data[6]?.sensor1_temperature ?? 0,
          t57: t5Data[7]?.sensor1_temperature ?? 0,
          t58: t5Data[8]?.sensor1_temperature ?? 0,
          t59: t5Data[9]?.sensor1_temperature ?? 0,
          t60: t5Data[10]?.sensor1_temperature ?? 0,
          t61: t5Data[11]?.sensor1_temperature ?? 0,
          nsx: `Ngày sản xuất 生产日期：${new Date().toLocaleDateString('zh-CN')}`,
        })
        toast.success('Cập nhật Google Sheet thành công!')
        setSheetUrl(url || '')
        // Cập nhật report với link Google Sheet mới
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
        <CButton
          color="primary"
          onClick={handleUpdateSheet}
          disabled={loading || !reportData || !partInfos || partInfos.length === 0}
        >
          {loading && <CSpinner size="sm" className="me-2" />}
          Create Report
        </CButton>
      )}
      {sheetUrl && (
        <CAlert color="info" className="mt-4 py-2 px-3 mb-0 text-center" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}
          >
            View Report
          </a>
          <CButton
            color="secondary"
            size="sm"
            style={{ width: 140 }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </CButton>
        </CAlert>
      )}
    </div>
  )
}

export default ReportResult