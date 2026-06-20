import localforage from 'localforage';
import { supabase } from './supabase';

// Configure localforage instance
export const censusStore = localforage.createInstance({
  name: 'CommunityApp',
  storeName: 'census_records',
  description: 'Offline storage for BYMA census survey data'
});

/**
 * Save a census record locally.
 */
export const saveOfflineRecord = async (record) => {
  try {
    const id = crypto.randomUUID();
    const newRecord = { ...record, id, is_synced: false, created_at: new Date().toISOString() };
    await censusStore.setItem(id, newRecord);
    return newRecord;
  } catch (error) {
    console.error('Failed to save offline record:', error);
    throw error;
  }
};

/**
 * Get all offline (unsynced) records.
 */
export const getOfflineRecords = async () => {
  const records = [];
  try {
    await censusStore.iterate((value, key) => {
      if (!value.is_synced) {
        records.push(value);
      }
    });
    return records;
  } catch (error) {
    console.error('Failed to get offline records:', error);
    return [];
  }
};

/**
 * Sync all local unsynced records to Supabase.
 */
export const syncOfflineRecords = async (userId) => {
  try {
    const unsynced = await getOfflineRecords();
    if (unsynced.length === 0) return 0;

    // Prepare records for Supabase (remove the temporary local 'id' if you want Supabase to generate it, 
    // or keep it if Supabase table allows inserting UUIDs). We'll omit local 'id' to let Supabase generate it.
    const payload = unsynced.map(record => ({
      enumerator_id: userId,
      head_of_family: record.head_of_family,
      address: record.address,
      phone_number: record.phone_number,
      total_members: record.total_members,
      family_details: record.family_details,
      is_synced: true,
      synced_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('census_records').insert(payload);
    
    if (error) throw error;

    // If successful, mark all local records as synced (or delete them to save space)
    for (const record of unsynced) {
      await censusStore.removeItem(record.id);
    }

    return unsynced.length;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};
