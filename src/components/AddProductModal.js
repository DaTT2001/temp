import React from 'react'
import {
  CModal, CModalHeader, CModalBody, CModalFooter, CForm, CFormLabel, CFormInput,
  CButton, CAlert, CSpinner
} from '@coreui/react'

const AddProductModal = ({
  visible, onClose, onAdd, loading, error, success,
  newProduct, setNewProduct, imagePreview, handleImageChange
}) => (
  <CModal visible={visible} onClose={onClose}>
    <CModalHeader>
      <strong>Add new product</strong>
    </CModalHeader>
    <CModalBody>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}
      <CForm>
        {/* Section 1: General Information */}
        <div style={{ marginBottom: 16 }}>
          <h6>General Information</h6>
          <CFormLabel>Customer</CFormLabel>
          <CFormInput value={newProduct.customer} onChange={e => setNewProduct({ ...newProduct, customer: e.target.value })} />
          <CFormLabel className="mt-2">Product Name</CFormLabel>
          <CFormInput value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <CFormLabel className="mt-2">VKD Sale No.</CFormLabel>
          <CFormInput value={newProduct.sale} onChange={e => setNewProduct({ ...newProduct, sale: e.target.value })} />
          <CFormLabel className="mt-2">ERP Code (Hot Forging Billet)</CFormLabel>
          <CFormInput value={newProduct.ERPCode} onChange={e => setNewProduct({ ...newProduct, ERPCode: e.target.value })} />
        </div>
        <hr />
        {/* Image upload section */}
        <div style={{ marginBottom: 16 }}>
          <h6>Product Image</h6>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              style={{ marginTop: 10, maxWidth: 200, maxHeight: 150, border: '1px solid #eee' }}
            />
          )}
        </div>
        {/* Section 3: Heat Treatment Parameters */}
        <div>
          <h6>Heat Treatment Parameters</h6>
          <div className="row">
            <div className="col">
              <CFormLabel>T4 Temperature (℃)</CFormLabel>
              <CFormInput value={newProduct.heatt4} onChange={e => setNewProduct({ ...newProduct, heatt4: e.target.value })} />
            </div>
            <div className="col">
              <CFormLabel>T5 Temperature (℃)</CFormLabel>
              <CFormInput value={newProduct.heatt5} onChange={e => setNewProduct({ ...newProduct, heatt5: e.target.value })} />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col">
              <CFormLabel>T4 Heating Time (minutes)</CFormLabel>
              <CFormInput value={newProduct.t4time1} onChange={e => setNewProduct({ ...newProduct, t4time1: e.target.value })} />
            </div>
            <div className="col">
              <CFormLabel>T5 Heating Time (minutes)</CFormLabel>
              <CFormInput value={newProduct.t5time1} onChange={e => setNewProduct({ ...newProduct, t5time1: e.target.value })} />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col">
              <CFormLabel>T4 Soaking Time (minutes)</CFormLabel>
              <CFormInput value={newProduct.t4time2} onChange={e => setNewProduct({ ...newProduct, t4time2: e.target.value })} />
            </div>
            <div className="col">
              <CFormLabel>T5 Soaking Time (minutes)</CFormLabel>
              <CFormInput value={newProduct.t5time2} onChange={e => setNewProduct({ ...newProduct, t5time2: e.target.value })} />
            </div>
          </div>
        </div>
        {/* Section 2: Technical Specifications */}
        <div style={{ marginBottom: 16 }}>
          <h6>Technical Specifications</h6>
          <CFormLabel>Material Grade</CFormLabel>
          <CFormInput value={newProduct.materialgrade} onChange={e => setNewProduct({ ...newProduct, materialgrade: e.target.value })} />
          <CFormLabel className="mt-2">Hardness</CFormLabel>
          <CFormInput value={newProduct.hardness} onChange={e => setNewProduct({ ...newProduct, hardness: e.target.value })} />
          <CFormLabel className="mt-2">PCS Max</CFormLabel>
          <CFormInput value={newProduct.pcsmax} onChange={e => setNewProduct({ ...newProduct, pcsmax: e.target.value })} />
          <CFormLabel className="mt-2">Weight (kg)</CFormLabel>
          <CFormInput value={newProduct.weight} onChange={e => setNewProduct({ ...newProduct, weight: e.target.value })} />
        </div>
        <hr />
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={onClose}>
        Đóng
      </CButton>
      <CButton color="primary" onClick={onAdd} disabled={loading}>
        {loading ? <CSpinner size="sm" /> : 'Lưu'}
      </CButton>
    </CModalFooter>
  </CModal>
)

export default AddProductModal