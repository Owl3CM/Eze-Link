import Controller from "./Controller.js";
import { IComponentsProperties, IComponentsSchemas } from "./PathsTypes.js";

export const ExtractSchemaTypes = (schemas: { [key: string]: IComponentsSchemas }) => {
  const generatedTypes: string[] = [];
  Object.entries(schemas).forEach(([key, sch]) => {
    const name = Controller.cleanTypeName(key);
    if (sch.properties) {
      generatedTypes.push(generateType(sch, name));
    } else if (sch.enum) {
      generatedTypes.push(`type ${name} = ${sch.enum.map((e) => `"${e}"`).join(" | ")};\n\n`);
    }
  });

  return generatedTypes;
};

const generateType = (sch: IComponentsSchemas, name: string = "NONE") => {
  let GeneratedType = `type ${name} = {\n`;
  Object.entries(sch.properties).forEach(([key, value]) => {
    GeneratedType += `    ${key}${value.nullable ? "?" : ""}: ${extractType(value)};\n`;
  });
  GeneratedType += "};\n\n";
  return GeneratedType;
};

export const extractType = (schema: IComponentsProperties) => {
  if (!schema) return "any";
  if (schema.$ref) return Controller.cleanTypeName(schema.$ref.split("/")?.pop());
  if (schema.items) return Controller.cleanTypeName(schema.items?.$ref?.split("/")?.pop() + "[]");
  if (schema.type === "integer") return "number";
  return schema.type;
};
