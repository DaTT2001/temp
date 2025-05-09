import React from 'react'
import { CCol, CRow } from '@coreui/react'
// Import component dùng chung
import TemperatureChart from '../../../components/TemperatureChart' // Điều chỉnh đường dẫn nếu cần

const G2 = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <TemperatureChart
          tableName="G2"
          chartTitle="TEMPERATURE CHART G2"
        />
      </CCol>
    </CRow>
  )
}

export default G2