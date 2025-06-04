import React from 'react'
import { CForm, CFormInput, CButton, CSpinner } from '@coreui/react'

const PartCodeForm = ({
  partCodes,
  loading,
  handleAddCode,
  handleRemoveCode,
  handleChangeCode,
  handleCheckParts,
}) => (
  <CForm onSubmit={handleCheckParts}>
    {partCodes.map((code, idx) => (
      <div key={idx} className="d-flex mb-2">
        <CFormInput
          placeholder={`Sale No ${idx + 1}`}
          value={code}
          onChange={e => handleChangeCode(idx, e.target.value)}
          required
        />
        {partCodes.length > 1 && (
          <CButton color="danger" className="ms-2" onClick={() => handleRemoveCode(idx)}>-</CButton>
        )}
      </div>
    ))}
    <CButton color="secondary" className="mb-2" onClick={handleAddCode}>Add new</CButton>
    <br />
    <CButton color="primary" type="submit" disabled={loading}>
      {loading ? <CSpinner size="sm" /> : 'Check and get infomation'}
    </CButton>
  </CForm>
)

export default PartCodeForm