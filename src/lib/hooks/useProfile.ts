// src/lib/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profileApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// --------------------
// Fetch Profile
// --------------------
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await profileApi.getProfile();
      return res.data ?? {};
    },
    retry: false,
  });
}

// --------------------
// Update Profile (Enhanced)
// --------------------
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth(); // ✅ now available

  return useMutation({
    mutationFn: (data: any) => profileApi.updateProfile(data),
    onSuccess: (res) => {
      const updatedUser = res?.user || res?.data || {};

      // ✅ Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('erp_user') || '{}');
      const merged = { ...storedUser, ...updatedUser };
      localStorage.setItem('erp_user', JSON.stringify(merged));

      // ✅ Update context (instant UI reflection)
      setUser(merged);

      // ✅ Invalidate profile cache
      queryClient.setQueryData(['profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast.success('Profile updated successfully');
    },
    onError: (error: any) =>
      toast.error(error.message || 'Failed to update profile'),
  });
}

// --------------------
// Change Password
// --------------------
export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => toast.success('Password updated successfully'),
    onError: (err: any) => toast.error(err.message),
  });
}

// --------------------
// Update Notifications
// --------------------
export function useUpdateNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => profileApi.updateNotifications(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Notification settings updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
