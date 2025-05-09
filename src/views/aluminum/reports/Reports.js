import React, { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CForm, CFormInput, CButton, CRow, CCol, CListGroup, CListGroupItem, CSpinner, CAlert,
} from '@coreui/react'
import axios from 'axios'

const Reports = () => {
  const [partCodes, setPartCodes] = useState([''])
  const [partInfos, setPartInfos] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [report, setReport] = useState(null)
  const [processing, setProcessing] = useState(false)

  // Giả sử API lấy thông tin linh kiện là /api/parts/:code
  const fetchPartInfo = async (code) => {
    // Thay bằng API thực tế của bạn
    const res = await axios.get(`/api/parts/${code}`)
    return res.data
  }

  // Thêm mã linh kiện mới
  const handleAddCode = () => setPartCodes([...partCodes, ''])

  // Xóa mã linh kiện
  const handleRemoveCode = (idx) => setPartCodes(partCodes.filter((_, i) => i !== idx))

  // Nhập mã linh kiện
  const handleChangeCode = (idx, value) => {
    const newCodes = [...partCodes]
    newCodes[idx] = value
    setPartCodes(newCodes)
  }

  // Kiểm tra và lấy thông tin các mã linh kiện
  const handleCheckParts = async (e) => {
    e.preventDefault()
    setError('')
    setPartInfos([])
    setReport(null)
    setLoading(true)
    try {
      // Lấy thông tin từng mã
      const infos = await Promise.all(partCodes.filter(Boolean).map(fetchPartInfo))
      // Kiểm tra thông số nhiệt độ và thời gian có trùng nhau không
      const seen = new Set()
      for (let info of infos) {
        const key = `${info.temperature}-${info.duration}`
        if (seen.has(key)) {
          setError('Có mã linh kiện có cùng thông số nhiệt độ và thời gian, không thể chọn cùng lúc!')
          setLoading(false)
          return
        }
        seen.add(key)
      }
      setPartInfos(infos)
    } catch (err) {
      setError('Không tìm thấy mã linh kiện hoặc lỗi kết nối!')
    }
    setLoading(false)
  }

  // Bắt đầu quy trình
  const handleStart = async () => {
    setError('')
    setProcessing(true)
    // Kiểm tra kết nối dữ liệu (giả sử API /api/check-connection)
    try {
      const res = await axios.get('/api/check-connection')
      if (!res.data.connected) {
        setError('Không nhận được dữ liệu từ phần cứng!')
        setProcessing(false)
        return
      }
    } catch {
      setError('Lỗi kiểm tra kết nối phần cứng!')
      setProcessing(false)
      return
    }
    // Đếm ngược thời gian (lấy thời gian lớn nhất trong các mã)
    const maxDuration = Math.max(...partInfos.map(i => i.duration))
    setCountdown(maxDuration)
    let t = maxDuration
    const timer = setInterval(() => {
      t -= 1
      setCountdown(t)
      if (t <= 0) {
        clearInterval(timer)
        fetchReport()
      }
    }, 1000)
  }

  // Lấy dữ liệu và xuất báo cáo
  const fetchReport = async () => {
    setProcessing(false)
    setLoading(true)
    try {
      // Giả sử API lấy báo cáo là /api/report?from=...&duration=...
      const res = await axios.get('/api/report', {
        params: {
          from: Date.now(), // hoặc thời điểm nhấn bắt đầu
          duration: Math.max(...partInfos.map(i => i.duration)),
          codes: partCodes.filter(Boolean).join(','),
        },
      })
      setReport(res.data)
    } catch {
      setError('Lỗi lấy dữ liệu báo cáo!')
    }
    setLoading(false)
  }

  return (
    <CRow className="justify-content-center mt-4">
      <CCol md={8}>
        <CCard>
          <CCardHeader>
            <h4>Báo cáo linh kiện vào lò</h4>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleCheckParts}>
              {partCodes.map((code, idx) => (
                <div key={idx} className="d-flex mb-2">
                  <CFormInput
                    placeholder={`Mã linh kiện ${idx + 1}`}
                    value={code}
                    onChange={e => handleChangeCode(idx, e.target.value)}
                    required
                  />
                  {partCodes.length > 1 && (
                    <CButton color="danger" className="ms-2" onClick={() => handleRemoveCode(idx)}>-</CButton>
                  )}
                </div>
              ))}
              <CButton color="secondary" className="mb-2" onClick={handleAddCode}>Thêm mã</CButton>
              <br />
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Kiểm tra & Lấy thông tin'}
              </CButton>
            </CForm>
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}
            {partInfos.length > 0 && (
              <div className="mt-4">
                <h5>Thông số các mã đã chọn:</h5>
                <CListGroup>
                  {partInfos.map((info, idx) => (
                    <CListGroupItem key={idx}>
                      <strong>{info.code}</strong> - Nhiệt độ: {info.temperature}°C, Thời gian: {info.duration} giây
                    </CListGroupItem>
                  ))}
                </CListGroup>
                <CButton color="success" className="mt-3" onClick={handleStart} disabled={processing}>
                  Bắt đầu
                </CButton>
              </div>
            )}
            {processing && (
              <CAlert color="info" className="mt-3">
                Đang kiểm tra kết nối và đếm ngược: {countdown} giây
              </CAlert>
            )}
            {report && (
              <div className="mt-4">
                <h5>Kết quả báo cáo:</h5>
                <pre>{JSON.stringify(report, null, 2)}</pre>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Reports