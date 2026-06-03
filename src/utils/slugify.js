export const slugify = (str) =>
    str.normalize('NFD')
       .replace(/[̀-ͯ]/g, '')
       .toLowerCase().trim()
       .replace(/[^a-z0-9]+/g, '-')
       .replace(/^-|-$/g, '');
