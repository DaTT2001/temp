import React from 'react'
import { CListGroup, CListGroupItem, CButton } from '@coreui/react'
import { useDispatch } from 'react-redux'

const PartInfoList = ({ partInfos, onStart, processing }) => {
  const dispatch = useDispatch()

  const handleStart = () => {
    dispatch({ type: 'set', sidebarShow: true })
    onStart()
  }

  return (
    <div className="mt-4">
      <h5>Selected part information:</h5>
      <CListGroup>
        {partInfos.map((info, idx) => (
          <CListGroupItem key={idx}>
            <strong>{info.name}</strong> ({info.sale} / {info.ERPCode})<br />
            Customer: {info.customer} | Material: {info.materialgrade} | Hardness: {info.hardness}<br />
            PCS Max: {info.pcsmax} | Weight: {info.weight}kg<br />
            T4: {info.heatt4}℃, {info.t4time1}+{info.t4time2} m | T5: {info.heatt5}℃, {info.t5time1}+{info.t5time2} m
          </CListGroupItem>
        ))}
      </CListGroup>
      <CButton color="success" className="mt-3" onClick={handleStart} disabled={processing}>
        Start
      </CButton>
    </div>
  )
}

export default PartInfoList