import hljs from 'highlight.js'
import textile from 'textile-js'
import TurndownService from 'turndown'

/**
 * Uma classe utilitária estática para converter diferentes formatos de
 * linguagem de marcação para um formato padronizado (Markdown).
 */
export class MarkupConverter {
  private constructor() {}

  private static _detectCodeLanguage(codeText: string): string {
    // Deixa o highlight.js fazer a detecção automática
    const result = hljs.highlightAuto(codeText)

    // Usa a linguagem detectada se a confiança for razoável, senão 'plaintext'
    const relevanceThreshold = 8
    if (result.language && result.relevance > relevanceThreshold) {
      return result.language
    }
    return 'plaintext'
  }

  public static fromTextile(
    textileString: string | null | undefined,
    baseUrl: string,
  ): string {
    if (!textileString) {
      return ''
    }

    let processedText = textileString

    processedText = processedText.replace(
      /<pre.*?>([\s\S]*?)<\/pre>/g,
      (match, codeContent) => {
        const cleanContent = codeContent
          .replace(/<code.*?>|<\/code>/g, '')
          .trim()
        const language = MarkupConverter._detectCodeLanguage(cleanContent)

        // Se o highlight.js detectou JSON, nós o formatamos.
        if (language === 'json') {
          try {
            const validJsonString = cleanContent.replace(/”|“|″/g, '"')
            const jsonObject = JSON.parse(validJsonString)
            const prettyJson = JSON.stringify(jsonObject, null, 2)
            // Retorna o JSON formatado com a linguagem correta
            return `\n\`\`\`json\n${prettyJson}\n\`\`\`\n`
          } catch (e) {
            // Se o parse falhar, retorna como texto simples para evitar erros.
            return `\n\`\`\`plaintext\n${cleanContent}\n\`\`\`\n`
          }
        }

        // Para todas as outras linguagens, retorna o conteúdo original com a linguagem detectada.
        return `\n\`\`\`${language}\n${cleanContent}\n\`\`\`\n`
      },
    )

    const html = textile(processedText)

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    })

    if (baseUrl) {
      const cleanBaseUrl = baseUrl.endsWith('/')
        ? baseUrl.slice(0, -1)
        : baseUrl
      turndownService.addRule('redmineImages', {
        filter: 'img',
        replacement: function (content, node) {
          let src = (node as Element).getAttribute('src') || ''
          if (src.startsWith('/')) {
            src = `${cleanBaseUrl}${src}`
          }
          const alt = (node as Element).getAttribute('alt') || ''
          return `![${alt}](${src})`
        },
      })
    }

    turndownService.escape = (str) => str
    let markdown = turndownService.turndown(html)
    markdown = markdown.replace(/\\([*_\[\]])/g, '$1')

    return markdown
  }

  public static fromJiraWiki(
    jiraWikiString: string | null | undefined,
    baseUrl: string,
  ): string {
    if (!jiraWikiString) return ''
    console.warn('Conversão de Jira Wiki ainda não implementada.')
    return jiraWikiString
  }
}
