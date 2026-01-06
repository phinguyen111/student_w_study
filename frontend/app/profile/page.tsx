'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { User, Lock, Mail, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Save, X, Edit2, Shield, Sparkles, KeyRound, CheckCircle2, Camera } from 'lucide-react'

export default function ProfilePage() {
  const { isAuthenticated, user, loading, refreshUser } = useAuth()
  const router = useRouter()
  
  // Profile edit states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  
  // Avatar upload states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      if (user.avatar) {
        // Nếu là Cloudinary URL (đã là full URL), dùng trực tiếp
        // Nếu là relative path (local), thêm base URL
        const avatarUrl = user.avatar.startsWith('http')
          ? `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`
          : (() => {
              const getApiBaseUrl = () => {
                if (typeof window !== 'undefined') {
                  if (window.location.hostname.includes('vercel.app')) {
                    return 'https://codecatalyst-azure.vercel.app'
                  }
                }
                return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
              }
              const baseUrl = getApiBaseUrl()
              return `${baseUrl}${user.avatar}${user.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`
            })()
        console.log('Loading avatar from:', avatarUrl)
        setAvatarPreview(avatarUrl)
      } else {
        setAvatarPreview(null)
      }
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setIsSavingProfile(true)

    try {
      const response = await api.put('/auth/profile', {
        name: name.trim(),
        email: email.trim()
      })

      if (response.data.success) {
        setProfileSuccess('Profile updated successfully!')
        setIsEditingProfile(false)
        await refreshUser()
        setTimeout(() => setProfileSuccess(''), 4000)
      }
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })

      if (response.data.success) {
        setPasswordSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(''), 4000)
      }
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const cancelEdit = () => {
    setIsEditingProfile(false)
    setName(user?.name || '')
    setEmail(user?.email || '')
    setProfileError('')
    setProfileSuccess('')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size must be less than 5MB')
      return
    }

    setAvatarError('')
    setIsUploadingAvatar(true)

    // Tạm thời hiển thị preview từ file (sẽ được thay thế bằng URL từ server sau khi upload thành công)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const token = localStorage.getItem('token')
      const getApiUrl = () => {
        if (typeof window !== 'undefined') {
          if (window.location.hostname.includes('vercel.app')) {
            return 'https://codecatalyst-azure.vercel.app/api'
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      }
      const apiUrl = getApiUrl()

      console.log('Uploading avatar to:', `${apiUrl}/auth/avatar`)
      console.log('File info:', { name: file.name, size: file.size, type: file.type })

      const response = await fetch(`${apiUrl}/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      console.log('Response status:', response.status, response.statusText)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload avatar')
      }

      if (data.success) {
        console.log('Upload successful! Avatar path:', data.avatar)
        console.log('User data from response:', data.user)
        
        // Cập nhật avatar preview ngay từ response
        // Avatar từ Cloudinary đã là full URL, không cần thêm base URL
        if (data.avatar || data.user?.avatar) {
          const avatarUrl = data.avatar || data.user?.avatar
          // Nếu là Cloudinary URL (đã là full URL), dùng trực tiếp
          // Nếu là relative path (local), thêm base URL
          const finalUrl = avatarUrl.startsWith('http') 
            ? `${avatarUrl}?t=${Date.now()}` // Cloudinary URL - thêm timestamp để force reload
            : (() => {
                const getApiBaseUrl = () => {
                  if (typeof window !== 'undefined') {
                    if (window.location.hostname.includes('vercel.app')) {
                      return 'https://codecatalyst-azure.vercel.app'
                    }
                  }
                  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
                }
                return `${getApiBaseUrl()}${avatarUrl}?t=${Date.now()}`
              })()
          console.log('Setting avatar URL to:', finalUrl)
          setAvatarPreview(finalUrl)
        } else {
          console.error('No avatar path in response!', data)
        }
        
        // Refresh user data để đảm bảo sync
        console.log('Refreshing user data...')
        await refreshUser()
        console.log('User data refreshed')
        setProfileSuccess('Avatar updated successfully!')
        setTimeout(() => setProfileSuccess(''), 4000)
      } else {
        console.error('Upload failed - success is false:', data)
        throw new Error(data.message || 'Upload failed')
      }
    } catch (error: any) {
      setAvatarError(error.message || 'Failed to upload avatar')
      // Reset to original avatar on error
      if (user?.avatar) {
        // Nếu là Cloudinary URL (đã là full URL), dùng trực tiếp
        // Nếu là relative path (local), thêm base URL
        const avatarUrl = user.avatar.startsWith('http')
          ? user.avatar
          : (() => {
              const getApiBaseUrl = () => {
                if (typeof window !== 'undefined') {
                  if (window.location.hostname.includes('vercel.app')) {
                    return 'https://codecatalyst-azure.vercel.app'
                  }
                }
                return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
              }
              return `${getApiBaseUrl()}${user.avatar}`
            })()
        setAvatarPreview(avatarUrl)
      } else {
        setAvatarPreview(null)
      }
    } finally {
      setIsUploadingAvatar(false)
      // Reset input
      e.target.value = ''
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    
    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ]
    return { strength, ...levels[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">Loading your profile</p>
            <p className="text-sm text-muted-foreground">Please wait a moment...</p>
          </div>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  const avatarBgColors = [
    'from-blue-500 via-purple-500 to-pink-500',
    'from-pink-500 via-rose-500 to-orange-500',
    'from-green-500 via-emerald-500 to-teal-500',
    'from-orange-500 via-amber-500 to-yellow-500',
    'from-indigo-500 via-blue-500 to-cyan-500',
    'from-cyan-500 via-teal-500 to-green-500',
  ]
  const avatarColor = avatarBgColors[(user?.name?.length || 0) % avatarBgColors.length]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl relative z-10">
        {/* Enhanced Header Section */}
        <div className="mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 text-primary text-sm font-semibold mb-5 shadow-sm border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Account Management</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent leading-tight">
            Profile Settings
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Manage your account information, security settings, and preferences with ease
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* Profile Avatar & Info Card - Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 rounded-lg"></div>
              <CardContent className="p-6 md:p-8 relative">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Enhanced Avatar */}
                  <div className="relative group">
                    <div className={`absolute -inset-2 bg-gradient-to-br ${avatarColor} rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                    <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-4xl md:text-5xl font-extrabold shadow-2xl transform group-hover:scale-110 transition-all duration-500 ring-4 ring-white dark:ring-slate-900`}>
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt={user?.name || 'User'}
                          fill
                          sizes="(max-width: 768px) 112px, 128px"
                          className="object-cover"
                          unoptimized
                          onError={() => {
                            // Fallback về initials nếu ảnh không load được
                            console.error('Failed to load avatar image:', avatarPreview)
                            setAvatarPreview(null)
                          }}
                        />
                      ) : (
                        getInitials(user?.name || 'User')
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                      <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                    </div>
                    {/* Upload Button */}
                    <label className="absolute inset-0 cursor-pointer rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-1 text-white">
                        {isUploadingAvatar ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6" />
                        )}
                        <span className="text-xs font-medium">Upload</span>
                      </div>
                    </label>
                  </div>
                  
                  {/* Avatar Upload Error */}
                  {avatarError && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{avatarError}</span>
                        <button
                          type="button"
                          onClick={() => setAvatarError('')}
                          className="text-destructive/60 hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="space-y-3 w-full">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {user?.name || 'User'}
                      </h2>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm md:text-base break-all">{user?.email}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary text-sm font-semibold border border-primary/20">
                        <Shield className="h-4 w-4" />
                        Verified Account
                      </span>
                    </div>
                  </div>
            </div>
          </CardContent>
        </Card>
              </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Account Information Card */}
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-5 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-lg">
                    <User className="h-6 w-6" />
              </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold">Account Information</CardTitle>
                    <CardDescription className="text-base mt-1.5">Update your personal details and contact information</CardDescription>
              </div>
            </div>
          </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Enhanced Alert Messages */}
                  {profileError && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-destructive/10 to-red-500/10 border-2 border-destructive/30 text-destructive animate-in slide-in-from-top-3 duration-500 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-destructive/20 flex-shrink-0">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-1">Update Failed</p>
                          <p className="text-sm leading-relaxed">{profileError}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProfileError('')}
                          className="text-destructive/60 hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10 flex-shrink-0"
                          aria-label="Close error"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {profileSuccess && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 animate-in slide-in-from-top-3 duration-500 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-green-500/20 flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-1">Success!</p>
                          <p className="text-sm leading-relaxed">{profileSuccess}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Form Fields */}
                  <div className="grid gap-6">
                    <div className="space-y-3">
                      <label htmlFor="name" className="text-sm font-bold flex items-center gap-2.5 text-foreground">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                  </div>
                        Full Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        disabled={!isEditingProfile || isSavingProfile}
                        className="h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
            </div>

                    <div className="space-y-3">
                      <label htmlFor="email" className="text-sm font-bold flex items-center gap-2.5 text-foreground">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Mail className="h-4 w-4" />
                </div>
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        disabled={!isEditingProfile || isSavingProfile}
                        className="h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                </div>
              </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {!isEditingProfile ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="flex-1 h-14 text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        size="lg"
                      >
                        <Edit2 className="h-5 w-5 mr-2.5" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isSavingProfile}
                          className="flex-1 h-14 text-base font-bold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                          size="lg"
                        >
                          <X className="h-5 w-5 mr-2.5" />
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSavingProfile}
                          className="flex-1 h-14 text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                          size="lg"
                        >
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5 mr-2.5" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </>
                    )}
            </div>
                </form>
          </CardContent>
        </Card>

            {/* Change Password Card */}
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md hover:shadow-3xl transition-all duration-500">
              <CardHeader className="pb-5 border-b border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 shadow-lg">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl md:text-3xl font-bold">Security Settings</CardTitle>
                    <CardDescription className="text-base mt-1.5">Change your password to keep your account secure</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Enhanced Alert Messages */}
                  {passwordError && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-destructive/10 to-red-500/10 border-2 border-destructive/30 text-destructive animate-in slide-in-from-top-3 duration-500 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-destructive/20 flex-shrink-0">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-1">Password Change Failed</p>
                          <p className="text-sm leading-relaxed">{passwordError}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPasswordError('')}
                          className="text-destructive/60 hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10 flex-shrink-0"
                          aria-label="Close error"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 animate-in slide-in-from-top-3 duration-500 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-green-500/20 flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm mb-1">Password Changed!</p>
                          <p className="text-sm leading-relaxed">{passwordSuccess}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Password Fields */}
                  <div className="grid gap-6">
                    <div className="space-y-3">
                      <label htmlFor="currentPassword" className="text-sm font-bold text-foreground flex items-center gap-2.5">
                        <Lock className="h-4 w-4 text-primary" />
                        Current Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          required
                          disabled={isChangingPassword}
                          className="pl-12 pr-12 h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                          tabIndex={-1}
                          aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="newPassword" className="text-sm font-bold text-foreground flex items-center gap-2.5">
                        <Lock className="h-4 w-4 text-primary" />
                        New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (minimum 6 characters)"
                          required
                          disabled={isChangingPassword}
                          className="pl-12 pr-12 h-14 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-60"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                          tabIndex={-1}
                          aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Password strength:</span>
                            <span className={`font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${passwordStrength.color} transition-all duration-500 rounded-full`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="confirmPassword" className="text-sm font-bold text-foreground flex items-center gap-2.5">
                        <Lock className="h-4 w-4 text-primary" />
                        Confirm New Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          required
                          disabled={isChangingPassword}
                          className={`pl-12 pr-12 h-14 text-base border-2 focus:ring-2 transition-all duration-300 disabled:opacity-60 ${
                            confirmPassword && passwordsMatch
                              ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20'
                              : confirmPassword && !passwordsMatch
                              ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                              : 'focus:border-primary focus:ring-primary/20'
                          }`}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
                          tabIndex={-1}
                          aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {/* Password Match Indicator */}
                      {confirmPassword && (
                        <div className="flex items-center gap-2 text-sm">
                          {passwordsMatch ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600 dark:text-green-400 font-medium">Passwords match</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-destructive font-medium">Passwords do not match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
            </div>

                  <Button
                    type="submit"
                    disabled={isChangingPassword || !passwordsMatch || !newPassword}
                    className="w-full h-14 text-base font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    size="lg"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2.5 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-5 w-5 mr-2.5" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
