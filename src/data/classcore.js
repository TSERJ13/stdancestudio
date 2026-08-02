/* =====================================================
   ClassCore.ge API Client for stdance.ge Portal
   Fetches real student, subscription, and attendance data
   from the ClassCore Supabase backend.
   ===================================================== */

const CLASSCORE_API = 'https://classcore.ge/api/public/student-portal';
const STUDIO_SLUG = 'stdancestudio';
const CACHE_KEY = 'cc_portal_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in-session
const PERSIST_KEY = 'cc_portal_cache_persist'; // localStorage long-term fallback
const FETCH_TIMEOUT_MS = 15000; // 15 second timeout

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lzwdgedxceajhdtijnpv.supabase.co';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2RnZWR4Y2VhamhkdGlqbnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY0MDEsImV4cCI6MjA5NDgwMjQwMX0.-uSzc5DC-xQJ66miZZDaPsGhsPBBDFjGS2VAwd7bTik';

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

function getPersistCache() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const { data } = JSON.parse(raw);
    return data || null;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    const payload = JSON.stringify({ data, ts: Date.now() });
    sessionStorage.setItem(CACHE_KEY, payload);
    // Also persist to localStorage as offline/slow-network fallback
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* ignore quota errors */ }
}

export function clearCache() {
  sessionStorage.removeItem(CACHE_KEY);
  // Keep localStorage persist — it's an offline fallback
}

async function fetchWithTimeout(url, options = {}, ms = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Fetch all studio data from ClassCore & merge custom Supabase data ───────── */
export async function fetchStudioData() {
  // 1. Check in-memory session cache (instant)
  const cached = getCached();
  if (cached) return cached;

  // 2. Check persistent localStorage cache
  const stale = getPersistCache();

  const doFetch = async () => {
    // Fetch ClassCore data with timeout
    const ccUrl = `${CLASSCORE_API}?slug=${STUDIO_SLUG}`;
    const ccRes = await fetchWithTimeout(ccUrl);

    if (!ccRes.ok) throw new Error(`ClassCore API error: ${ccRes.status}`);

    const ccData = await ccRes.json();
    if (ccData.error) throw new Error(ccData.error);

    // Fetch Supabase studio settings with timeout
    let cloudTournaments = [];
    let cloudNews = [];
    let studentLangs = {};

    try {
      const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
      const dbRes = await fetchWithTimeout(settingsUrl, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      if (dbRes.ok) {
        const list = await dbRes.json();
        if (list && list.length > 0) {
          const staffData = list[0].staff_data || {};
          cloudTournaments = staffData.portal_tournaments || [];
          cloudNews = staffData.portal_news || [];
          studentLangs = staffData.student_languages || {};
        }
      }
    } catch (err) {
      console.error('⚠️ Failed to load custom settings from Supabase:', err);
    }

    const mergedStudents = (ccData.students || []).map(s => {
      const cloudLang = studentLangs[s.id] || s.language || s.data?.language || 'ka';
      return {
        ...s,
        language: cloudLang,
        data: { ...(s.data || {}), language: cloudLang }
      };
    });

    const mergedData = {
      ...ccData,
      students: mergedStudents,
      tournaments: cloudTournaments,
      news: cloudNews
    };

    setCache(mergedData);
    return mergedData;
  };

  if (stale) {
    // Return stale data instantly — refresh in background silently
    doFetch().catch(err => console.warn('Background refresh failed:', err));
    return stale;
  }

  // No cache — must fetch (with timeout)
  try {
    return await doFetch();
  } catch (err) {
    // Last resort: return any persisted data even if old
    const lastResort = getPersistCache();
    if (lastResort) {
      console.warn('⚠️ Network error, serving stale cache:', err.message);
      return lastResort;
    }
    throw err;
  }
}

/* ── Cloud Syncing Helpers for Tournaments & News ── */
export async function syncTournamentToCloud(tournament) {
  try {
    // 1. Fetch current settings from new Supabase
    const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
    const getRes = await fetch(settingsUrl, {
      headers: { 
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!getRes.ok) throw new Error('Failed to load studio settings from cloud');
    const settingsList = await getRes.json();
    if (!settingsList || settingsList.length === 0) throw new Error('Studio settings not found on cloud');
    const settings = settingsList[0];

    // 2. Patch staff_data with updated tournament
    const currentStaffData = settings.staff_data || {};
    let cloudTournaments = currentStaffData.portal_tournaments || [];
    
    // Check if tournament exists, update it or add it
    const idx = cloudTournaments.findIndex(t => t.id === tournament.id);
    if (idx >= 0) {
      cloudTournaments[idx] = tournament;
    } else {
      cloudTournaments.push(tournament);
    }

    const updatedStaffData = {
      ...currentStaffData,
      portal_tournaments: cloudTournaments
    };

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ staff_data: updatedStaffData })
    });

    if (!patchRes.ok) throw new Error('Failed to sync tournament to cloud');
    console.log('✅ Tournament successfully synced to cloud!');
    clearCache();
    return true;
  } catch (err) {
    console.error('❌ Cloud tournament sync error:', err);
    return false;
  }
}

export async function deleteTournamentFromCloud(id) {
  try {
    const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
    const getRes = await fetch(settingsUrl, {
      headers: { 
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!getRes.ok) throw new Error('Failed to load studio settings from cloud');
    const settingsList = await getRes.json();
    if (!settingsList || settingsList.length === 0) throw new Error('Studio settings not found on cloud');
    const settings = settingsList[0];

    const currentStaffData = settings.staff_data || {};
    let cloudTournaments = currentStaffData.portal_tournaments || [];
    
    cloudTournaments = cloudTournaments.filter(t => t.id !== id);

    const updatedStaffData = {
      ...currentStaffData,
      portal_tournaments: cloudTournaments
    };

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ staff_data: updatedStaffData })
    });

    if (!patchRes.ok) throw new Error('Failed to delete tournament from cloud');
    console.log('✅ Tournament successfully deleted from cloud!');
    clearCache();
    return true;
  } catch (err) {
    console.error('❌ Cloud tournament delete error:', err);
    return false;
  }
}

export async function syncNewsToCloud(news) {
  try {
    // 1. Fetch current settings from new Supabase
    const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
    const getRes = await fetch(settingsUrl, {
      headers: { 
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!getRes.ok) throw new Error('Failed to load studio settings from cloud');
    const settingsList = await getRes.json();
    if (!settingsList || settingsList.length === 0) throw new Error('Studio settings not found on cloud');
    const settings = settingsList[0];

    // 2. Patch staff_data with new news list
    const currentStaffData = settings.staff_data || {};
    const updatedStaffData = {
      ...currentStaffData,
      portal_news: news
    };

    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
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

export async function syncStudentToCloud(student) {
  try {
    const settingsUrl = `${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`;
    const getRes = await fetch(settingsUrl, {
      headers: { 
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!getRes.ok) throw new Error('Failed to load studio settings');
    const settingsList = await getRes.json();
    if (!settingsList || settingsList.length === 0) throw new Error('Studio settings not found');
    const settings = settingsList[0];
    
    const currentStaffData = settings.staff_data || {};
    const currentLangs = currentStaffData.student_languages || {};
    const updatedStaffData = {
      ...currentStaffData,
      student_languages: {
        ...currentLangs,
        [student.id]: student.language
      }
    };
    
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?studio_slug=eq.${STUDIO_SLUG}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ staff_data: updatedStaffData })
    });
    
    if (!patchRes.ok) throw new Error('Failed to update student language on cloud');
    console.log('✅ Student language successfully synced to cloud!');
    clearCache();
    return true;
  } catch (err) {
    console.error('❌ Cloud student language sync error:', err);
    return false;
  }
}

/* ── GoSMS Integration ────────────────────────────── */
export async function sendSms(toPhone, text) {
  // Format phone: remove spaces, symbols, ensure it starts with 995
  let cleanPhone = toPhone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('995')) {
    if (cleanPhone.startsWith('5')) {
      cleanPhone = '995' + cleanPhone;
    }
  }
  
  const apiKey = '6713cf7fa48a08ffc1e05e2c6e454e4abb2c7f54aad7bf557f14f23894cde991';
  
  try {
    console.log('Sending SMS via GoSMS to:', cleanPhone);
    const response = await fetch('https://api.gosms.ge/api/sendsms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        from: 'stdance',
        to: cleanPhone,
        text: text
      })
    });
    const data = await response.json();
    console.log('✅ GoSMS Response:', data);
    return data;
  } catch (err) {
    console.error('❌ GoSMS Error:', err);
    return null;
  }
}

/* ── Studio Registrations ────────────────────────── */
export async function submitRegistration(regData) {
  try {
    // 1. Send Welcome SMS to parent (async, doesn't block email notification)
    try {
      const welcomeMessage = `მოგესალმებით, გილოცავთ ST Dance Studio-ში წარმატებულ რეგისტრაციას! თქვენი პირადი კაბინეტი უკვე შექმნილია. პორტალზე შესასვლელად ეწვიეთ: stdance.ge/portal და ავტორიზაციისთვის გამოიყენეთ თქვენი ტელეფონის ნომერი.`;
      sendSms(regData.parent_phone, welcomeMessage);
    } catch (smsErr) {
      console.error('Failed to send welcome SMS:', smsErr);
    }

    // 2. Send email notification via FormSubmit directly (bypassing Supabase)
    const emailRes = await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: 'სარეგისტრაციო ფორმა',
        _subject: 'ახალი ონლაინ რეგისტრაცია: ' + regData.student_name,
        "ბავშვის სახელი და გვარი": regData.student_name,
        "დაბადების თარიღი": regData.birth_date,
        "ცვლა": regData.shift,
        "მშობლის სახელი": regData.parent_name,
        "მშობლის ტელეფონი": regData.parent_phone,
        "რეგისტრაციის დრო": new Date().toLocaleString('ka-GE')
      })
    });

    // 3. Track registration in daily analytics engine
    try {
      const { trackAnalyticsRegistration } = await import('../utils/analytics')
      trackAnalyticsRegistration(regData)
    } catch (trackErr) {
      console.log('Analytics registration tracked')
    }

    if (!emailRes.ok) {
      throw new Error('FormSubmit responded with error');
    }

    return true;
  } catch (err) {
    console.error('❌ Direct submitRegistration error (Bypassed Supabase):', err);
    return false;
  }
}

export async function deleteRegistration(id) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete registration');
    return true;
  } catch (err) {
    console.error('❌ Cloud deleteRegistration error:', err);
    return false;
  }
}

export async function fetchRegistrations() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations?order=created_at.desc`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch registrations');
    return await res.json();
  } catch (err) {
    console.error('❌ Cloud fetchRegistrations error:', err);
    return [];
  }
}

export async function updateRegistrationStatus(id, status) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/registrations?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update registration status');
    return true;
  } catch (err) {
    console.error('❌ Cloud updateRegistrationStatus error:', err);
    return false;
  }
}

/* ── Custom Forms & Polls ────────────────────────── */
export async function fetchCustomForms() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/custom_forms?order=created_at.desc`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch custom forms');
    return await res.json();
  } catch (err) {
    console.error('❌ Cloud fetchCustomForms error:', err);
    return [];
  }
}

export async function fetchCustomFormBySlug(slug) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/custom_forms?slug=eq.${slug}`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch custom form');
    const list = await res.json();
    return list && list.length > 0 ? list[0] : null;
  } catch (err) {
    console.error('❌ Cloud fetchCustomFormBySlug error:', err);
    return null;
  }
}

export async function saveCustomForm(form) {
  try {
    const isNew = !form.id;
    const url = isNew 
      ? `${SUPABASE_URL}/rest/v1/custom_forms` 
      : `${SUPABASE_URL}/rest/v1/custom_forms?id=eq.${form.id}`;
      
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    });
    if (!res.ok) throw new Error('Failed to save custom form');
    return true;
  } catch (err) {
    console.error('❌ Cloud saveCustomForm error:', err);
    return false;
  }
}

export async function deleteCustomForm(id) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/custom_forms?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to delete custom form');
    return true;
  } catch (err) {
    console.error('❌ Cloud deleteCustomForm error:', err);
    return false;
  }
}

export async function submitFormAnswer(submission) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submission)
    });
    if (!res.ok) throw new Error('Failed to submit form answers');
    return true;
  } catch (err) {
    console.error('❌ Cloud submitFormAnswer error:', err);
    return false;
  }
}

export async function fetchFormSubmissions(slug) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/form_submissions?form_slug=eq.${slug}&order=created_at.desc`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch form submissions');
    return await res.json();
  } catch (err) {
    console.error('❌ Cloud fetchFormSubmissions error:', err);
    return [];
  }
}

