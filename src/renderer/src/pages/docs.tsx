import ReactMarkdown from "react-markdown";

export function Docs() {
  const markdownContent = `> Hello world!`;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Teste de Tela de Documento</h1>
      <div className="prose">
  <ReactMarkdown>{markdownContent}</ReactMarkdown>
</div>

    </div>
  );
}
