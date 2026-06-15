const SITE_NAME = 'Conco y Punto';

/**
 * Metadata por página usando el soporte nativo de React 19
 * (los <title>/<meta>/<link> se hoistean al <head>).
 *
 * @param {Object} props
 * @param {string} [props.title] - Título de la página (sin el sufijo de marca).
 * @param {string} [props.description]
 * @param {string} [props.canonical] - URL absoluta.
 * @param {string} [props.image] - URL absoluta para Open Graph/Twitter.
 * @param {string} [props.type] - og:type (website, product, article...).
 * @param {boolean} [props.noindex]
 */
export function Seo({ title, description, canonical, image, type = 'website', noindex = false }) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    return (
        <>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            {canonical && <link rel="canonical" href={canonical} />}
            <meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow'} />

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="es_AR" />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            {description && <meta property="og:description" content={description} />}
            {canonical && <meta property="og:url" content={canonical} />}
            {image && <meta property="og:image" content={image} />}

            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            {description && <meta name="twitter:description" content={description} />}
            {image && <meta name="twitter:image" content={image} />}
        </>
    );
}
