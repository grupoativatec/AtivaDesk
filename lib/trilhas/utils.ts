/**
 * Processa o conteúdo HTML de uma trilha para injetar IDs nos headings (h1-h4)
 * e extrair a lista de headings para o Table of Contents (Timeline).
 */
export function processContentHeadings(content: string = "") {
    const headings: { id: string; title: string; level: number }[] = []
    let counter = 0
    const headingRegex = /<(h[1-4])(.*?)>(.*?)<\/h[1-4]>/gi

    const processedContent = content.replace(headingRegex, (match, tag, attrs, innerContent) => {
        const title = innerContent.replace(/<[^>]*>?/gm, "").trim()
        if (!title) return match // Skip empty headings
        
        const id = `section-${counter++}-${title.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "")}`

        headings.push({
            id,
            title,
            level: parseInt(tag.substring(1))
        })

        return `<${tag}${attrs} id="${id}">${innerContent}</${tag}>`
    })

    return { processedContent, headings }
}
