import { useEffect } from 'react'
import { supabase } from './supabaseClient'

/**
 * Custom Hook for Admin Dashboard
 * Listens for new incoming SOS signals in real-time.
 */
export function useAdminRealtime(onNewSOS) {
  useEffect(() => {
    // 1. Create a realtime channel listening to the 'incidents' table
    const channel = supabase
      .channel('admin-sos-notifications')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', // Triggers whenever a new SOS row is added to the database
          schema: 'public', 
          table: 'incidents' 
        },
        (payload) => {
          console.log('New SOS Incident Received:', payload.new)
          if (onNewSOS) {
            onNewSOS(payload.new) // Automatically pushes the new incident data to Person 5's Admin UI
          }
        }
      )
      .subscribe()

    // 2. Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onNewSOS])
}
