import React from 'react'
import { CCol, CRow } from '@coreui/react'
// Import component dùng chung
import TemperatureChart from '../../../components/TemperatureChart' // Điều chỉnh đường dẫn nếu cần

const T4 = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <TemperatureChart
          tableName="T4"
          chartTitle="TEMPERATURE CHART T4"
        />
      </CCol>
    </CRow>
  )
}

export default T4