/* =====================================================
   ClassCore.ge API Client for stdance.ge Portal
   Fetches real student, subscription, and attendance data
   from the ClassCore Supabase backend.
   ===================================================== */

const CLASSCORE_API = 'https://classcore.ge/api/public/student-portal';
const STUDIO_SLUG = 'stdancestudio';
const CACHE_KEY = 'cc_portal_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SUPABASE_URL = 'https://xnhzqalncwcefnhoqzxe.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuaHpxYWxuY3djZWZuaG9xenhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODU5MjcsImV4cCI6MjA4NzM2MTkyN30.tapUV9nQIYkJif0lS9OQNFSBgIoZLuJhexcmtfj3h48';

/* ── Cache helpers ──────────────────────────────── */
function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore quota errors */ }
}

export function clearCache() {
  sessionStorage.removeItem(CACHE_KEY);
}

/* ── Fetch all studio data from ClassCore ───────── */
export async function fetchStudioData() {
  // Check cache first
  const cached = getCached();
  if (cached) return cached;

  const url = `${CLASSCORE_API}?slug=${STUDIO_SLUG}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`ClassCore API error: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }

  setCache(data);
  return data;
}

/* ── Cloud Syncing Helpers for Tournaments & News ── */
export async function syncTournamentsToCloud(tournaments) {
  try {
    // 1. Get the org_id first by fetching studio settings
    const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
    const getRes = await fetch(settingsUrl, {
      headers: { 'apikey': ANON_KEY }
    });
    if (!getRes.ok) throw new Error('Failed to load studio settings from cloud');
    const settingsList = await getRes.json();
    if (!settingsList || settingsList.length === 0) throw new Error('Studio settings not found on cloud');
    const settings = settingsList[0];
    const orgId = settings.org_id;

    // 2. Patch staff_data with new tournaments list
    const currentStaffData = settings.staff_data || {};
    const updatedStaffData = {
      ...currentStaffData,
      portal_tournaments: tournaments
    };

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?org_id=eq.${orgId}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ staff_data: updatedStaffData })
    });

    if (!patchRes.ok) throw new Error('Failed to sync tournaments to cloud');
    console.log('✅ Tournaments successfully synced to cloud!');
    clearCache();
    return true;
  } catch (err) {
    console.error('❌ Cloud tournament sync error:', err);
    return false;
  }
}

export async function syncNewsToCloud(news) {
  try {
    // 1. Get the org_id first by fetching studio settings
    const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
    const getRes = await fetch(settingsUrl, {
      headers: { 'apikey': ANON_KEY }
    });
    if (!getRes.ok) throw new Error('Failed to load studio settings from cloud');
    const settingsList = await getRes.json();
    if (!settingsList || settingsList.length === 0) throw new Error('Studio settings not found on cloud');
    const settings = settingsList[0];
    const orgId = settings.org_id;

    // 2. Patch staff_data with new news list
    const currentStaffData = settings.staff_data || {};
    const updatedStaffData = {
      ...currentStaffData,
      portal_news: news
    };

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?org_id=eq.${orgId}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ staff_data: updatedStaffData })
    });

    if (!patchRes.ok) throw new Error('Failed to sync news to cloud');
    console.log('✅ News successfully synced to cloud!');
    clearCache();
    return true;
  } catch (err) {
    console.error('❌ Cloud news sync error:', err);
    return false;
  }
}

/* ── Student helpers ────────────────────────────── */

/**
 * Find student by phone number
 * Checks both the student's phone and parent phone in data
 */
export function findStudentByPhone(students, phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 6) return null;

  return students.find(s => {
    // Check main phone
    const mainPhone = (s.phone || '').replace(/\D/g, '');
    if (mainPhone && mainPhone.includes(cleaned)) return true;
    if (cleaned.length >= 9 && mainPhone.endsWith(cleaned.slice(-9))) return true;

    // Check in data.phone
    const dataPhone = (s.data?.phone || '').replace(/\D/g, '');
    if (dataPhone && dataPhone.includes(cleaned)) return true;
    if (cleaned.length >= 9 && dataPhone.endsWith(cleaned.slice(-9))) return true;

    // Check parent phone
    const parentPhone = (s.data?.parent_phone || '').replace(/\D/g, '');
    if (parentPhone && parentPhone.includes(cleaned)) return true;

    return false;
  }) || null;
}

export function findAllStudentsByPhone(students, phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (!cleaned || cleaned.length < 6) return [];

  return students.filter(s => {
    // Check main phone
    const mainPhone = (s.phone || '').replace(/\D/g, '');
    if (mainPhone && mainPhone.includes(cleaned)) return true;
    if (cleaned.length >= 9 && mainPhone.endsWith(cleaned.slice(-9))) return true;

    // Check in data.phone
    const dataPhone = (s.data?.phone || '').replace(/\D/g, '');
    if (dataPhone && dataPhone.includes(cleaned)) return true;
    if (cleaned.length >= 9 && dataPhone.endsWith(cleaned.slice(-9))) return true;

    // Check parent phone
    const parentPhone = (s.data?.parent_phone || '').replace(/\D/g, '');
    if (parentPhone && parentPhone.includes(cleaned)) return true;

    return false;
  });
}

/**
 * Get student display name
 */
export function getStudentName(student) {
  if (!student) return '';
  const fn = student.first_name || student.data?.first_name || '';
  const ln = student.last_name || student.data?.last_name || '';
  return student.full_name || `${fn} ${ln}`.trim() || 'Student';
}

/**
 * Get active subscription for a student
 */
export function getStudentSubscription(subscriptions, studentId) {
  const subs = subscriptions.filter(s => s.student_id === studentId);
  if (subs.length === 0) return null;

  // Prefer active/non-expired subscription
  const active = subs.find(s => {
    const status = s.data?.status || s.status;
    return status === 'active' || !status;
  });

  const sub = active || subs[subs.length - 1];
  const data = sub.data || {};

  return {
    total: sub.sessions_total || data.sessions_total || data.sessionsTotal || 12,
    used: sub.sessions_used || data.sessions_used || data.sessionsUsed || 0,
    plan: data.plan || data.plan_name || data.planName || 'Standard',
    expires: sub.expires_at || data.expires_at || null,
    starts: sub.starts_at || data.starts_at || null,
    status: data.status || sub.status || 'active',
  };
}

/**
 * Get attendance records for a student
 */
export function getStudentAttendance(attendance, studentId) {
  return attendance
    .filter(a => a.student_id === studentId)
    .map(a => ({
      date: a.date || a.data?.date,
      present: (a.data?.status || a.status) === 'present',
      groupId: a.group_id || a.data?.group_id,
      studentName: a.data?.data?.studentName || '',
    }))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

/**
 * Get groups a student belongs to
 */
export function getStudentGroups(groups, student) {
  const enrolledIds = student.data?.enrolled_group_ids;
  if (!Array.isArray(enrolledIds)) return [];
  return groups.filter(g => enrolledIds.includes(g.id || g.data?.id));
}

/**
 * Portal session management
 */
const PORTAL_KEY = 'std_portal_session';

export function savePortalSession(studentId) {
  localStorage.setItem(PORTAL_KEY, studentId);
}

export function getPortalSession() {
  return localStorage.getItem(PORTAL_KEY) || null;
}

export function clearPortalSession() {
  localStorage.removeItem(PORTAL_KEY);
}
