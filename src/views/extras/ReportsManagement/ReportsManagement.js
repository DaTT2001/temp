import React, { useEffect, useState } from 'react'
import {
    CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
    CSpinner, CButton, CFormInput, CInputGroup, CInputGroupText,
    CCard, CCardHeader, CCardBody, CPagination, CPaginationItem, CFormSelect,
    CModal, CModalHeader, CModalBody, CModalFooter
} from '@coreui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
const PAGE_SIZE = 10

const ReportsManagement = () => {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [saleFilter, setSaleFilter] = useState('')
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [total, setTotal] = useState(0)
    const [sortOrder, setSortOrder] = useState('desc')
    const [statusFilter, setStatusFilter] = useState('all')

    // Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const handleDelete = async () => {
        try {
            await axios.delete(`http://117.6.40.130:1337/api/reports/${deleteId}`)
            toast.success('Delete successful!')
            setShowDeleteModal(false)
            setDeleteId(null)
            setPage(1)
            fetchReports(saleFilter, 1, sortOrder, statusFilter)
        } catch (err) {
            toast.error('Delete failed: ' + (err.response?.data?.error?.message || err.message))
            setShowDeleteModal(false)
            setDeleteId(null)
            setLoading(false)
        }
    }

    const fetchReports = async (saleNo = '', pageNum = 1, order = 'desc', status = 'all') => {
        setLoading(true)
        try {
            let url = `http://117.6.40.130:1337/api/reports?pagination[page]=${pageNum}&pagination[pageSize]=${PAGE_SIZE}`
            if (saleNo) {
                url += `&filters[sale][$contains]=${encodeURIComponent(saleNo)}`
            }
            if (status === 'running') {
                url += `&filters[isFinished][$eq]=false`
            }
            if (status === 'done') {
                url += `&filters[reportLink][$ne]=null&filters[reportLink][$ne]=`
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
        fetchReports(saleFilter, page, sortOrder, statusFilter)
    }, [page, saleFilter, sortOrder, statusFilter])

    const handleFilterChange = (e) => {
        setSaleFilter(e.target.value)
        setPage(1)
    }

    const handleSortChange = (e) => {
        setSortOrder(e.target.value)
        setPage(1)
    }

    const handleStatusChange = (status) => {
        setStatusFilter(status)
        setPage(1)
    }

    return (
        <CCard>
            <CCardHeader>
                Reports list
                <span style={{
                    fontWeight: 400,
                    fontSize: 16,
                    marginLeft: 16,
                    color: '#888'
                }}>
                    {loading ? '' : `(Total: ${total})`}
                </span>
            </CCardHeader>
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
                    <div style={{ display: 'flex', gap: 8 }}>
                        <CButton
                            color={statusFilter === 'all' ? 'primary' : 'secondary'}
                            size="sm"
                            variant={statusFilter === 'all' ? '' : 'outline'}
                            onClick={() => handleStatusChange('all')}
                        >
                            All
                        </CButton>
                        <CButton
                            color={statusFilter === 'running' ? 'primary' : 'secondary'}
                            size="sm"
                            variant={statusFilter === 'running' ? '' : 'outline'}
                            onClick={() => handleStatusChange('running')}
                        >
                            Running
                        </CButton>
                        <CButton
                            color={statusFilter === 'done' ? 'primary' : 'secondary'}
                            size="sm"
                            variant={statusFilter === 'done' ? '' : 'outline'}
                            onClick={() => handleStatusChange('done')}
                        >
                            Done
                        </CButton>
                    </div>
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
                ) : reports.length === 0 ? (
                    <div className="text-center py-5 text-muted" style={{ fontSize: 20 }}>There are no reports to display.</div>
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
                                    <CTableHeaderCell scope="col">View Process</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Delete</CTableHeaderCell>
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
                                        <CTableDataCell>
                                            {r.isFinished === 'no' || r.isFinished === false ? (
                                                <CButton
                                                    color="warning"
                                                    size="sm"
                                                    onClick={() => navigate(`/aluminum/heat-furnace/heat-furnace-report?reportId=${r.documentId}`)}
                                                >
                                                    View Process
                                                </CButton>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CButton
                                                color="danger"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowDeleteModal(true)
                                                    setDeleteId(r.documentId)
                                                }}
                                            >
                                                Delete
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
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
                    </>
                )}

                {/* Modal xác nhận xóa */}
                <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                    <CModalHeader onClose={() => setShowDeleteModal(false)}>
                        Confirm Delete
                    </CModalHeader>
                    <CModalBody>
                        Are you sure you want to delete this report?
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </CButton>
                        <CButton color="danger" onClick={handleDelete}>
                            Delete
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCardBody>
        </CCard>
    )
}

export default ReportsManagement