import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Image,
  Modal,
  Input,
  message,
  Timeline,
  Spin,
  Result,
  Row,
  Col,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi, type ApplicationStatus, type ApplicationReviewLog } from '@/services/applications'
import dayjs from 'dayjs'

const { TextArea } = Input

const statusConfig: Record<ApplicationStatus, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Draft' },
  submitted: { color: 'orange', label: 'Pending Review' },
  under_review: { color: 'processing', label: 'Under Review' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' },
}

const actionLabels: Record<string, string> = {
  submit: 'Submitted application',
  start_review: 'Started reviewing',
  approve: 'Approved application',
  reject: 'Rejected application',
  resubmit: 'Resubmitted application',
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id,
  })

  const { data: logs } = useQuery({
    queryKey: ['application-logs', id],
    queryFn: () => applicationsApi.getReviewLogs(id!),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: () => applicationsApi.approve(id!),
    onSuccess: () => {
      message.success('Application approved successfully!')
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['application-logs', id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: () => {
      message.error('Failed to approve application')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => applicationsApi.reject(id!, reason),
    onSuccess: () => {
      message.success('Application rejected')
      setRejectModalOpen(false)
      setRejectReason('')
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['application-logs', id] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: () => {
      message.error('Failed to reject application')
    },
  })

  const handleApprove = () => {
    Modal.confirm({
      title: 'Approve Application',
      content: 'Are you sure you want to approve this merchant application? This will create a new merchant account.',
      okText: 'Approve',
      okType: 'primary',
      onOk: () => approveMutation.mutate(),
    })
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.warning('Please provide a rejection reason')
      return
    }
    rejectMutation.mutate(rejectReason)
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <Result
        status="404"
        title="Application Not Found"
        subTitle="The application you're looking for doesn't exist."
        extra={
          <Button type="primary" onClick={() => navigate('/applications')}>
            Back to Applications
          </Button>
        }
      />
    )
  }

  const canReview = ['submitted', 'under_review'].includes(application.status)

  return (
    <div>
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/applications')}>
          Back
        </Button>
        <h2 style={{ margin: 0 }}>Application Details</h2>
        <Tag color={statusConfig[application.status].color}>
          {statusConfig[application.status].label}
        </Tag>
      </Space>

      <Row gutter={24}>
        <Col span={16}>
          {/* Business Information */}
          <Card
            title={
              <Space>
                <ShopOutlined />
                Business Information
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={24}>
              <Col span={12}>
                {application.logo && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#888', marginBottom: 8 }}>Logo</div>
                    <Image src={application.logo} width={100} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </Col>
              <Col span={12}>
                {application.banner && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ color: '#888', marginBottom: 8 }}>Banner</div>
                    <Image src={application.banner} width={200} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </Col>
            </Row>
            <Descriptions column={2}>
              <Descriptions.Item label="Business Name">{application.businessName}</Descriptions.Item>
              <Descriptions.Item label="Category">{application.category?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {application.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Contact Information */}
          <Card
            title={
              <Space>
                <UserOutlined />
                Contact Information
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="Contact Name">{application.contactName}</Descriptions.Item>
              <Descriptions.Item label="Phone">{application.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="Email">{application.contactEmail || '-'}</Descriptions.Item>
              <Descriptions.Item label="Applicant">
                {application.user?.name || application.user?.phone || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Address */}
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                Address
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="State">{application.province}</Descriptions.Item>
              <Descriptions.Item label="City">{application.city}</Descriptions.Item>
              <Descriptions.Item label="Suburb">{application.district}</Descriptions.Item>
              <Descriptions.Item label="Street Address">{application.address}</Descriptions.Item>
              <Descriptions.Item label="Coordinates">
                {application.longitude && application.latitude
                  ? `${application.latitude}, ${application.longitude}`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Business Credentials */}
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                Business Credentials
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="ABN">{application.abn}</Descriptions.Item>
              <Descriptions.Item label="Food Safety Cert #">
                {application.foodSafetyCertNumber || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Owner Name">{application.ownerName || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider>Document Images</Divider>

            <Row gutter={24}>
              {application.abnCertificateImage && (
                <Col span={8}>
                  <div style={{ marginBottom: 8, color: '#888' }}>ABN Certificate</div>
                  <Image
                    src={application.abnCertificateImage}
                    width="100%"
                    style={{ maxHeight: 200, objectFit: 'contain' }}
                  />
                </Col>
              )}
              {application.foodSafetyCertImage && (
                <Col span={8}>
                  <div style={{ marginBottom: 8, color: '#888' }}>Food Safety Certificate</div>
                  <Image
                    src={application.foodSafetyCertImage}
                    width="100%"
                    style={{ maxHeight: 200, objectFit: 'contain' }}
                  />
                </Col>
              )}
              {application.ownerIdImage && (
                <Col span={8}>
                  <div style={{ marginBottom: 8, color: '#888' }}>Owner ID</div>
                  <Image
                    src={application.ownerIdImage}
                    width="100%"
                    style={{ maxHeight: 200, objectFit: 'contain' }}
                  />
                </Col>
              )}
            </Row>
          </Card>

          {/* Bank Information */}
          <Card
            title={
              <Space>
                <BankOutlined />
                Bank Information
              </Space>
            }
            style={{ marginBottom: 24 }}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="Account Name">
                {application.bankAccountName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Bank">{application.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="BSB">{application.bsb || '-'}</Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {application.accountNumber || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={8}>
          {/* Review Actions */}
          {canReview && (
            <Card title="Review Actions" style={{ marginBottom: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  block
                  size="large"
                  onClick={handleApprove}
                  loading={approveMutation.isPending}
                >
                  Approve Application
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  block
                  size="large"
                  onClick={() => setRejectModalOpen(true)}
                >
                  Reject Application
                </Button>
              </Space>
            </Card>
          )}

          {/* Rejection Reason */}
          {application.status === 'rejected' && application.rejectReason && (
            <Card title="Rejection Reason" style={{ marginBottom: 24 }}>
              <div style={{ color: '#ff4d4f' }}>{application.rejectReason}</div>
            </Card>
          )}

          {/* Review History */}
          <Card
            title={
              <Space>
                <HistoryOutlined />
                Review History
              </Space>
            }
          >
            <Timeline
              items={logs?.map((log: ApplicationReviewLog) => ({
                color: log.action === 'approve' ? 'green' : log.action === 'reject' ? 'red' : 'blue',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{actionLabels[log.action] || log.action}</div>
                    {log.comment && (
                      <div style={{ color: '#888', fontSize: 12 }}>{log.comment}</div>
                    )}
                    <div style={{ color: '#888', fontSize: 12 }}>
                      {log.actor?.name || 'System'} • {dayjs(log.createdAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                ),
              })) || []}
            />
            {(!logs || logs.length === 0) && (
              <div style={{ color: '#888', textAlign: 'center' }}>No review history</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Reject Modal */}
      <Modal
        title="Reject Application"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false)
          setRejectReason('')
        }}
        onOk={handleReject}
        okText="Reject"
        okButtonProps={{ danger: true, loading: rejectMutation.isPending }}
      >
        <p>Please provide a reason for rejection. This will be sent to the applicant.</p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason..."
        />
      </Modal>
    </div>
  )
}
