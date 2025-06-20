
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface MaidContact {
  id: string;
  name: string;
  phone: string;
  auto_send: boolean;
  send_time: string;
}

export const useMaidContact = () => {
  const [maidContact, setMaidContact] = useState<MaidContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMaidContact = async () => {
      try {
        const { data, error } = await supabase
          .from('maid_contacts')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setMaidContact(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaidContact();
  }, [user]);

  const saveMaidContact = async (phone: string, name: string = 'Maid') => {
    if (!user) return;

    try {
      if (maidContact) {
        // Update existing contact
        const { error } = await supabase
          .from('maid_contacts')
          .update({ phone, name })
          .eq('id', maidContact.id);

        if (error) throw error;
        setMaidContact({ ...maidContact, phone, name });
      } else {
        // Create new contact
        const { data, error } = await supabase
          .from('maid_contacts')
          .insert({
            user_id: user.id,
            phone,
            name,
            auto_send: false,
            send_time: '08:00'
          })
          .select()
          .single();

        if (error) throw error;
        setMaidContact(data);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { maidContact, loading, error, saveMaidContact };
};
