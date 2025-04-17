import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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

export function Docs() {

  // Inicializa o editor com o conteúdo obtido
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
  });

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div
        className="prose lg:prose-xl bg-white shadow-md p-16 m-20 border"
        style={{ width: '793.7px', height: '1122.5px' }}
      >
        {/* Renderiza o conteúdo do editor */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
