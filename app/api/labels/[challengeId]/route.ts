import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) {
  try {
    const { challengeId } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('challenge_labels')
      .select('*')
      .eq('challenge_id', challengeId)

    if (error) {
      // If table doesn't exist, return empty labels (use defaults)
      // This allows the app to work before migrations are applied
      if (error.code === 'PGRST205') {
        return NextResponse.json({ labels: [] })
      }
      console.error('Error fetching labels:', error)
      return NextResponse.json({ labels: [] })
    }

    return NextResponse.json({ labels: data || [] })
  } catch (err) {
    // Return empty labels on any error to allow defaults
    return NextResponse.json({ labels: [] })
  }
}
