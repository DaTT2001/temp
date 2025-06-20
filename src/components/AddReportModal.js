import React, { useState } from 'react'
import {
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CButton,
    CForm,
    CFormInput,
    CFormLabel,
    CAlert,
    CSpinner
} from '@coreui/react'

const AddReportModal = ({ visible, onClose, onAdd, loading, error, success }) => {
    const [formData, setFormData] = useState({
        sale: '',
        t4start: '',
        t4end: '',
        t5start: '',
        t5end: '',
        t4temp: '',
        t5temp: '',
    })

    const [saleExistsError, setSaleExistsError] = useState(null)
    const [checkingSale, setCheckingSale] = useState(false)
    const [validationError, setValidationError] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const generateReportCode = (saleValue, t4start) => saleValue ? `${t4start} ${saleValue}` : ''

    const checkSaleExists = async (sale) => {
        setCheckingSale(true)
        setSaleExistsError(null)

        try {
            const res = await fetch(`http://117.6.40.130:1337/api/products?filters[sale][$eqi]=${encodeURIComponent(sale)}`)
            const data = await res.json()
            return data.data.length > 0
        } catch (e) {
            console.error('Error checking sale:', e)
            setSaleExistsError('Unable to verify sale number.')
            return false
        } finally {
            setCheckingSale(false)
        }
    }

    const validateFormData = () => {
        for (const key in formData) {
            if (!formData[key]) return 'All fields must be filled.'
        }
        if (formData.t4end <= formData.t4start || formData.t5end <= formData.t5start) {
            return 'End time must be later than start time.'
        }
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setValidationError(null)

        const validationMsg = validateFormData()
        if (validationMsg) {
            setValidationError(validationMsg)
            return
        }

        const exists = await checkSaleExists(formData.sale)
        if (!exists) {
            setSaleExistsError(`Sale number "${formData.sale}" does not exist.`)
            return
        }

        const reportData = {
            ...formData,
            reportcode: generateReportCode(formData.sale, formData.t4start),
        }

        onAdd(reportData)
    }

    return (
        <CModal visible={visible} onClose={onClose}>
            <CModalHeader closeButton>Add New Report</CModalHeader>
            <CModalBody>
                <CForm onSubmit={handleSubmit}>
                    {error && <CAlert color="danger">{error}</CAlert>}
                    {success && <CAlert color="success">{success}</CAlert>}
                    {saleExistsError && <CAlert color="warning">{saleExistsError}</CAlert>}
                    {validationError && <CAlert color="danger">{validationError}</CAlert>}

                    <div className="mb-3">
                        <CFormLabel>Sale No</CFormLabel>
                        <CFormInput name="sale" value={formData.sale} onChange={handleChange} required />
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <CFormLabel>T4 Start</CFormLabel>
                            <CFormInput type="datetime-local" name="t4start" value={formData.t4start} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <CFormLabel>T4 End</CFormLabel>
                            <CFormInput type="datetime-local" name="t4end" value={formData.t4end} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <CFormLabel>T5 Start</CFormLabel>
                            <CFormInput type="datetime-local" name="t5start" value={formData.t5start} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <CFormLabel>T5 End</CFormLabel>
                            <CFormInput type="datetime-local" name="t5end" value={formData.t5end} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <CFormLabel>T4 Temperature</CFormLabel>
                            <CFormInput type="number" name="t4temp" value={formData.t4temp} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <CFormLabel>T5 Temperature</CFormLabel>
                            <CFormInput type="number" name="t5temp" value={formData.t5temp} onChange={handleChange} />
                        </div>
                    </div>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onClose} disabled={loading || checkingSale}>Cancel</CButton>
                <CButton color="primary" onClick={handleSubmit} disabled={loading || checkingSale}>
                    {(loading || checkingSale) ? <CSpinner size="sm" /> : 'Add Report'}
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default AddReportModal