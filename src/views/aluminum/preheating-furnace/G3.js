import React from 'react'
import { CCol, CRow } from '@coreui/react'
// Import component dùng chung
import TemperatureChart from '../../../components/TemperatureChart' // Điều chỉnh đường dẫn nếu cần

const G3 = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <TemperatureChart
          tableName="G3"
          chartTitle="TEMPERATURE CHART G3"
        />
      </CCol>
    </CRow>
  )
}

export default G3