export const API_URL = import.meta.env.VITE_API_URL;
export const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://mayorista.concoypunto.com';

/**
 * Convierte un path relativo en una URL absoluta del sitio (para canonical/OG).
 * @param {string} path
 * @returns {string}
 */
export function absoluteUrl(path = '/') {
    return new URL(path, SITE_URL).toString();
}
