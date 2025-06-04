import React, { useEffect, useState } from 'react'
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CSpinner, CButton, CFormInput, CInputGroup, CInputGroupText,
    CCard, CCardHeader, CCardBody, CAlert, CPagination, CPaginationItem, CFormSelect
} from '@coreui/react'
import axios from 'axios'

const PAGE_SIZE = 10

const ReportsManagement = () => {
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [saleFilter, setSaleFilter] = useState('')
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [total, setTotal] = useState(0)
    const [sortOrder, setSortOrder] = useState('desc') // 'desc' = new → old, 'asc' = old → new

    const fetchReports = async (saleNo = '', pageNum = 1, order = 'desc') => {
        setLoading(true)
        try {
            let url = `http://117.6.40.130:1337/api/reports?pagination[page]=${pageNum}&pagination[pageSize]=${PAGE_SIZE}`
            if (saleNo) {
                url += `&filters[sale][$contains]=${encodeURIComponent(saleNo)}`
            }
            url += `&sort=createdAt:${order}`
            const res = await axios.get(url)
            setReports(res.data.data || [])
            setPageCount(res.data.meta?.pagination?.pageCount || 1)
            setTotal(res.data.meta?.pagination?.total || 0)
        } catch (err) {
            setReports([])
            setPageCount(1)
            setTotal(0)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchReports(saleFilter, page, sortOrder)
    }, [page, saleFilter, sortOrder])

    const handleFilterChange = (e) => {
        setSaleFilter(e.target.value)
        setPage(1) // reset về trang 1 khi filter
    }

    const handleSortChange = (e) => {
        setSortOrder(e.target.value)
        setPage(1)
    }

    return (
        <CCard>
            <CCardHeader>Reports list</CCardHeader>
            <CCardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, justifyContent: 'space-between' }}>
                    <CInputGroup style={{ maxWidth: 320 }}>
                        <CInputGroupText>Sale no</CInputGroupText>
                        <CFormInput
                            placeholder="Press sale no to filter"
                            value={saleFilter}
                            onChange={handleFilterChange}
                        />
                    </CInputGroup>
                    <CFormSelect
                        style={{ maxWidth: 200 }}
                        value={sortOrder}
                        onChange={handleSortChange}
                        aria-label="Sort by time"
                    >
                        <option value="desc">Newest to Oldest</option>
                        <option value="asc">Oldest to Newest</option>
                    </CFormSelect>
                </div>
                {loading ? (
                    <div className="text-center py-5"><CSpinner color="primary" /></div>
                ) : (
                    <>
                        <CTable striped hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Code</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Sale no</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">T4 Start</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">T4 End</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">T5 Start</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">T5 End</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Date create</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">View report</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {reports.map((r, idx) => (
                                    <CTableRow key={r.id}>
                                        <CTableHeaderCell scope="row">{(page - 1) * PAGE_SIZE + idx + 1}</CTableHeaderCell>
                                        <CTableDataCell>{r.reportcode}</CTableDataCell>
                                        <CTableDataCell>{r.sale}</CTableDataCell>
                                        <CTableDataCell>{r.t4start ? new Date(r.t4start).toLocaleString() : ''}</CTableDataCell>
                                        <CTableDataCell>{r.t4end ? new Date(r.t4end).toLocaleString() : ''}</CTableDataCell>
                                        <CTableDataCell>{r.t5start ? new Date(r.t5start).toLocaleString() : ''}</CTableDataCell>
                                        <CTableDataCell>{r.t5end ? new Date(r.t5end).toLocaleString() : ''}</CTableDataCell>
                                        <CTableDataCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</CTableDataCell>
                                        <CTableDataCell>
                                            {r.reportLink ? (
                                                <CButton
                                                    color="info"
                                                    size="sm"
                                                    href={r.reportLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Report
                                                </CButton>
                                            ) : (
                                                <span className="text-muted">None</span>
                                            )}
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <div style={{ fontSize: 13, color: '#888' }}>
                                Total: {total} reports
                            </div>
                            <CPagination align="end" aria-label="pagination">
                                {[...Array(pageCount)].map((_, i) => (
                                    <CPaginationItem
                                        key={i + 1}
                                        active={page === i + 1}
                                        onClick={() => setPage(i + 1)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {i + 1}
                                    </CPaginationItem>
                                ))}
                            </CPagination>
                        </div>
                    </>
                )}
            </CCardBody>
        </CCard>
    )
}

export default ReportsManagement