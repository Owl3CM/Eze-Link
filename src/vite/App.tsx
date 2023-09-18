import React from "react";
import { ApiService, ClientBuilder } from "../index";
// import TestRoutes from "../test/TestRoutes";
const roots = {
  json: "https://jsonplaceholder.typicode.com",
};
const App = () => {
  const ClientApi = new ClientBuilder({
    storeKey: "test",
    storage: "memoryStorage",
    roots,
  });

  const testLoad = async (clear) => {
    const res = await ClientApi.GET_Cashed({ url: "/todos/1", params: { id: 1 }, clearCash: clear });
    console.log(res);
  };

  return (
    <div className="gap-xl">
      <h1>App</h1>
      <h1
        onClick={() => {
          testLoad(false);
        }}>
        Load
      </h1>
      <h1
        onClick={() => {
          testLoad(true);
        }}>
        Clear
      </h1>
    </div>
  );
  // return <TestRoutes />;
};

export default App;
