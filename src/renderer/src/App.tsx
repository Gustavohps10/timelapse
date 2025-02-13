import { useEffect, useState } from "react";

export function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getMainData() {
      try {
        // Acesse a função fetchRedmine da API exposta
        const jsonData = await window.api.fetchRedmine();  // Corrigido aqui
        setData(jsonData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    getMainData();
  }, []);

  return (
    <div>
      <h1>ATASK</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Carregando...</p>}
    </div>
  );
}
