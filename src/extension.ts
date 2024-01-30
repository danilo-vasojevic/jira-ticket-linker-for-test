import * as vsc from 'vscode'

type CodeUrl = {
  code: string
  url: string
}

let jiraDecorator: vsc.TextEditorDecorationType
const schemas = ['file']
const languages = ['typescript', 'markdown']

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
  const editor = await vsc.window.showTextDocument(document)
  const decorations = links.map((link): vsc.DecorationOptions => {
    const range = link.range
    const hoverMessage = link.target!.toString()
    return { range, hoverMessage }
  })
  editor.setDecorations(jiraDecorator, decorations)
}

class JiraTicketLinkProvider implements vsc.DocumentLinkProvider {
  provideDocumentLinks(doc: vsc.TextDocument) {
    const { config } = vsc.workspace.getConfiguration('jira')
    const text = doc.getText()
    const links: vsc.DocumentLink[] = []
    for (const { code, url } of config as CodeUrl[]) {
      const regex = new RegExp(code + '-\\d+', 'g')
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
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
