import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    CCard,
    CCardHeader,
    CCardBody,
    CSpinner,
    CTable,
    CTableBody,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    useColorModes,
} from '@coreui/react'
import { fetchReportDataById } from '../../../api'
import SimpleChart from '../../../components/SimpleChart'
import { fetchRangeData } from '../../../api'

function useQuery() {
    return new URLSearchParams(useLocation().search)
}

const convertUTCToGMT7 = (utcDateString) => {
    if (!utcDateString) return null;
    const date = new Date(utcDateString);
    date.setHours(date.getHours() + 7); // Thêm 7 giờ để chuyển sang GMT+7
    return date;
};

const ReportDetails = () => {
    const query = useQuery()
    const documentId = query.get('id')
    const [loading, setLoading] = useState(true)
    const [report, setReport] = useState(null)
    const [error, setError] = useState(null)
    const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
    const [chartT4, setChartT4] = useState([])
    const [chartT5, setChartT5] = useState([])
    const [showEmbeddedDoc, setShowEmbeddedDoc] = useState(false) // State để toggle hiển thị nhúng
    const [scale, setScale] = useState(0.8); // Thêm dòng này cùng với các state khác

    useEffect(() => {
        if (!documentId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetchReportDataById(documentId);
                const reportData = res?.data || res;

                if (!reportData || res.status === 404) {
                    setReport(null);
                    setError('Report not found (404)');
                    return;
                }

                setReport(reportData);

                const fetchSensorData = async (key, setChartFn) => {
                    const startUTC = reportData[`${key}start`];
                    const endUTC = reportData[`${key}end`];

                    if (!startUTC || !endUTC) return;

                    try {
                        const start = convertUTCToGMT7(startUTC);
                        const end = convertUTCToGMT7(endUTC);

                        const data = await fetchRangeData(key, start, end);
                        setChartFn(data);
                    } catch (err) {
                        console.error(`Error fetching ${key.toUpperCase()} data:`, err);
                        setChartFn([]);
                    }
                };

                await Promise.all([
                    fetchSensorData('t4', setChartT4),
                    fetchSensorData('t5', setChartT5),
                ]);
            } catch (err) {
                console.error('Error fetching report:', err);
                setReport(null);
                setError('Failed to fetch report');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [documentId]);

    if (!documentId) {
        return (
            <CCard>
                <CCardHeader>Report Details</CCardHeader>
                <CCardBody>
                    <div className="text-danger">No document ID</div>
                </CCardBody>
            </CCard>
        )
    }

    if (error) {
        return (
            <CCard>
                <CCardHeader>Report Details</CCardHeader>
                <CCardBody>
                    <div className="text-danger">{error}</div>
                </CCardBody>
            </CCard>
        )
    }

    // Hàm trích xuất document ID từ Google Sheets URL
    const extractDocIdFromUrl = (url) => {
        try {
            const match = url.match(/\/d\/([^\/]+)/);
            return match ? match[1] : null;
        } catch {
            return null;
        }
    }

    const docId = report?.reportLink ? extractDocIdFromUrl(report.reportLink) : null;

    return (
        <CCard>
            <CCardHeader>Report Details</CCardHeader>
            <CCardBody>
                {loading ? (
                    <div className="text-center py-5">
                        <CSpinner color="primary" />
                    </div>
                ) : !report ? (
                    <div className="text-center py-5 text-danger">Report not found.</div>
                ) : (
                    <>
                        <CTable striped responsive>
                            <CTableBody>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">Report Code</CTableHeaderCell>
                                    <CTableDataCell>{report.reportcode}</CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">Sale No</CTableHeaderCell>
                                    <CTableDataCell>{report.sale}</CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">T4 Start</CTableHeaderCell>
                                    <CTableDataCell>
                                        {report.t4start ? new Date(report.t4start).toLocaleString('vi-VN') : ''}
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">T4 End</CTableHeaderCell>
                                    <CTableDataCell>
                                        {report.t4end ? new Date(report.t4end).toLocaleString('vi-VN') : ''}
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">T5 Start</CTableHeaderCell>
                                    <CTableDataCell>
                                        {report.t5start ? new Date(report.t5start).toLocaleString('vi-VN') : ''}
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">T5 End</CTableHeaderCell>
                                    <CTableDataCell>
                                        {report.t5end ? new Date(report.t5end).toLocaleString('vi-VN') : ''}
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">Created At</CTableHeaderCell>
                                    <CTableDataCell>
                                        {report.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN') : ''}
                                    </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                    <CTableHeaderCell scope="row">Report Link</CTableHeaderCell>
                                    <CTableDataCell>
                                        {report.reportLink ? (
                                            <>
                                                <a
                                                    href={report.reportLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="me-3"
                                                >
                                                    View Report in New Tab
                                                </a>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => setShowEmbeddedDoc(!showEmbeddedDoc)}
                                                >
                                                    {showEmbeddedDoc ? 'Hide Embedded View' : 'Show Embedded View'}
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-muted">None</span>
                                        )}
                                    </CTableDataCell>
                                </CTableRow>
                            </CTableBody>
                        </CTable>

                        {/* Phần nhúng Google Sheets */}
                        {/* Phần nhúng Google Sheets */}
                        {showEmbeddedDoc && docId && (
                            <div className="mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="mb-0">Embedded Report</h5>
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-sm btn-outline-secondary mx-1"
                                            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                                            disabled={scale <= 0.5}
                                        >
                                            <i className="fas fa-search-minus"></i>
                                        </button>
                                        <span className="mx-2">{Math.round(scale * 100)}%</span>
                                        <button
                                            className="btn btn-sm btn-outline-secondary mx-1"
                                            onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
                                            disabled={scale >= 2}
                                        >
                                            <i className="fas fa-search-plus"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary ms-2"
                                            onClick={() => setScale(1)}
                                        >
                                            Reset
                                        </button>
                                        <a
                                            href={`https://docs.google.com/spreadsheets/d/${docId}/export?format=xlsx`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary ms-2"
                                        >
                                            <i className="fas fa-download me-1"></i>
                                            Tải xuống Sheet
                                        </a>
                                    </div>
                                </div>

                                <div
                                    className="position-relative"
                                    style={{
                                        height: '600px',
                                        overflow: 'auto',
                                        backgroundColor: '#f5f5f5',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <div
                                        style={{
                                            transform: `scale(${scale})`,
                                            transformOrigin: '0 0',
                                            width: `${100 / scale}%`,
                                            height: `${100 / scale}%`,
                                            position: 'relative'
                                        }}
                                    >
                                        <iframe
                                            src={`https://docs.google.com/spreadsheets/d/${docId}/preview?rm=minimal&embedded=true`}
                                            style={{
                                                border: 'none',
                                                width: '100%',
                                                height: '100%',
                                                minHeight: '600px'
                                            }}
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Biểu đồ T4 */}
                        <div className="mt-4">
                            <h5>T4 Temperature Chart</h5>
                            <SimpleChart data={chartT4} colorMode={colorMode} sale={report.sale} temp={report.t4temp} />
                        </div>

                        {/* Biểu đồ T5 */}
                        <div className="mt-4">
                            <h5>T5 Temperature Chart</h5>
                            <SimpleChart data={chartT5} colorMode={colorMode} sale={report.sale} temp={report.t5temp} />
                        </div>
                    </>
                )}
            </CCardBody>
        </CCard>
    )
}

export default ReportDetails