import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'

function AssetQRModal({ asset, onClose }) {
  const navigate = useNavigate()
  const qrRef = useRef(null)

  if (!asset) return null

  const assetId = asset._id || asset.id
  const frontendBaseUrl =
    import.meta.env.VITE_APP_URL || window.location.origin
  const assetUrl = `${frontendBaseUrl}/assets/${assetId}`

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const sanitizedName = (asset.name || 'asset')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')

    const link = document.createElement('a')
    link.download = `assethub-${sanitizedName}-qr.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenDetails = () => {
    onClose()
    navigate(`/assets/${assetId}`)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="qr-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="qr-modal-title">Asset QR Code</h2>
            <p>Physical tag for institutional inventory tracking</p>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-modal-asset-info">
            <h3 className="qr-modal-asset-name">{asset.name}</h3>
            <span
              className={`status ${asset.status
                ?.toLowerCase()
                .replace(' ', '-')}`}
            >
              {asset.status}
            </span>
          </div>

          <div className="qr-canvas-wrapper" ref={qrRef}>
            <QRCodeCanvas
              value={assetUrl}
              size={190}
              level="H"
              marginSize={3}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>

          <p className="qr-modal-id">
            Asset ID: <code>{assetId}</code>
          </p>

          <p className="qr-modal-instruction">
            Scan this QR code with a camera or barcode scanner to view asset details.
          </p>
        </div>

        <div className="form-actions qr-modal-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="open-asset-btn"
            onClick={handleOpenDetails}
          >
            🔍 Open Details
          </button>

          <button
            type="button"
            className="qr-download-button"
            aria-label="Download QR code"
            onClick={downloadQR}
          >
            📥 Download QR (PNG)
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssetQRModal
