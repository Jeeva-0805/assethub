import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { getAsset } from '../services/api'

function AssetDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef(null)

  const fetchAssetDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAsset(id)
      setAsset(data)
    } catch (err) {
      console.error("Failed to fetch asset details:", err)
      setError(err.message || "Failed to load asset details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssetDetails()
  }, [id])

  // Get dynamic frontend base URL (works across localhost and production deployments)
  const frontendBaseUrl =
    import.meta.env.VITE_APP_URL || window.location.origin
  const assetUrl = `${frontendBaseUrl}/assets/${id}`

  // Safe filename for downloading QR code
  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const sanitizedName = (asset?.name || 'asset')
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

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(assetUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="page-header">
          <Link to="/assets" className="back-link">
            ← Back to Assets
          </Link>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading asset details...</p>
        </div>
      </main>
    )
  }

  if (error || !asset) {
    return (
      <main className="main-content">
        <div className="page-header">
          <Link to="/assets" className="back-link">
            ← Back to Assets
          </Link>
        </div>
        <div className="error-state">
          <p className="error-message">⚠️ {error || "Asset not found"}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="retry-button" onClick={fetchAssetDetails}>
              🔄 Try Again
            </button>
            <button className="cancel-button" onClick={() => navigate('/assets')}>
              Return to Catalog
            </button>
          </div>
        </div>
      </main>
    )
  }

  const assetId = asset._id || asset.id

  return (
    <main className="main-content">
      {/* Navigation Breadcrumb */}
      <div className="page-header">
        <div>
          <Link to="/assets" className="back-link">
            ← Back to Assets Catalog
          </Link>
          <h1 style={{ marginTop: 8 }}>{asset.name}</h1>
          <p>Institutional hardware asset profile and QR tracking tag.</p>
        </div>

        <button
          className="qr-download-button"
          aria-label="Download QR code"
          onClick={downloadQR}
        >
          📥 Download QR Tag
        </button>
      </div>

      <div className="asset-details-grid">
        {/* Left Column: Asset Information Card */}
        <div className="details-card">
          <div className="details-card-header">
            <span className="details-card-icon">📦</span>
            <div>
              <h2>Equipment Information</h2>
              <p>Registered inventory specifications</p>
            </div>
          </div>

          <div className="details-spec-list">
            <div className="spec-row">
              <span className="spec-label">Asset Name</span>
              <span className="spec-value spec-highlight">{asset.name}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Category</span>
              <span className="spec-value">{asset.category}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Status</span>
              <span className="spec-value">
                <span
                  className={`status ${asset.status
                    .toLowerCase()
                    .replace(' ', '-')}`}
                >
                  {asset.status}
                </span>
              </span>
            </div>

            <div className="spec-row">
              <span className="spec-label">Physical Location</span>
              <span className="spec-value">📍 {asset.location}</span>
            </div>

            <div className="spec-row">
              <span className="spec-label">System Asset ID</span>
              <span className="spec-value code-value" title={assetId}>
                {assetId}
              </span>
            </div>

            {asset.createdAt && (
              <div className="spec-row">
                <span className="spec-label">Registered Date</span>
                <span className="spec-value">
                  {new Date(asset.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: QR Code Tracking Card */}
        <div className="details-card qr-card">
          <div className="details-card-header">
            <span className="details-card-icon">📱</span>
            <div>
              <h2>Physical QR Asset Tag</h2>
              <p>Scan to verify equipment identification</p>
            </div>
          </div>

          <div className="qr-display-container">
            <div className="qr-canvas-frame" ref={qrRef}>
              <QRCodeCanvas
                value={assetUrl}
                size={200}
                level="H"
                marginSize={3}
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>

            <p className="qr-tag-label">
              Asset Tag: <strong>{asset.name}</strong>
            </p>
            <p className="qr-tag-id">ID: {assetId}</p>

            <div className="qr-encoded-box">
              <span className="encoded-label">Encoded Tracking URL:</span>
              <div className="encoded-url-row">
                <input
                  type="text"
                  readOnly
                  value={assetUrl}
                  className="encoded-url-input"
                />
                <button
                  type="button"
                  className="copy-url-btn"
                  onClick={copyUrlToClipboard}
                  title="Copy URL"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <p className="qr-instructions">
              Attach this generated QR label to the physical equipment casing.
              Scanning this QR tag from any device directs authorized
              personnel straight to this asset's management record.
            </p>

            <div className="qr-action-buttons">
              <button
                type="button"
                className="qr-download-button"
                aria-label="Download QR code"
                onClick={downloadQR}
              >
                📥 Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AssetDetails
