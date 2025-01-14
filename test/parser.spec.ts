import { describe, expect, it } from "@jest/globals";
import { JSONSchema7 } from "json-schema";
import {
  AllOfSchema,
  AnyOfSchema,
  ArraySchema,
  ConstSchema,
  EnumSchema,
  MultipleTypesSchema,
  NotSchema,
  ObjectSchema,
  OneOfSchema,
} from "../src/schema-matchers";
import {
  parseAllOf,
  parseAnyOf,
  parseArray,
  parseConst,
  parseEnum,
  parseNot,
  parseObject,
  parseOneOf,
  parseTypeName,
  parseWithMultipleTypes,
} from "../src/schema-to-typebox";
import { expectEqualIgnoreFormatting } from "./util";

describe("parser unit tests", () => {
  describe("parseObject() - when parsing an object schema", () => {
    it("returns Type.Unknown() it the object has no properties", () => {
      const dummySchema: ObjectSchema = {
        type: "object",
        properties: undefined,
      };
      const result = parseObject(dummySchema);
      expect(result).toContain("Type.Unknown");
    });
    it("creates code with attributes for each property", async () => {
      const dummySchema: ObjectSchema = {
        type: "object",
        properties: {
          a: {
            type: "number",
          },
          b: {
            type: "string",
          },
        },
        required: ["b"],
      };
      const result = parseObject(dummySchema);
      const expectedResult = `Type.Object({a: Type.Optional(Type.Number()),\n b: Type.String()})`;
      await expectEqualIgnoreFormatting(result, expectedResult);
    });
    it("works for different attribute naming schemes", async () => {
      const dummySchema: ObjectSchema = {
        type: "object",
        properties: {
          "@prop": {
            type: "string",
          },
          "6": {
            type: "boolean",
          },
          unquoted: {
            type: "number",
          },
          __underscores: {
            type: "string",
          },
          " spaces are weirdly valid ": {
            type: "number",
          },
          "with-hyphen": {
            type: "string",
          },
          $: {
            type: "string",
          },
        },
        required: [
          "@prop",
          "6",
          "unquoted",
          "__underscores",
          " spaces are weirdly valid ",
          "with-hyphen",
          "$",
        ],
      };
      const result = parseObject(dummySchema);
      const expectedResult = `Type.Object({"6": Type.Boolean(),\n "@prop": Type.String(),\n unquoted: Type.Number(),\n __underscores: Type.String(),\n " spaces are weirdly valid ": Type.Number(),\n "with-hyphen": Type.String(),\n $: Type.String()})`;
      await expectEqualIgnoreFormatting(result, expectedResult);
    });
    it("creates code with schemaOptions", async () => {
      const dummySchema: ObjectSchema = {
        $id: "AnyStringHere",
        type: "object",
        properties: {
          a: {
            type: "number",
          },
          b: {
            type: "string",
          },
        },
        required: ["b"],
      };
      const result = parseObject(dummySchema);
      const expectedResult = `Type.Object({a: Type.Optional(Type.Number()),\n b: Type.String()}, { $id: "AnyStringHere" })`;
      await expectEqualIgnoreFormatting(expectedResult, result);
    });
  });

  describe("parseEnum() - when parsing an enum schema", () => {
    it("returns Type.Union()", () => {
      const dummySchema: EnumSchema = {
        title: "Status",
        enum: ["unknown", 1, null],
      };
      const result = parseEnum(dummySchema);
      expect(result).toContain("Type.Union");
    });
    it("creates code with schemaOptions", () => {
      const dummySchema: EnumSchema = {
        $id: "AnyStringHere",
        title: "Status",
        enum: ["unknown", 1, null],
      };
      const result = parseEnum(dummySchema);
      expect(result).toContain("Type.Union");
      expect(result).toContain('{"$id":"AnyStringHere"}');
    });
  });

  describe("parseAnyOf() - when parsing an anyOf schema", () => {
    it("returns Type.Union()", () => {
      const dummySchema: AnyOfSchema = {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      };
      const result = parseAnyOf(dummySchema);
      expect(result).toContain("Type.Union");
    });
    it("creates one type per list of items inside anyOf", () => {
      const dummySchema: AnyOfSchema = {
        anyOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      };
      const result = parseAnyOf(dummySchema);
      expect(result).toContain("Type.String()");
      expect(result).toContain("Type.Number()");
    });
    it("creates code with schemaOptions", () => {
      const dummySchema: AnyOfSchema = {
        $id: "AnyStringHere",
        anyOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      };
      const result = parseAnyOf(dummySchema);
      expect(result).toContain("Type.Union");
      expect(result).toContain('{"$id":"AnyStringHere"}');
    });
  });

  describe("parseAllOf() - when parsing an allOf schema", () => {
    it("returns Type.Intersect()", () => {
      const schema: AllOfSchema = {
        allOf: [
          {
            type: "string",
          },
        ],
      };
      const result = parseAllOf(schema);
      expect(result).toContain("Type.Intersect");
    });
    it("creates one type per list of items inside allOf", () => {
      const schema: AllOfSchema = {
        allOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      };
      const result = parseAllOf(schema);
      expect(result).toContain(`Type.String()`);
      expect(result).toContain(`Type.Number()`);
    });
    it("creates code with schemaOptions", () => {
      const schema: AllOfSchema = {
        $id: "AnyStringHere",
        allOf: [
          {
            type: "string",
          },
        ],
      };
      const result = parseAllOf(schema);
      expect(result).toContain('{"$id":"AnyStringHere"}');
    });
  });

  describe("parseOneOf() - when parsing a oneOf schema", () => {
    it("returns OneOf()", () => {
      const schema: OneOfSchema = {
        oneOf: [
          {
            type: "string",
          },
        ],
      };
      const result = parseOneOf(schema);
      expect(result).toContain(`OneOf`);
    });
    it("creates one type per list of items inside oneOf", () => {
      const schema: OneOfSchema = {
        oneOf: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      };
      const result = parseOneOf(schema);
      expect(result).toContain(`Type.String()`);
      expect(result).toContain(`Type.Number()`);
    });
    it("creates code with schemaOptions", () => {
      const schema: OneOfSchema = {
        $id: "AnyStringHere",
        oneOf: [
          {
            type: "string",
          },
        ],
      };
      const result = parseOneOf(schema);
      expect(result).toContain('{"$id":"AnyStringHere"}');
    });
  });

  describe("parseNot() - when parsing a not schema", () => {
    it("returns Type.Not()", () => {
      const schema: NotSchema = {
        not: {
          type: "number",
        },
      };
      const result = parseNot(schema);
      expect(result).toContain(`Type.Not`);
    });
    it("creates code with schemaOptions", () => {
      const schema: NotSchema = {
        $id: "AnyStringHere",
        not: {
          type: "number",
        },
      };
      const result = parseNot(schema);
      expect(result).toContain('{"$id":"AnyStringHere"}');
    });
  });

  describe("parseArray() - when parsing an array schema", () => {
    describe('when "items" is not a list', () => {
      it("returns Type.Array", () => {
        const schema: ArraySchema = {
          type: "array",
          items: { type: "string" },
        };
        const result = parseArray(schema);
        expect(result).toContain(`Type.Array`);
      });

      it("creates schemaOptions", () => {
        const schema: ArraySchema = {
          type: "array",
          items: { type: "string", description: "test description" },
        };
        const result = parseArray(schema);
        expect(result).toContain(
          JSON.stringify({ description: "test description" })
        );
      });
    });

    describe('when "items" is a list', () => {
      it("creates a Type.Union containing each item", () => {
        const schema: ArraySchema = {
          type: "array",
          items: [{ type: "string" }, { type: "null" }],
        };
        const result = parseArray(schema);
        expect(result).toContain(`Type.Array(Type.Union`);
        expect(result).toContain(`Type.String`);
        expect(result).toContain(`Type.Null`);
      });

      it("creates schemaOptions", () => {
        const schema: ArraySchema = {
          type: "array",
          items: [
            { type: "string", description: "test description" },
            { type: "number", minimum: 1 },
          ],
        };
        const result = parseArray(schema);
        expect(result).toContain(
          JSON.stringify({ description: "test description" })
        );
        expect(result).toContain(JSON.stringify({ minimum: 1 }));
      });
    });

    describe('when "items" is undefined', () => {
      it("returns Type.Array and Type.Unknown", () => {
        const schema: ArraySchema = {
          type: "array",
        };
        const result = parseArray(schema);
        expect(result).toContain(`Type.Array`);
        expect(result).toContain(`Type.Unknown`);
      });

      it("creates schemaOptions", () => {
        const schema: ArraySchema = {
          type: "array",
          description: "test description",
        };
        const result = parseArray(schema);
        expect(result).toContain(
          JSON.stringify({ description: "test description" })
        );
      });
    });
  });

  describe("parseWithMultipleTypes() - when parsing a schema where 'types' is a list", () => {
    it("returns Type.Union()", () => {
      const schema: MultipleTypesSchema = {
        type: ["string"],
      };
      const result = parseWithMultipleTypes(schema);
      expect(result).toContain(`Type.Union`);
    });

    it("creates one type for each type in the list", () => {
      const schema: MultipleTypesSchema = {
        type: ["string", "null"],
      };
      const result = parseWithMultipleTypes(schema);
      expect(result).toContain(`Type.Union`);
      expect(result).toContain(`Type.String`);
      expect(result).toContain(`Type.Null`);
    });

    it("creates union types for nullable objects", async () => {
      const schema: MultipleTypesSchema = {
        type: ["object", "null"],
        properties: {},
      };
      const result = parseWithMultipleTypes(schema);
      await expectEqualIgnoreFormatting(
        result,
        `Type.Union([Type.Object({}), Type.Null()])`
      );
    });

    it("creates union types for nullable arrays", async () => {
      const schema: MultipleTypesSchema = {
        type: ["array", "null"],
        items: { type: "string" },
      };
      const result = parseWithMultipleTypes(schema);
      await expectEqualIgnoreFormatting(
        result,
        `Type.Union([Type.Array(Type.String()),Type.Null()])`
      );
    });
  });

  describe("parseConst() - when parsing a const schema", () => {
    it("returns Type.Literal()", () => {
      const schema: ConstSchema = {
        const: "1",
      };
      const result = parseConst(schema);
      expect(result).toContain(`Type.Literal`);
    });

    it("quotes strings", () => {
      const schema: ConstSchema = {
        const: "1",
      };
      const result = parseConst(schema);
      expect(result).toContain(`"1"`);
    });

    it("does not quote numbers", () => {
      const schema: ConstSchema = {
        const: 1,
      };
      const result = parseConst(schema);
      expect(result).toContain(`1`);
      expect(result).not.toContain(`"1"`);
    });

    it("creates Type.Union() of Type.Literal()s for each item if const is a list", () => {
      const schema: ConstSchema = {
        const: [1, null],
      };
      const result = parseConst(schema);
      expect(result).toContain(`Type.Union`);
      expect(result).toContain(`Type.Literal`);
      expect(result).toContain(`1`);
      expect(result).toContain(`Type.Null`);
    });
  });

  describe('parseTypeName() - when parsing a type name (e.g. "number", "string", "null" ..)', () => {
    it('creates Type.Number for "number"', () => {
      const result = parseTypeName("number");
      expect(result).toEqual(`Type.Number()`);
    });

    it('applies schemaOptions for "number"', () => {
      const schemaOptions: JSONSchema7 = { description: "test description" };
      const result = parseTypeName("number", schemaOptions);
      expect(result).toContain(JSON.stringify(schemaOptions));
    });

    it('creates Type.String for "string"', () => {
      const result = parseTypeName("string");
      expect(result).toEqual(`Type.String()`);
    });

    it('applies schemaOptions for "string"', () => {
      const schemaOptions: JSONSchema7 = { description: "test description" };
      const result = parseTypeName("string", schemaOptions);
      expect(result).toContain(JSON.stringify(schemaOptions));
    });

    it('creates Type.Boolean for "boolean"', () => {
      const result = parseTypeName("boolean");
      expect(result).toEqual(`Type.Boolean()`);
    });

    it('applies schemaOptions for "boolean"', () => {
      const schemaOptions: JSONSchema7 = { description: "test description" };
      const result = parseTypeName("boolean", schemaOptions);
      expect(result).toContain(JSON.stringify(schemaOptions));
    });

    it('creates Type.Null for "null"', () => {
      const result = parseTypeName("null");
      expect(result).toEqual(`Type.Null()`);
    });

    it('applies schemaOptions for "null"', () => {
      const schemaOptions: JSONSchema7 = { description: "test description" };
      const result = parseTypeName("null", schemaOptions);
      expect(result).toContain(JSON.stringify(schemaOptions));
    });
  });
});
