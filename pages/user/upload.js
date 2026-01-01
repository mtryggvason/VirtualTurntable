import { useState } from 'react';
import { useRouter } from 'next/router';
import { mutate } from 'swr';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { uploadSong, uploadArtwork } from '../../utils/storage';
import { addSong } from '../../utils/firestore';
import styles from '../../styles/UploadPage.module.css';

function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    artist: ''
  });
  const [songFile, setSongFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSongFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an MP3 file
      if (file.type !== 'audio/mpeg' && !file.name.toLowerCase().endsWith('.mp3')) {
        setError('Please select an MP3 file only');
        return;
      }
      
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSongFile(file);
      setError('');
    }
  };

  const handleArtworkFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }
      setArtworkFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.artist || !songFile) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload song file
      const songUrl = await uploadSong(songFile, user.uid, formData.name);
      
      // Upload artwork if provided
      let artworkUrl = null;
      if (artworkFile) {
        artworkUrl = await uploadArtwork(artworkFile, user.uid, formData.name);
      }

      // Save song metadata to Firestore
      await addSong({
        name: formData.name,
        artist: formData.artist,
        songUrl,
        artworkUrl,
        userId: user.uid,
        userEmail: user.email
      });

      // Invalidate SWR cache to refresh user songs
      mutate(['userSongs', user.uid]);

      // Redirect to user page
      router.push('/user');
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app">
      <div className={styles.container}>
        <div className={styles.header}>
          <button 
            onClick={() => router.push('/user')}
            className={styles.backBtn}
          >
            ← Back to My Songs
          </button>
          <h1>Upload New Song</h1>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Song Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={uploading}
                placeholder="Enter song name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="artist">Artist *</label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                required
                disabled={uploading}
                placeholder="Enter artist name"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="songFile">Song File (MP3) * <small>(Max 10MB)</small></label>
              <div className={styles.fileInput}>
                <input
                  type="file"
                  id="songFile"
                  accept=".mp3,audio/mpeg"
                  onChange={handleSongFileChange}
                  required
                  disabled={uploading}
                />
                {songFile && (
                  <div className={styles.fileInfo}>
                    <span>📎 {songFile.name}</span>
                    <span>({(songFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="artworkFile">Artwork (Optional)</label>
              <div className={styles.fileInput}>
                <input
                  type="file"
                  id="artworkFile"
                  accept="image/*"
                  onChange={handleArtworkFileChange}
                  disabled={uploading}
                />
                {artworkFile && (
                  <div className={styles.fileInfo}>
                    <span>🖼️ {artworkFile.name}</span>
                    <span>({(artworkFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            </div>

            {artworkFile && (
              <div className={styles.artworkPreview}>
                <h4>Artwork Preview:</h4>
                <img 
                  src={URL.createObjectURL(artworkFile)} 
                  alt="Artwork preview"
                  className={styles.previewImage}
                />
              </div>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UploadPageProtected() {
  return (
    <ProtectedRoute>
      <UploadPage />
    </ProtectedRoute>
  );
}