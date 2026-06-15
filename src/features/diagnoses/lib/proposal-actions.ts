// src/features/diagnoses/lib/proposal-actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface ProposalLineItem {
  title: string;
  description: string;
  price: number;
}

export interface ProposalData {
  id: string;
  potential_id: string | null;
  client_id: string | null;
  title: string;
  description: string; // Stored as stringified JSON: { items: ProposalLineItem[], signature?: { name: string, signedAt: string } }
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function createProposal(input: {
  title: string;
  clientId: string | null;
  potentialId: string | null;
  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  items: ProposalLineItem[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createClient();
    
    const descriptionPayload = JSON.stringify({
      items: input.items,
      signature: null
    });

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        title: input.title.trim(),
        client_id: input.clientId || null,
        potential_id: input.potentialId || null,
        value: input.value,
        status: input.status,
        description: descriptionPayload,
        sent_at: input.status === 'sent' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/studio/teklifler');
    return { success: true, data };
  } catch (err: any) {
    console.error('[createProposal] Error:', err);
    return { success: false, error: err.message || 'Teklif oluşturulamadı.' };
  }
}

export async function getProposalById(id: string): Promise<{ success: boolean; data?: any; client?: any; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data: proposal, error: propError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (propError || !proposal) {
      throw propError || new Error('Teklif bulunamadı.');
    }

    let clientInfo = null;
    
    // Fetch associated client or potential details
    if (proposal.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', proposal.client_id)
        .single();
      if (client) {
        clientInfo = {
          name: client.company_name,
          contact: client.company_name,
          email: client.domain ? `info@${client.domain}` : 'İletişim belirtilmemiş'
        };
      }
    } else if (proposal.potential_id) {
      const { data: potential } = await supabase
        .from('potentials')
        .select('*')
        .eq('id', proposal.potential_id)
        .single();
      if (potential) {
        clientInfo = {
          name: potential.brand_name,
          contact: potential.contact_name,
          email: 'Potansiyel Kayıt'
        };
      }
    }

    return { success: true, data: proposal, client: clientInfo };
  } catch (err: any) {
    console.error('[getProposalById] Error:', err);
    return { success: false, error: err.message || 'Teklif detayları alınamadı.' };
  }
}

export async function acceptProposal(id: string, signatureName: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!signatureName.trim()) {
      return { success: false, error: 'İmza ismi boş olamaz.' };
    }

    const supabase = createClient();
    
    // Fetch current proposal first
    const { data: proposal, error: fetchErr } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !proposal) {
      throw fetchErr || new Error('Teklif bulunamadı.');
    }

    let currentPayload: { items: ProposalLineItem[]; signature: any } = { items: [], signature: null };
    try {
      if (proposal.description) {
        currentPayload = JSON.parse(proposal.description);
      }
    } catch (e) {
      // Fallback if it's text
      currentPayload = {
        items: [{ title: proposal.title, description: proposal.description || '', price: Number(proposal.value) }],
        signature: null
      };
    }

    // Update signature field
    currentPayload.signature = {
      name: signatureName.trim(),
      signedAt: new Date().toISOString()
    } as any;

    const { error: updateErr } = await supabase
      .from('proposals')
      .update({
        status: 'accepted',
        description: JSON.stringify(currentPayload),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    revalidatePath(`/teklif/${id}`);
    revalidatePath('/studio/teklifler');
    return { success: true };
  } catch (err: any) {
    console.error('[acceptProposal] Error:', err);
    return { success: false, error: err.message || 'Teklif onaylanamadı.' };
  }
}
