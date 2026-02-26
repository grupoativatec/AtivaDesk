import { api } from "./client"

export interface CertificateRecord {
  id: string
  domain: string
  subdomains: string[]
  issuedAt: string
  expiresAt: string
  pendingRenewal: boolean
  createdAt: string
  updatedAt: string
}

export interface ListCertificatesResponse {
  ok: boolean
  certificates: CertificateRecord[]
}

export interface CertificateResponse {
  ok: boolean
  certificate: CertificateRecord
}

export interface DeleteCertificateResponse {
  ok: boolean
  message: string
}

export interface CreateCertificateRequest {
  domain: string
  subdomains: string[]
  issuedAt: string
  expiresAt: string
  pendingRenewal: boolean
}

export interface UpdateCertificateRequest {
  domain?: string
  subdomains?: string[]
  issuedAt?: string
  expiresAt?: string
  pendingRenewal?: boolean
}

export async function listCertificates() {
  const response = await api.get<ListCertificatesResponse>("/api/admin/certificados")
  return response.certificates
}

export async function createCertificate(data: CreateCertificateRequest) {
  const response = await api.post<CertificateResponse>("/api/admin/certificados", data)
  return response.certificate
}

export async function updateCertificate(
  certificateId: string,
  data: UpdateCertificateRequest
) {
  const response = await api.patch<CertificateResponse>(`/api/admin/certificados/${certificateId}`, data)
  return response.certificate
}

export async function deleteCertificate(certificateId: string) {
  return api.delete<DeleteCertificateResponse>(`/api/admin/certificados/${certificateId}`)
}

