const isEmpty = value => {
  if (value == null) return true // null atau undefined
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false // number, string, boolean ≠ empty
}
module.exports = {
  isEmpty,
}
