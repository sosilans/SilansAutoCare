import { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from './_shared/supabase';

// TEMP: Approve all reviews and faqs (for admin recovery)
export const handler: Handler = async () => {
  const supabase = getSupabaseAdmin();
  // Approve all reviews
  await supabase.from('review_submissions').update({ status: 'approved' }).neq('status', 'approved');
  // Approve all faqs
  await supabase.from('faq_submissions').update({ status: 'approved' }).neq('status', 'approved');
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, message: 'All reviews and faqs set to approved.' }),
  };
};
