// export default CameraSnapshot

import React, { useState, useEffect } from 'react'

const CameraSnapshot = ({
    url = 'http://localhost:3001/api/camera/snapshot',
    width = 180,
    height = 120,
    refreshInterval = 5000,
    style = {},
    imgStyle = {},
    alt = 'Camera Snapshot',
}) => {
    const [showModal, setShowModal] = useState(false)
    const [snapshotTick, setSnapshotTick] = useState(Date.now())
    const [modalTick, setModalTick] = useState(Date.now())

    // Refresh ảnh nhỏ
    useEffect(() => {
        const interval = setInterval(() => setSnapshotTick(Date.now()), refreshInterval)
        return () => clearInterval(interval)
    }, [refreshInterval])

    // Refresh ảnh phóng to khi modal mở
    useEffect(() => {
        if (!showModal) return
        const interval = setInterval(() => setModalTick(Date.now()), refreshInterval)
        return () => clearInterval(interval)
    }, [showModal, refreshInterval])

    return (
        <>
            <div
                style={{ marginLeft: 16, cursor: 'pointer', ...style }}
                onClick={() => {
                    setShowModal(true)
                    setModalTick(Date.now())
                }}
            >
                <img
                    src={`${url}?ts=${snapshotTick}`}
                    alt={alt}
                    width={width}
                    height={height}
                    style={{ border: '1px solid #ccc', borderRadius: 8, objectFit: 'cover', ...imgStyle }}
                />
            </div>
            {showModal && (
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
                    onClick={() => setShowModal(false)}
                >
                    <img
                        src={`${url}?ts=${modalTick}`}
                        alt={alt}
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
        </>
    )
}

export default CameraSnapshot