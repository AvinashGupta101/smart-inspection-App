import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  X,
} from 'lucide-react';
import { User } from '../types';
import { UserAvatar } from './UserAvatar';
import {
  validateImageFile,
  compressAndResizeImage,
  formatBytes,
  CompressedImageResult,
} from '../utils/imageUtils';
import {
  auth,
  signInWithGoogle,
  uploadProfilePhotoToFirebase,
  removeProfilePhotoFromFirebase,
  onAuthStateChanged,
  FirebaseUser,
} from '../services/firebase';

interface ProfilePhotoUploaderProps {
  currentUser: User;
  onPhotoUpdated: (newPhotoUrl: string, firebaseUid?: string) => void;
  onPhotoRemoved: () => void;
  onShowToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentUser,
  onPhotoUpdated,
  onPhotoRemoved,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Selected file preview & compression state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressedImageResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  // Removal state
  const [isRemoving, setIsRemoving] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);

  // Messages & Errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Handle file choice from picker or drop
  const processSelectedFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Validation (JPG, JPEG, PNG, WEBP, <= 5 MB)
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      onShowToast?.('error', validation.error || 'Invalid file format or size.');
      return;
    }

    setSelectedFile(file);
    setIsCompressing(true);

    try {
      // 2. Client-side compression & aspect-ratio optimization
      const compressed = await compressAndResizeImage(file, 800, 0.85);
      setCompressedResult(compressed);
    } catch (err: unknown) {
      console.error('Image compression error:', err);
      setErrorMessage('Failed to optimize image. Please try another file.');
      onShowToast?.('error', 'Could not process image.');
      setSelectedFile(null);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
    // Reset input value so same file can be re-selected if desired
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  // Sign in to Google Firebase Auth if not already authenticated
  const handleAuthenticate = async () => {
    setIsAuthLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      setFirebaseUser(user);
      onShowToast?.('success', `Authenticated with Google as ${user.displayName || user.email}`);
      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setErrorMessage(`Authentication failed: ${msg}`);
      onShowToast?.('error', 'Firebase sign-in was not completed.');
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Perform Cloud Upload to Firebase Storage and Firestore
  const handleUpload = async () => {
    if (!compressedResult) {
      setErrorMessage('No image prepared for upload.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Ensure we have an authenticated Firebase user
      let user = auth.currentUser;
      if (!user) {
        user = await handleAuthenticate();
        if (!user) {
          setIsUploading(false);
          return;
        }
      }

      const uid = user.uid;

      // Upload to Firebase Storage & sync to Firestore users/{uid}
      const downloadUrl = await uploadProfilePhotoToFirebase(
        compressedResult.blob,
        uid,
        (progress, transferred, total) => {
          setUploadProgress(progress);
          setBytesTransferred(transferred);
          setTotalBytes(total);
        }
      );

      setSuccessMessage('Profile photo uploaded and synchronized to Firestore users/{uid}!');
      onShowToast?.('success', 'Profile photo updated in Firebase Storage & Firestore!');
      onPhotoUpdated(downloadUrl, uid);

      // Clean up preview
      setSelectedFile(null);
      setCompressedResult(null);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setErrorMessage(`Upload error: ${msg}`);
      onShowToast?.('error', 'Profile photo upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove Photo from Firebase Storage and Firestore
  const handleRemovePhoto = async () => {
    setIsConfirmRemoveOpen(false);
    setIsRemoving(true);
    setErrorMessage(null);

    try {
      const uid = auth.currentUser?.uid || currentUser.firebaseUid || currentUser.id;
      await removeProfilePhotoFromFirebase(uid, currentUser.avatarUrl);

      setSuccessMessage('Profile photo removed. Industrial default avatar restored.');
      onShowToast?.('info', 'Profile photo removed from cloud storage.');
      onPhotoRemoved();
    } catch (err: unknown) {
      console.error('Failed to remove photo:', err);
      const msg = err instanceof Error ? err.message : 'Removal failed.';
      setErrorMessage(`Failed to remove photo: ${msg}`);
      onShowToast?.('error', 'Could not remove profile photo.');
    } finally {
      setIsRemoving(false);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setCompressedResult(null);
    setErrorMessage(null);
  };

  const hasCustomPhoto = Boolean(currentUser.avatarUrl && currentUser.avatarUrl.trim());

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Hidden File Inputs for Gallery and Camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        id="profile-photo-file-input"
      />

      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-600" />
            <span>Profile Photo & Cloud Identity</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize your inspector badge. Photos are stored securely in Firebase Storage and linked to your Firestore UID.
          </p>
        </div>

        {/* Firebase Authentication Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase UID: {firebaseUser.uid.substring(0, 8)}...</span>
            </div>
          ) : (
            <button
              onClick={handleAuthenticate}
              disabled={isAuthLoading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-semibold hover:bg-orange-100 transition-colors"
              title="Sign in with Google to authenticate your Firebase session"
            >
              {isAuthLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-orange-600" />
              )}
              <span>Connect Firebase Auth</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts / Feedback */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="font-semibold flex-1">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Avatar Display & Upload Trigger Area */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Avatar Presentation with Status Ring */}
        <div className="relative group flex-shrink-0">
          <UserAvatar
            user={currentUser}
            size="2xl"
            className="ring-4 ring-orange-500/20 shadow-md transition-transform group-hover:scale-102"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-xl bg-orange-600 text-white shadow-md hover:bg-orange-700 transition-colors"
            title="Upload or change profile photo"
            aria-label="Upload photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Drag & Drop / Selection Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 w-full p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center text-center justify-center ${
            isDragging
              ? 'border-orange-500 bg-orange-50/50 scale-[1.01]'
              : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-orange-600 shadow-xs mb-2">
            <Upload className="w-5 h-5" />
          </div>

          <p className="text-xs font-bold text-slate-900">
            Drag & drop your photo here, or browse files
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
            Works with mobile gallery, desktop camera, or file folders. Supports JPG, JPEG, PNG, WEBP up to 5 MB.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasCustomPhoto ? 'Replace Profile Photo' : 'Upload Profile Photo'}</span>
            </button>

            {hasCustomPhoto && (
              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(true)}
                disabled={isRemoving}
                className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Photo Preview & Pre-Upload Optimization Card */}
      {selectedFile && (
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Photo Preview & Compression
              </span>
            </div>
            <button
              onClick={cancelSelection}
              className="p-1 rounded-lg hover:bg-orange-100 text-slate-500 transition-colors"
              title="Cancel selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* High-res circular/rounded preview */}
            <div className="relative flex-shrink-0">
              {compressedResult ? (
                <img
                  src={compressedResult.previewUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-orange-500/30 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-200 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                </div>
              )}
            </div>

            {/* Optimization stats */}
            <div className="flex-1 space-y-1.5 text-left text-xs">
              <p className="font-bold text-slate-900 truncate">{selectedFile.name}</p>
              {isCompressing ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  <span>Resizing and compressing to WebP format...</span>
                </div>
              ) : compressedResult ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Original Size</span>
                    <span className="font-semibold text-slate-700">
                      {formatBytes(compressedResult.originalSize)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-orange-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Optimized WebP</span>
                    <span className="font-bold text-emerald-700">
                      {formatBytes(compressedResult.compressedSize)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-orange-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block uppercase">Dimensions</span>
                    <span className="font-semibold text-slate-700">
                      {compressedResult.width} × {compressedResult.height} px
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  <span>Uploading to Firebase Storage & saving Firestore users/{'{uid}'}...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-orange-200/60 overflow-hidden">
                <div
                  className="h-full bg-orange-600 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {totalBytes > 0 && (
                <p className="text-[10px] text-slate-500 text-right">
                  {formatBytes(bytesTransferred)} of {formatBytes(totalBytes)} transferred
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-orange-200/60">
            <button
              type="button"
              onClick={cancelSelection}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || isCompressing || !compressedResult}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Save Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Photo Removal */}
      {isConfirmRemoveOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Remove Profile Photo?</h4>
                <p className="text-xs text-slate-500">Your badge will revert to the default avatar.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action deletes the photo from Firebase Storage and updates your Firestore document under{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-800">
                users/{'{uid}'}
              </code>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmRemoveOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                Keep Photo
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
