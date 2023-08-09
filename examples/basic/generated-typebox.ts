/**
 * ATTENTION. This code was AUTO GENERATED by schema2typebox.
 * While I don't know your use case, there is a high chance that direct changes
 * to this file get lost. Consider making changes to the underlying JSON schema
 * you use to generate this file instead. The default file is called
 * "schema.json", perhaps have a look there! :]
 */

import { Static, Type } from "@sinclair/typebox";

export type Person = Static<typeof Person>;
export const Person = Type.Object({
  name: Type.String({ minLength: 20 }),
  age: Type.Number({ minimum: 18, maximum: 90 }),
  hobbies: Type.Optional(Type.Array(Type.String(), { minItems: 1 })),
  favoriteAnimal: Type.Optional(
    Type.Union([
      Type.Literal("dog"),
      Type.Literal("cat"),
      Type.Literal("sloth"),
    ])
  ),
});
