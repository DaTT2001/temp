import React from 'react'
import { CCol, CRow } from '@coreui/react'
// Import component dùng chung
import TemperatureChart from '../../../components/TemperatureChart' // Điều chỉnh đường dẫn nếu cần

const G1 = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <TemperatureChart
          tableName="G1"
          chartTitle="TEMPERATURE CHART G1"
        />
      </CCol>
    </CRow>
  )
}

export default G1