import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default?: boolean;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const { user } = useAuth();

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAddresses((data as UserAddress[]) || []);
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (addressData: AddressFormData): Promise<UserAddress | null> => {
    if (!user) {
      toast.error('Please sign in to save addresses');
      return null;
    }

    setIsOperationLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          ...addressData
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newAddress = data as UserAddress;
      await fetchAddresses(); // Refresh to handle default address changes
      toast.success('Address saved successfully');
      return newAddress;
    } catch (err: any) {
      console.error('Error adding address:', err);
      toast.error('Failed to save address');
      return null;
    } finally {
      setIsOperationLoading(false);
    }
  };

  const updateAddress = async (id: string, addressData: Partial<AddressFormData>): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to update addresses');
      return false;
    }

    setIsOperationLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('user_addresses')
        .update(addressData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchAddresses(); // Refresh to handle default address changes
      toast.success('Address updated successfully');
      return true;
    } catch (err: any) {
      console.error('Error updating address:', err);
      toast.error('Failed to update address');
      return false;
    } finally {
      setIsOperationLoading(false);
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to delete addresses');
      return false;
    }

    setIsOperationLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting address:', err);
      toast.error('Failed to delete address');
      return false;
    } finally {
      setIsOperationLoading(false);
    }
  };

  const setDefaultAddress = async (id: string): Promise<boolean> => {
    return updateAddress(id, { is_default: true });
  };

  const getDefaultAddress = (): UserAddress | undefined => {
    return addresses.find(addr => addr.is_default);
  };

  return {
    addresses,
    isLoading,
    error,
    isOperationLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    refetch: fetchAddresses
  };
};