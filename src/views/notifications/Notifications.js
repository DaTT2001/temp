import React, { useEffect, useState } from 'react'
import {
    CCard, CCardHeader, CCardBody, CListGroup, CListGroupItem,
    CSpinner, CAlert, CPagination, CPaginationItem, CRow, CCol
} from '@coreui/react'
import { STRAPI_BASE_URL } from 'src/config'

const PAGE_SIZE = 10

const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        setLoading(true)
        fetch(`${STRAPI_BASE_URL}/notifications?pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}&sort[0]=time:desc`)
            .then((res) => res.json())
            .then((data) => {
                setNotifications(Array.isArray(data.data) ? data.data : [])
                setPageCount(data?.meta?.pagination?.pageCount || 1)
                setTotal(data?.meta?.pagination?.total || 0)
                setLoading(false)
            })
            .catch(() => {
                setError('Không thể tải thông báo')
                setLoading(false)
            })
    }, [page])

    return (
        <CCard>
            <CCardHeader>Thông báo</CCardHeader>
            <CCardBody>
                {loading && <CSpinner color="primary" />}
                {error && <CAlert color="danger">{error}</CAlert>}
                {!loading && !error && (
                    notifications.length > 0 ? (
                        <>
                            <CListGroup>
                                {notifications.map((item, idx) => {
                                    const attr = item.attributes || item // phòng trường hợp chưa dùng attributes
                                    let displayName = attr.name
                                    if (displayName === 'g1') displayName = 'AP3'
                                    else if (displayName === 'g2') displayName = 'AP2'
                                    else if (displayName === 'g3') displayName = 'AP1'

                                    return (
                                        <CListGroupItem key={item.id || idx}>
                                            <CRow>
                                                <CCol xs={8}>
                                                    <strong>{displayName || attr.title || 'No title'}</strong>
                                                    <div style={{ fontSize: 13, color: '#888' }}>{attr.content || attr.message}</div>
                                                </CCol>
                                                <CCol xs={4} className="text-end" style={{ fontSize: 12, color: '#aaa' }}>
                                                    {attr.time ? new Date(attr.time).toLocaleString() : ''}
                                                </CCol>
                                            </CRow>
                                        </CListGroupItem>
                                    )
                                })}
                            </CListGroup>
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div style={{ fontSize: 13, color: '#888' }}>
                                    Tổng cộng: {total} thông báo
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
                    ) : (
                        <CAlert color="info">Không có thông báo nào.</CAlert>
                    )
                )}
            </CCardBody>
        </CCard>
    )
}

export default Notifications