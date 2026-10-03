import { useRef, useState } from 'react';
import { api } from '../api.js';
import ProductImage from './ProductImage.jsx';

/** Admin field: upload an image file (or paste a URL) and preview it. */
export default function ImageUploadField({ value, onChange, emoji = '🍦' }) {
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const { url } = await api.admin.uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="span-2 image-field">
      <ProductImage src={value} emoji={emoji} className="image-preview" />
      <div className="image-field-controls">
        <span className="field-label">Image</span>
        <div className="image-field-buttons">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInput.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
          </button>
          {value && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>Remove</button>
          )}
        </div>
        <input
          className="url-input"
          placeholder="…or paste an image URL"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={upload} />
        {error && <span className="small error-text">{error}</span>}
      </div>
    </div>
  );
}
