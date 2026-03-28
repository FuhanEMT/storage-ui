// 通用方法集合
export type ParsedBookmarkItem = {
  link: string
  title: string
  icon?: string
}

export type ParsedBookmarkGroup = {
  title: string
  items: ParsedBookmarkItem[]
}

// 谷歌/浏览器书签 HTML -> 分组 + 子项
export function handleGoogleHTMLOrJSON(htmlContent: string): ParsedBookmarkGroup[] {
  const decodeHtml = (text: string) =>
    text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")

  // 过了H3标签的索引位置
  const h3Function = (htmlContentH3: string) => {
    const h3Pattern = /<H3.*?>(.*?)<\/H3>/gi
    let match: RegExpExecArray | null
    const h3Positions: Array<{ index: number; title: string }> = []

    while ((match = h3Pattern.exec(htmlContentH3)) !== null) {
      h3Positions.push({
        index: match.index,
        title: decodeHtml(match[1] || '').trim(),
      })
    }

    return h3Positions
  }

  const findLinks = (htmlContentLinks: string) => {
    const aPattern = /<A HREF="(.*?)".*?>(.*?)<\/A>/gi
    let match: RegExpExecArray | null
    const links: ParsedBookmarkItem[] = []

    while ((match = aPattern.exec(htmlContentLinks)) !== null) {
      links.push({
        link: decodeHtml(match[1] || '').trim(),
        title: decodeHtml(match[2] || '').trim(),
      })
    }

    return links
  }

  const h3Positions = h3Function(htmlContent)

  const groups: ParsedBookmarkGroup[] = []

  for (let i = 0; i < h3Positions.length; i++) {
    const h3 = h3Positions[i]
    if (!h3) continue
    const nextH3 = h3Positions[i + 1]
    const subString = htmlContent.slice(h3.index, nextH3?.index)
    const links = findLinks(subString)
    if (links.length) {
      groups.push({
        title: h3.title,
        items: links,
      })
    }
  }

  return groups
}
