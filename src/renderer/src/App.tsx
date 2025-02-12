import { useEffect, useState } from "react";

export function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function getMainData() {
      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
        const jsonData = await response.json();
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
