import { MarkdownEditor as RunOSMarkdownEditor } from '@runos/editor-markdown'
import type { MarkdownEditorProps } from '@runos/editor-markdown'

export function MarkdownEditor(props: MarkdownEditorProps) {
  return <RunOSMarkdownEditor {...props} />
}
export type { MarkdownEditorProps }
