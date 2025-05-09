import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user, token } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return <div>Loading...</div>
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match!')
      return
    }
    setLoading(true)
    try {
      await axios.post(
        'http://117.6.40.130:1337/api/auth/change-password',
        {
          currentPassword: oldPassword,
          password: newPassword,
          passwordConfirmation: confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      toast.success('Password changed successfully!')
      setShowModal(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          'Change password failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow className="justify-content-center mt-4">
      <CCol md={6}>
        <CCard>
          <CCardHeader>
            <h4>User Profile</h4>
          </CCardHeader>
          <CCardBody>
            <CListGroup flush>
              <CListGroupItem>
                <strong>Username:</strong> {user.username}
              </CListGroupItem>
              <CListGroupItem>
                <strong>Email:</strong> {user.email}
              </CListGroupItem>
              <CListGroupItem>
                <strong>Provider:</strong> {user.provider}
              </CListGroupItem>
              <CListGroupItem>
                <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}
              </CListGroupItem>
              <CListGroupItem>
                <strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleString()}
              </CListGroupItem>
            </CListGroup>
            <CButton color="warning" className="mt-3" onClick={() => setShowModal(true)}>
              Change Password
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader onClose={() => setShowModal(false)}>Change Password</CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleChangePassword}>
            <CFormInput
              type="password"
              label="Current Password"
              className="mb-2"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <CFormInput
              type="password"
              label="New Password"
              className="mb-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <CFormInput
              type="password"
              label="Confirm New Password"
              className="mb-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Change'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CRow>
  )
}

export default Profile