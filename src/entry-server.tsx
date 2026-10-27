import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export function render(url: string, initialData?: any) {
  return renderToString(
    <App
      initialData={initialData}
      RouterComponent={StaticRouter}
      routerProps={{ location: url }}
    />
  );
}
