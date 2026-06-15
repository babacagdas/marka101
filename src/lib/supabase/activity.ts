import { createClient } from './client';

export async function logActivity(actionType: string, description: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userName = user.user_metadata?.display_name || user.user_metadata?.name || user.email || 'Ajans Yöneticisi';
    const userEmail = user.email || '';

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_name: userName,
        user_email: userEmail,
        action_type: actionType,
        description: description,
      });

    if (error) {
      console.warn('[logActivity] Warning: activity_logs insert failed', error.message);
    }
  } catch (err) {
    console.error('[logActivity] Error:', err);
  }
}
