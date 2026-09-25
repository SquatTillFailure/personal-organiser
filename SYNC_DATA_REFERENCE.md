# Sync Data Reference

This document lists all the data that is automatically synced across devices.

## Data Being Synced

All of the following data is automatically synchronized across all your devices:

### Wardrobe Tab
- ✅ Categories
- ✅ Wardrobe items (all columns: over, tops, bottoms, shoes, accessories)
- ✅ Wishlist items
- ✅ Brand URLs
- ✅ Wishlist URLs
- ✅ Image URLs

### Fit Cards Tab
- ✅ Saved fit cards (over, top, bottom, shoes, notes)

### Grooming Tab
- ✅ All grooming routines (AM, PM, shaving, hair, perfumes, supplements)

### Blueprint Tab
- ✅ Daily mantra
- ✅ Daily intentions
- ✅ Todo content
- ✅ Life Now sections
- ✅ Life Next Year sections
- ✅ Daily reflection answers and history

### Food Tab
- ✅ **Grocery list items** (including checked state)
- ✅ **Weekly meal planner** (all days and meals)
- ✅ Recipes (including descriptions and tags)
- ✅ Inspo notes

### Health Tab
- ✅ Weekly tracker (gym sessions, zone 2 minutes)
- ✅ Weight data (all entries and history)

### AI Assistant Tab
- ✅ AI chat history

## Data NOT Synced

These items are intentionally kept local to each device:

- ❌ Active tab (UI state)
- ❌ Claude API key (security - should be configured per device)
- ❌ Supabase credentials (configured via .env file)

## Database Schema

All synced data is stored in the `user_data` table with these columns:

| Column Name | Data Type | Contains |
|------------|-----------|----------|
| wardrobe_categories | JSONB | Wardrobe categories |
| wardrobe_data | JSONB | Wardrobe items |
| wardrobe_wishlist | JSONB | Wishlist |
| wardrobe_brand_urls | JSONB | Brand URLs |
| wardrobe_wishlist_urls | JSONB | Wishlist URLs |
| wardrobe_image_urls | JSONB | Image URLs |
| fit_cards | JSONB | Saved fit cards |
| grooming_data | JSONB | Grooming routines |
| blueprint_data | JSONB | Blueprint/intentions |
| daily_reflection | JSONB | Daily reflections |
| weekly_tracker | JSONB | Gym/cardio tracking |
| weight_data | JSONB | Weight entries |
| **food_data** | JSONB | **Grocery list & meal planner** |
| todo_notes | JSONB | Todo notes |
| ai_chat_history | JSONB | AI conversations |

## Troubleshooting Sync Issues

### If specific tabs aren't syncing:

1. **Most Common Issue**: Your database table is missing some columns
   - **Solution**: Run the `database_migration.sql` script (see SYNC_SETUP.md)

2. Check the browser console for errors
   - Open Developer Tools → Console
   - Look for red errors related to Supabase or sync

3. Verify your database has all columns:
   - Go to Supabase → Table Editor → user_data
   - Check that all columns from the table above exist

4. Try a manual full sync:
   - Click Sync Settings → Full Sync

## How Sync Works

1. **Immediate Save**: When you make a change, it's saved to localStorage immediately
2. **Debounced Upload**: After 2 seconds, changes are uploaded to Supabase
3. **Polling Download**: Every 10 seconds, the app checks for changes from other devices
4. **Smart Merge**: Only changed data triggers UI updates (no unnecessary re-renders)
