import { useEffect } from 'react'
import { supabase } from './supabaseClient'

/**
 * Custom Hook for Tourist App
 * Listens for status updates (e.g., ACCEPTED or RESOLVED) on the active SOS incident.
 */
export function useTouristRealtime(incidentId, onStatusChange) {
  useEffect(() => {
    // Do not run if there is no active incident ID yet
    if (!incidentId) return

    // 1. Create a channel for this specific incident
    const channel = supabase
      .channel(`tourist-incident-${incidentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Triggers whenever Police change the status from PENDING -> ACCEPTED -> RESOLVED
          schema: 'public',
          table: 'incidents',
          filter: `id=eq.${incidentId}` // Listens ONLY to this specific tourist's active incident
        },
        (payload) => {
          console.log('Incident status updated to:', payload.new.status)
          if (onStatusChange) {
            onStatusChange(payload.new.status) // Automatically changes Person 4's UI state without a refresh
          }
        }
      )
      .subscribe()

    // 2. Clean up the subscription when the component unmounts or incident ID changes
    return () => {
      supabase.removeChannel(channel)
    }
  }, [incidentId, onStatusChange])
}
