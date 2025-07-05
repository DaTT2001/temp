import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { fetchRangeDataResult, updateGoogleSheet, updateReport } from '../api'
import { STRAPI_BASE_URL, CAMERA_BASE_URL } from '../config'
import { CButton, CSpinner, CAlert } from '@coreui/react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const toVNTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const hours = date.getUTCHours() + 7
  const minutes = date.getUTCMinutes()
  const h = hours >= 24 ? hours - 24 : hours
  return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Hàm tính trung bình sensor3 đến sensor8
const calculateAverageTemperature = (point) => {
  const sensors = [
    point?.sensor3_temperature,
    point?.sensor4_temperature,
    point?.sensor5_temperature,
    point?.sensor6_temperature,
    point?.sensor7_temperature,
    point?.sensor8_temperature,
  ];
  const validValues = sensors.filter((value) => typeof value === 'number' && !isNaN(value));
  if (validValues.length === 0) return 0;
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return Number((sum / validValues.length).toFixed(1)); // Làm tròn 1 chữ số thập phân
};

const ReportResult = ({ reportId, partInfos }) => {
  const navigate = useNavigate()
  const [reportData, setReportData] = useState(null)
  const [t4Points, setT4Points] = useState([])
  const [t5Points, setT5Points] = useState([])
  const [loading, setLoading] = useState(false)
  const [sheetUrl, setSheetUrl] = useState('')
  const [dataReady, setDataReady] = useState(false)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(`${STRAPI_BASE_URL}/reports/${reportId}`)
        if (response.data && response.data.data) {
          setReportData(response.data.data)
          setSheetUrl(response.data.data.reportLink || '')
        }
      } catch (error) {
        console.error('Error fetching report:', error)
      }
    }
    if (reportId) fetchReportData()
  }, [reportId])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        if (reportData?.t4start && reportData?.t4end) {
          // console.log("Fetching T4 data với params:", {
          //   start: reportData.t4start,
          //   end: reportData.t4end
          // });

          const t4Data = await fetchRangeDataResult(
            't4',
            reportData.t4start,
            reportData.t4end
          );

          // console.log("T4 data nhận được:", t4Data);
          setT4Points(t4Data.data || []);
        }

        if (reportData?.t5start && reportData?.t5end) {
          // console.log("Fetching T5 data với params:", {
          //   start: reportData.t5start,
          //   end: reportData.t5end
          // });

          const t5Data = await fetchRangeDataResult(
            't5',
            reportData.t5start,
            reportData.t5end
          );

          // console.log("T5 data nhận được:", t5Data);
          setT5Points(t5Data.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi fetch data:", error);
        toast.error("Lỗi khi tải dữ liệu: " + error.message);
      } finally {
        // console.log("Kết thúc fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [reportData]);

  useEffect(() => {
    const t4ok =
      t4Points.length > 0 &&
      t4Points.every((p) => p && typeof p.sensor1_temperature !== 'undefined' && p.timestamp);
    const t5ok =
      t5Points.length > 0 &&
      t5Points.every((p) => p && typeof p.sensor1_temperature !== 'undefined' && p.timestamp);
    setDataReady(t4ok && t5ok);
  }, [t4Points, t5Points]);


  // Hàm gọi API /update-sheet
  const updateGoogleSheet = async (payload) => {

    try {
      const response = await fetch(`${CAMERA_BASE_URL}/update-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lỗi từ API: ${text}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.sheetUrl;
      } else {
        throw new Error(data.message || 'Lỗi không xác định từ API');
      }
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
      throw err;
    }
  };

  const handleUpdateSheet = async () => {
    const t4Valid =
      t4Points.length > 0 &&
      t4Points.every(
        (p) =>
          p &&
          typeof p.sensor1_temperature !== 'undefined' &&
          p.timestamp
      );

    const t5Valid =
      t5Points.length > 0 &&
      t5Points.every(
        (p) =>
          p &&
          typeof p.sensor1_temperature !== 'undefined' &&
          p.timestamp
      );

    if (reportData && partInfos && partInfos.length > 0 && t4Valid && t5Valid && dataReady) {
      setLoading(true);
      try {
        const payload = {
          maKD: partInfos[0]?.sale || 'Unknown',
          tenSP: partInfos[0]?.name || '',
          maLo: reportData?.maLo || `LO${Date.now()}`,
          maDongChay: `流水号Mã dòng chảy: ${partInfos[0]?.flowCode || 'DC123'}`,
          vatLieu: partInfos[0]?.materialgrade || '',
          t4temp: partInfos[0]?.heatt4 || 0,
          t4time1: partInfos[0]?.t4time1 || 0,
          t4time2: partInfos[0]?.t4time2 || 0,
          t4in: toVNTime(reportData.t4start) || '',
          t4out: toVNTime(reportData.t4end) || '',
          t5temp: partInfos[0]?.heatt5 || 0,
          t5time1: partInfos[0]?.t5time1 || 0,
          t5time2: partInfos[0]?.t5time2 || 0,
          t5in: toVNTime(reportData.t5start) || '',
          t5out: toVNTime(reportData.t5end) || '',
          nsx: `Ngày sản xuất 生产日期：${reportData.t4start.slice(0, 10)}`,
          t4data: t4Points.map((point) => ({
            temperature: calculateAverageTemperature(point),
            time: toVNTime(point?.timestamp) || '08:00',
          })),
          t5data: t5Points.map((point) => ({
            temperature: calculateAverageTemperature(point),
            time: toVNTime(point?.timestamp) || '09:00',
          })),
        };

        const url = await updateGoogleSheet(payload);
        toast.success('Cập nhật Google Sheet thành công!');
        setSheetUrl(url || '');
        if (url && reportId) {
          await updateReport(reportId, { reportLink: url, isFinished: true });
        }
      } catch (err) {
        toast.error('Cập nhật Google Sheet thất bại!');
        setSheetUrl('');
        console.error('Update Google Sheet failed:', err);
      }
      setLoading(false);
    } else {
      toast.error('Dữ liệu không đầy đủ để cập nhật Google Sheet!');
      setLoading(false);
    }
  };

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
            disabled={loading}
          >
            {loading && <CSpinner size="sm" className="me-2" />}
            Create Report
          </CButton>
        </>
      )}
      {sheetUrl && (
        <CAlert color="info" className="mt-4 py-2 px-3 mb-0 text-center" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              marginBottom: 8,
              cursor: 'pointer',
              color: '#0d6efd',
            }}
            onClick={() => navigate(`/extras/report-details?id=${reportData.documentId}`)}
          >
            View Report
          </span>
          <CButton color="secondary" size="sm" style={{ width: 140 }} onClick={() => window.location.href = '/'}>
            Reload Page
          </CButton>
        </CAlert>
      )}
    </div>
  )
}

export default ReportResult