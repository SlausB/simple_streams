"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.macros = void 0;
const ts = require("typescript");
const macro_ts_1 = require("@blainehansen/macro-ts");
exports.macros = {
    stream: macro_ts_1.FunctionMacro((ctx, args) => {
        if (args.length != 3)
            return ctx.TsNodeErr(args, "Incorrect arguments", "stream requires exactly 3 arguments: Space, stream, value");
        const space = args[0];
        const stream = args[1];
        const value = args[2];
        //TODO: additional type checks ...
        return ctx.Ok({
            prepend: [
                ts.createExpressionStatement(ts.createArrowFunction(undefined, undefined, [
                    ts.createParameter(undefined, undefined, undefined, ts.createIdentifier("space"), undefined, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), undefined),
                    ts.createParameter(undefined, undefined, undefined, ts.createIdentifier("stream"), undefined, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), undefined),
                    ts.createParameter(undefined, undefined, undefined, ts.createIdentifier("value"), undefined, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword), undefined)
                ], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.createBlock([
                    ts.createExpressionStatement(ts.createBinary(ts.createElementAccess(ts.createPropertyAccess(ts.createIdentifier("space"), ts.createIdentifier("names")), ts.createIdentifier("stream")), ts.createToken(ts.SyntaxKind.FirstAssignment), ts.createTypeOf(ts.createIdentifier("value"))))
                ], true)))
            ],
            expression: {},
            append: [],
        });
    }),
};
