import * as vsc from 'vscode'

type CodeUrl = {
  code: string
  delimeter?: string
  url: string
}

let jiraDecorator: vsc.TextEditorDecorationType
const schemas = ['file']
const languages = ['javascript', 'typescript', 'markdown']

export async function activate(context: vsc.ExtensionContext) {
  const jiraTicketLinkProvider = new JiraTicketLinkProvider()
  schemas.forEach((scheme) => {
    languages.forEach((language) => {
      context.subscriptions.push(
        vsc.languages.registerDocumentLinkProvider(
          { scheme, language },
          jiraTicketLinkProvider
        )
      )
    })
  })
}

async function decorate(document: vsc.TextDocument, links: vsc.DocumentLink[]) {
  const decorations = links.map((link) => {
    const range = link.range
    const hoverMessage = link.target!.toString()
    return { range, hoverMessage }
  })
  const editor = vsc.window.visibleTextEditors.find(e => e.document === document)
  if (!editor) return
  try {
    editor.setDecorations(jiraDecorator, decorations)
  } catch (e) { /* ignored for now */ }
}

class JiraTicketLinkProvider implements vsc.DocumentLinkProvider {
  provideDocumentLinks(doc: vsc.TextDocument) {
    const fileName = vsc.window.tabGroups.all[0].tabs.filter(t => t.isActive)[0].label
    if (fileName.includes('(Working Tree)')) return
    if (fileName.includes('Merging: ')) return
    if (fileName.includes('(Untracked)')) return

    const { config } = vsc.workspace.getConfiguration('jira')
    const text = doc.getText()
    const links: vsc.DocumentLink[] = []
    for (const { code, delimeter, url } of config as CodeUrl[]) {
      // Add custom delimeter option (issues/3)
      const regex = new RegExp(`${code}${delimeter ? delimeter : '-'}` + '\\d+', 'g')
      let match: RegExpExecArray | null
      while ((match = regex.exec(text))) {
        const range = new vsc.Range(
          doc.positionAt(match.index),
          doc.positionAt(match.index + match[0].length)
        )
        const target = vsc.Uri.parse(url + match[0])
        links.push(new vsc.DocumentLink(range, target))
      }
    }
    decorate(doc, links)
    return links
  }
}
