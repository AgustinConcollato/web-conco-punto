/**
 * Inserta datos estructurados schema.org como <script type="application/ld+json">.
 * Válido en cualquier parte del documento; Google lo lee igual.
 *
 * @param {Object} props
 * @param {Object|Object[]} props.data - Objeto(s) JSON-LD.
 */
export function JsonLd({ data }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
