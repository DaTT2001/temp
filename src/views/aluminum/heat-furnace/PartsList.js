import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CCard, CCardHeader, CCardBody, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CSpinner, CPagination, CPaginationItem, CFormInput, CInputGroup, CInputGroupText, CButton, CModal, CModalHeader, CModalBody, CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPencil } from '@coreui/icons'
import AddProductModal from '../../../components/AddProductModal'
import { uploadImage, createProduct } from '../../../api'
import { toast } from 'react-toastify'

const PAGE_SIZE = 10

const initialProduct = {
  sale: '', ERPCode: '', heatt4: '', heatt5: '', customer: '', name: '',
  materialgrade: '', hardness: '', pcsmax: '', weight: '',
  t4time1: '', t4time2: '', t5time1: '', t5time2: '',
}

const PartsList = () => {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  // Add/Edit product modal state
  const [showModal, setShowModal] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [newProduct, setNewProduct] = useState(initialProduct)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [editId, setEditId] = useState(null)

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const fetchParts = async (searchValue = '', pageNum = 1) => {
    setLoading(true)
    try {
      let url = `http://117.6.40.130:1337/api/products?populate=image&pagination[page]=${pageNum}&pagination[pageSize]=${PAGE_SIZE}`
      if (searchValue) {
        url += `&filters[sale][$contains]=${encodeURIComponent(searchValue)}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setParts(data.data || [])
      setPageCount(data.meta?.pagination?.pageCount || 1)
      setTotal(data.meta?.pagination?.total || 0)
    } catch {
      setParts([])
      setPageCount(1)
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchParts(search, page)
    // eslint-disable-next-line
  }, [page, search])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPage(1)
  }

  // Add/Edit product handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  const handleAddProduct = async () => {
    setAddLoading(true)
    setAddError('')
    setAddSuccess('')
    let imageId = null
    try {
      if (imageFile) imageId = await uploadImage(imageFile)
      if (editId) {
        // Update logic dùng axios
        const res = await axios.put(
          `http://117.6.40.130:1337/api/products/${editId}`,
          { data: { ...newProduct, image: imageId } }
        )
        if (!res.data || res.status !== 200) {
          throw new Error('Update failed')
        }
        toast.success('Cập nhật linh kiện thành công!')
      } else {
        // Add logic
        await createProduct({ ...newProduct, image: imageId })
        toast.success('Thêm linh kiện thành công!')
      }
      setAddSuccess('Thành công!')
      setNewProduct(initialProduct)
      setImageFile(null)
      setImagePreview(null)
      setShowModal(false)
      setEditId(null)
      fetchParts(search, 1)
      setPage(1)
    } catch {
      setAddError('Lỗi khi lưu linh kiện!')
      toast.error('Lỗi khi lưu linh kiện!')
    }
    setAddLoading(false)
  }

  // Khi bấm edit
  const handleEdit = (part) => {
    setEditId(part.documentId)
    setNewProduct({
      sale: part.sale || '',
      ERPCode: part.ERPCode || '',
      heatt4: part.heatt4 || '',
      heatt5: part.heatt5 || '',
      customer: part.customer || '',
      name: part.name || '',
      materialgrade: part.materialgrade || '',
      hardness: part.hardness || '',
      pcsmax: part.pcsmax || '',
      weight: part.weight || '',
      t4time1: part.t4time1 || '',
      t4time2: part.t4time2 || '',
      t5time1: part.t5time1 || '',
      t5time2: part.t5time2 || '',
    })
    setImagePreview(
      part.image?.formats?.thumbnail?.url
        ? `http://117.6.40.130:1337${part.image.formats.thumbnail.url}`
        : part.image?.url
          ? `http://117.6.40.130:1337${part.image.url}`
          : null
    )
    setShowModal(true)
  }

  // Delete logic
  const handleDelete = async () => {
  try {
    const res = await axios.delete(`http://117.6.40.130:1337/api/products/${deleteId}`)
    if (res.status !== 200 && res.status !== 204) {
      throw new Error(res.data?.error?.message || 'Delete failed')
    }
    toast.success('Xóa thành công!')
    setShowDeleteModal(false)
    setDeleteId(null)
    if (parts.length === 1 && page > 1) {
      setPage(page - 1)
    } else {
      fetchParts(search, page)
    }
  } catch (err) {
    toast.error(err?.response?.data?.error?.message || 'Xóa thất bại!')
    setShowDeleteModal(false)
    setDeleteId(null)
  }
}

  return (
    <CCard>
      <CCardHeader>
        Parts List
        <span style={{
          fontWeight: 400,
          fontSize: 16,
          marginLeft: 16,
          color: '#888'
        }}>
          {loading ? '' : `(Total: ${total})`}
        </span>
        <CButton
          color="success"
          className="float-end"
          style={{ minWidth: 160 }}
          onClick={() => {
            setShowModal(true)
            setEditId(null)
            setNewProduct(initialProduct)
            setImageFile(null)
            setImagePreview(null)
          }}
        >
          Add new part
        </CButton>
      </CCardHeader>
      <CCardBody>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, justifyContent: 'space-between' }}>
          <CInputGroup style={{ maxWidth: 320 }}>
            <CInputGroupText>Sale no</CInputGroupText>
            <CFormInput
              placeholder="Search by sale no"
              value={search}
              onChange={handleSearchChange}
            />
          </CInputGroup>
        </div>
        <AddProductModal
          visible={showModal}
          onClose={() => {
            setShowModal(false)
            setEditId(null)
            setNewProduct(initialProduct)
            setImageFile(null)
            setImagePreview(null)
          }}
          onAdd={handleAddProduct}
          loading={addLoading}
          error={addError}
          success={addSuccess}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          isEdit={!!editId}
        />
        {loading ? (
          <div className="text-center py-5"><CSpinner color="primary" /></div>
        ) : parts.length === 0 ? (
          <div className="text-center py-5 text-muted" style={{ fontSize: 20 }}>No parts found.</div>
        ) : (
          <>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Image</CTableHeaderCell>
                  <CTableHeaderCell>Sale no</CTableHeaderCell>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Customer</CTableHeaderCell>
                  <CTableHeaderCell>Material</CTableHeaderCell>
                  <CTableHeaderCell>Hardness</CTableHeaderCell>
                  <CTableHeaderCell>T4 (℃/min)</CTableHeaderCell>
                  <CTableHeaderCell>T5 (℃/min)</CTableHeaderCell>
                  <CTableHeaderCell>Max pcs</CTableHeaderCell>
                  <CTableHeaderCell>Weight</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {parts.map((p, idx) => (
                  <CTableRow key={p.id} className="align-middle">
                    <CTableDataCell>{(page - 1) * PAGE_SIZE + idx + 1}</CTableDataCell>
                    <CTableDataCell>
                      {p.image?.formats?.thumbnail?.url ? (
                        <img
                          src={`http://117.6.40.130:1337${p.image.formats.thumbnail.url}`}
                          alt={p.name}
                          style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }}
                        />
                      ) : p.image?.url ? (
                        <img
                          src={`http://117.6.40.130:1337${p.image.url}`}
                          alt={p.name}
                          style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{p.sale}</CTableDataCell>
                    <CTableDataCell>{p.name}</CTableDataCell>
                    <CTableDataCell>{p.customer}</CTableDataCell>
                    <CTableDataCell>{p.materialgrade}</CTableDataCell>
                    <CTableDataCell>{p.hardness}</CTableDataCell>
                    <CTableDataCell>{p.heatt4} / {p.t4time1} + {p.t4time2}</CTableDataCell>
                    <CTableDataCell>{p.heatt5} / {p.t5time1} + {p.t5time2}</CTableDataCell>
                    <CTableDataCell>{p.pcsmax}</CTableDataCell>
                    <CTableDataCell>{p.weight}</CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        color="info"
                        size="sm"
                        variant="ghost"
                        className="me-2"
                        onClick={() => handleEdit(p)}
                        title="Edit"
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowDeleteModal(true)
                          setDeleteId(p.documentId)
                        }}
                        title="Delete"
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <CPagination align="end" aria-label="pagination">
              {[...Array(pageCount)].map((_, i) => (
                <CPaginationItem
                  key={i + 1}
                  active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
            </CPagination>
          </>
        )}
        {/* Delete confirm modal */}
        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader onClose={() => setShowDeleteModal(false)}>
            Confirm Delete
          </CModalHeader>
          <CModalBody>
            Are you sure you want to delete this part?
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Delete
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default PartsList