/**
 * Transliterates Georgian written in Latin characters (Geo-Latin / Georgian-English) into standard Georgian script.
 * Examples:
 * "gamarjoba ra cekvebia" -> "გამარჯობა რა ცეკვებია"
 * "fasi ra aris" -> "ფასი რა არის"
 * "batuimshedia" -> "ბათუმშია"
 */

export function geoLatinToGeorgian(text) {
  if (!text || typeof text !== 'string') return ''

  let str = text.toLowerCase()

  // Replace multi-character combinations first
  const multiMap = [
    { en: 'sh', ka: 'შ' },
    { en: 'ch', ka: 'ჩ' },
    { en: 'ts', ka: 'ც' },
    { en: 'tz', ka: 'ც' },
    { en: 'dz', ka: 'ძ' },
    { en: 'kh', ka: 'ხ' },
    { en: 'gh', ka: 'ღ' },
    { en: 'zh', ka: 'ჟ' },
    { en: 'ck', ka: 'კ' }
  ]

  multiMap.forEach(({ en, ka }) => {
    str = str.split(en).join(ka)
  })

  // Single character map
  const singleMap = {
    a: 'ა', b: 'ბ', g: 'გ', d: 'დ', e: 'ე', v: 'ვ', z: 'ზ',
    t: 'თ', i: 'ი', k: 'კ', l: 'ლ', m: 'მ', n: 'ნ', o: 'ო',
    p: 'პ', r: 'რ', s: 'ს', u: 'უ', f: 'ფ', q: 'ქ', w: 'წ',
    c: 'ც', j: 'ჯ', h: 'ჰ', y: 'ი', x: 'ხ'
  }

  let result = ''
  for (let char of str) {
    result += singleMap[char] || char
  }

  return result
}

/**
 * Checks if input is Georgian written in Latin script
 */
export function isGeoLatinInput(text) {
  if (!text) return false
  const latinRegex = /^[a-zA-Z0-9\s.,?!'\-]+$/
  const geoWords = ['gamarjoba', 'fasi', 'cekva', 'cekvebi', 'rodis', 'sad', 'ra', 'roina', 'misamarti', 'batumi', 'abonementi', 'fasadi', 'gogonebi', 'bichebi', 'ganrigi']
  const lower = text.toLowerCase()
  return latinRegex.test(text) && geoWords.some(w => lower.includes(w))
}
