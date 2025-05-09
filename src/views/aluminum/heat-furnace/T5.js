import React from 'react'
import { CCol, CRow } from '@coreui/react'
// Import component dùng chung
import TemperatureChart from '../../../components/TemperatureChart' // Điều chỉnh đường dẫn nếu cần

const T5 = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <TemperatureChart
          tableName="T5"
          chartTitle="TEMPERATURE CHART T5"
        />
      </CCol>
    </CRow>
  )
}

export default T5