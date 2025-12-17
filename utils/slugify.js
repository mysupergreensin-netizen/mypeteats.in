export function slugify(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/[\s_-]+/g, '-') // collapse spaces/underscores
    .replace(/^-+|-+$/g, ''); // trim hyphens
}


