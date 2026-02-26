"use client"

import { motion } from "framer-motion"
import { CertificatesManagementShell } from "@/components/features/admin/certificates/CertificatesManagementShell"

export default function AdminCertificatesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full flex flex-col"
    >
      <CertificatesManagementShell />
    </motion.div>
  )
}

