import React from 'react'
import { CProgress } from '@coreui/react'

const CountdownOverlay = ({ step, processing, countdown, partInfos }) => {
  if (!(step === 't4' || step === 't5') || !processing) return null

  const maxT4 = Math.max(...partInfos.map(i => (Number(i.t4time1) || 0) + (Number(i.t4time2) || 0))) * 60
  const maxT5 = Math.max(...partInfos.map(i => (Number(i.t5time1) || 0) + (Number(i.t5time2) || 0))) * 60
  const percent = step === 't4'
    ? maxT4 > 0 ? Math.min(100, Math.max(0, Math.round(((maxT4 - countdown) / maxT4) * 100))) : 0
    : maxT5 > 0 ? Math.min(100, Math.max(0, Math.round(((maxT5 - countdown) / maxT5) * 100))) : 0

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}
    >
      <h2 style={{ marginBottom: 24 }}>
        {step === 't4' ? 'Đang chạy chu trình T4' : 'Đang chạy chu trình T5'}
      </h2>
      <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 24 }}>
        {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
      </div>
      <div style={{ width: 400, maxWidth: '90vw', marginBottom: 16 }}>
        <CProgress
          value={percent}
          color={step === 't4' ? 'info' : 'success'}
          animated
          style={{ height: 24 }}
        />
      </div>
      <div style={{ fontSize: 20, marginBottom: 24 }}>
        {step === 't4'
          ? `Đang xử lý T4...`
          : `Đang xử lý T5...`}
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: 16,
        maxWidth: 500,
        width: '90%',
        margin: '0 auto'
      }}>
        <h5 style={{ color: '#fff', marginBottom: 12 }}>Sản phẩm đang chạy:</h5>
        <ul style={{ paddingLeft: 20 }}>
          {partInfos.map((info, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              <b>{info.name}</b> ({info.sale} / {info.ERPCode})<br />
              Khách hàng: {info.customer} | Vật liệu: {info.materialgrade}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CountdownOverlay