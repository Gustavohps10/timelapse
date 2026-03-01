import hljs from 'highlight.js'
import textile from 'textile-js'
import TurndownService from 'turndown'

export class MarkupConverter {
  private constructor() {}

  private static _detectCodeLanguage(codeText: string): string {
    const result = hljs.highlightAuto(codeText)
    const relevanceThreshold = 8
    return result.language && result.relevance > relevanceThreshold
      ? result.language
      : 'plaintext'
  }

  public static fromTextile(
    textileString: string | null | undefined,
    baseUrl: string,
  ): string {
    if (!textileString) return ''

    const startTime = Date.now()
    const traceSnippet =
      textileString.substring(0, 30).replace(/\n/g, ' ') + '...'

    console.log(
      `[MarkupConverter] 🚀 Iniciando conversão: "${traceSnippet}" (Tam: ${textileString.length} chars)`,
    )

    // 1. LIMPEZA NA FONTE
    let processedText = textileString
      .replace(/\u2192/g, '->')
      .replace(/\u00A0/g, ' ')
      .replace(/\r\n/g, '\n')

    // Filtro global de caracteres que costumam quebrar Regex (UTF-8 exótico)
    processedText = processedText.replace(
      /[^\x00-\x7F\u00C0-\u00FF\s\-\*\#\:\(\)\[\]\.\,\?\!\@\%\&\=\+\_\/\\]/g,
      ' ',
    )

    // 2. DISJUNTOR DE SEGURANÇA (CIRCUIT BREAKER)
    // Contamos quantos itens de lista ("- ") existem no texto.
    // O parser textile-js tem complexidade exponencial com listas aninhadas.
    const listMarkers = (processedText.match(/^\s*[\-\*]\s+/gm) || []).length

    if (listMarkers > 40 && processedText.length > 3000) {
      console.warn(
        `[MarkupConverter] 🛑 BLOQUEIO PREVENTIVO (Issue 70323 ou similar): ${listMarkers} itens de lista detectados. Ignorando parser para evitar loop infinito.`,
      )
      return (
        '--- [AVISO: CONTEÚDO COMPLEXO DEMAIS PARA CONVERSÃO] ---\n\n' +
        processedText
      )
    }

    try {
      // 3. PROCESSAMENTO DE BLOCOS <PRE> (Lógica original)
      processedText = processedText.replace(
        /<pre.*?>([\s\S]*?)<\/pre>/g,
        (match, codeContent) => {
          const cleanContent = codeContent
            .replace(/<code.*?>|<\/code>/g, '')
            .trim()
          const language = MarkupConverter._detectCodeLanguage(cleanContent)
          return `\n\`\`\`${language}\n${cleanContent}\n\`\`\`\n`
        },
      )

      // 4. CHAMADA AO PARSER (AQUI É ONDE TRAVAVA)
      console.log(`[MarkupConverter] ⚙️ Chamando parser Textile...`)
      const html = textile(processedText)
      console.log(`[MarkupConverter] ✅ HTML gerado.`)

      // 5. CONVERSÃO HTML -> MARKDOWN
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      })

      turndownService.escape = (str) => str
      let markdown = turndownService.turndown(html)
      markdown = markdown.replace(/\\([*_\[\]])/g, '$1')

      console.log(`[MarkupConverter] ✨ Sucesso em ${Date.now() - startTime}ms`)
      return markdown
    } catch (fatalError) {
      console.error(
        '[MarkupConverter] ❌ Falha catastrófica. Fallback para texto puro.',
        fatalError,
      )
      return processedText
    }
  }
}
