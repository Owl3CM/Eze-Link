export type ComponentType = "string" | "number" | "boolean" | "array"; //| "object";

export type TypeProp =
    | {
          type: ComponentType;
          nullable: boolean;
      }
    | {
          type: "array";
          items: {
              $ref: string;
          };
      }
    | {
          type: "string";
          format: "date-time";
      }
    | {
          type: "number";
          formate?: string;
      }
    // | {
    //       type: "object";
    //       properties: TypeProp;
    //   }
    | {
          type: ComponentType;
      }
    | {
          $ref: string;
      };

export type TypeProps = {
    [key: string]: TypeProp;
};
