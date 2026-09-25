import { getSupabase } from './supabaseClient';

/**
 * Sync service for managing data synchronization with Supabase
 *
 * Database Schema (to be created in Supabase):
 *
 * CREATE TABLE user_data (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id TEXT UNIQUE NOT NULL,
 *   wardrobe_categories JSONB,
 *   wardrobe_data JSONB,
 *   wardrobe_wishlist JSONB,
 *   wardrobe_brand_urls JSONB,
 *   wardrobe_wishlist_urls JSONB,
 *   wardrobe_image_urls JSONB,
 *   fit_cards JSONB,
 *   grooming_data JSONB,
 *   blueprint_data JSONB,
 *   daily_reflection JSONB,
 *   weekly_tracker JSONB,
 *   weight_data JSONB,
 *   food_data JSONB,
 *   media_data JSONB,
 *   todo_notes JSONB,
 *   network_data JSONB,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_user_data_user_id ON user_data(user_id);
 *
 * -- Enable Row Level Security
 * ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
 *
 * -- Create policy to allow all operations (since we're using user_id as identifier)
 * CREATE POLICY "Allow all operations" ON user_data FOR ALL USING (true);
 */

class SyncService {
  constructor() {
    this.syncInProgress = false;
    this.lastSyncTime = null;
  }

  /**
   * Helper to check if data is "empty" (null, undefined, or object/array with no meaningful content)
   */
  isEmptyData(value) {
    if (!value) return true;
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      // Check if object has any non-empty values
      return Object.values(value).every(v => {
        if (!v) return true;
        if (typeof v === 'string') return v.trim() === '';
        if (typeof v === 'object') return this.isEmptyData(v);
        return false;
      });
    }
    if (typeof value === 'string') return value.trim() === '';
    return false;
  }

  /**
   * Helper to update localStorage only if data has changed
   * Returns true if data was updated, false otherwise
   */
  updateLocalStorageIfChanged(key, newValue) {
    if (!newValue) return false;

    const currentData = localStorage.getItem(key);
    const newData = JSON.stringify(newValue);

    // If data is the same, no update needed
    if (currentData !== newData) {
      // Extra protection: don't overwrite non-empty local data with empty remote data
      if (currentData) {
        try {
          const currentObj = JSON.parse(currentData);
          const isCurrentEmpty = this.isEmptyData(currentObj);
          const isNewEmpty = this.isEmptyData(newValue);

          // If local has content but remote is empty, keep local data
          if (!isCurrentEmpty && isNewEmpty) {
            console.log(`🛡️ Protecting local data for ${key} - remote data is empty`);
            return false;
          }
        } catch (e) {
          // If parsing fails, proceed with update
          console.warn(`Failed to parse local data for ${key}:`, e);
        }
      }

      localStorage.setItem(key, newData);
      return true;
    }
    return false;
  }

  /**
   * Upload all local data to Supabase
   */
  async uploadData(userId) {
    if (!userId) {
      throw new Error('User ID is required for syncing');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    this.syncInProgress = true;

    try {
      // Gather all data from localStorage
      const data = {
        user_id: userId,
        wardrobe_categories: JSON.parse(localStorage.getItem('wardrobe_categories') || 'null'),
        wardrobe_data: JSON.parse(localStorage.getItem('wardrobe_data') || 'null'),
        wardrobe_wishlist: JSON.parse(localStorage.getItem('wardrobe_wishlist') || 'null'),
        wardrobe_brand_urls: JSON.parse(localStorage.getItem('wardrobe_brand_urls') || 'null'),
        wardrobe_wishlist_urls: JSON.parse(localStorage.getItem('wardrobe_wishlist_urls') || 'null'),
        wardrobe_image_urls: JSON.parse(localStorage.getItem('wardrobe_image_urls') || 'null'),
        fit_cards: JSON.parse(localStorage.getItem('fitCards') || 'null'),
        grooming_data: JSON.parse(localStorage.getItem('groomingData') || 'null'),
        blueprint_data: JSON.parse(localStorage.getItem('blueprintData') || 'null'),
        daily_reflection: JSON.parse(localStorage.getItem('dailyReflection') || 'null'),
        weekly_tracker: JSON.parse(localStorage.getItem('weeklyTracker') || 'null'),
        weight_data: JSON.parse(localStorage.getItem('weightData') || 'null'),
        food_data: JSON.parse(localStorage.getItem('foodData') || 'null'),
        media_data: JSON.parse(localStorage.getItem('mediaData') || 'null'),
        todo_notes: JSON.parse(localStorage.getItem('todo_notes') || 'null'),
        network_data: JSON.parse(localStorage.getItem('networkData') || 'null'),
        updated_at: new Date().toISOString()
      };

      // Upsert data (insert or update if exists)
      const { error } = await supabase
        .from('user_data')
        .upsert(data, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      this.lastSyncTime = new Date();
      console.log('✅ Data uploaded successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Download data from Supabase and merge with local data
   */
  async downloadData(userId) {
    if (!userId) {
      throw new Error('User ID is required for syncing');
    }

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    this.syncInProgress = true;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, this is the first sync
          console.log('No remote data found, will upload local data');
          return { success: true, firstSync: true };
        }
        throw error;
      }

      if (data) {
        // Track if any data actually changed
        let hasChanges = false;

        // Update localStorage with remote data using helper
        hasChanges = this.updateLocalStorageIfChanged('wardrobe_categories', data.wardrobe_categories) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('wardrobe_data', data.wardrobe_data) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('wardrobe_wishlist', data.wardrobe_wishlist) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('wardrobe_brand_urls', data.wardrobe_brand_urls) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('wardrobe_wishlist_urls', data.wardrobe_wishlist_urls) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('wardrobe_image_urls', data.wardrobe_image_urls) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('fitCards', data.fit_cards) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('groomingData', data.grooming_data) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('blueprintData', data.blueprint_data) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('dailyReflection', data.daily_reflection) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('weeklyTracker', data.weekly_tracker) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('weightData', data.weight_data) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('foodData', data.food_data) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('mediaData', data.media_data) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('todo_notes', data.todo_notes) || hasChanges;
        hasChanges = this.updateLocalStorageIfChanged('networkData', data.network_data) || hasChanges;

        this.lastSyncTime = new Date();
        console.log('✅ Data downloaded successfully', hasChanges ? '(changes detected)' : '(no changes)');
        return { success: true, hasChanges };
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform a full sync (download then upload to ensure consistency)
   */
  async fullSync(userId) {
    try {
      // First download to get latest data
      const downloadResult = await this.downloadData(userId);

      // If it's the first sync or download succeeded, upload current data
      if (downloadResult.firstSync || downloadResult.success) {
        await this.uploadData(userId);
      }

      return { success: true, hasChanges: downloadResult.hasChanges };
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing() {
    return this.syncInProgress;
  }

  /**
   * Get the last sync time
   */
  getLastSyncTime() {
    return this.lastSyncTime;
  }
}

export const syncService = new SyncService();
