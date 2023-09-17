import { ClientBuilder } from "./client";

const roots = {
  items: "https://items.morabaaapps.com/swagger/v1/swagger.json",
};

const Builder = new ClientBuilder({ roots });

export default Builder;
