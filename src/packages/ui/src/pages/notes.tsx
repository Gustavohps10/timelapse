import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const initialContent = `
        # Título Nível 1
        ## Título Nível 2
        ### Título Nível 3

        > Este é um bloco de citação.

        **Texto em negrito**

        *Texto em itálico*

        [Link Exemplo](https://exemplo.com)

        - Item de lista não ordenada
        1. Item de lista ordenada
      `

export function Notes() {
  // Inicializa o editor com o conteúdo obtido
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
  })

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Anotações</h1>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Workspace</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Anotações</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <hr className="mt-2" />
      <div className="mt-6 flex min-h-screen items-center justify-center">
        <div
          className="prose lg:prose-xl text-foreground m-20 border bg-zinc-50 p-16 shadow-md dark:bg-zinc-900"
          style={{ width: '793.7px', height: '1122.5px' }}
        >
          {/* Renderiza o conteúdo do editor */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  )
}
