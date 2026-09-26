import { describe, expect, it } from "vitest";
import { figmaDcrCompatibility } from "../services/figma-oauth-compatibility.js";

const official = {
  serverUrl: "https://mcp.figma.com/mcp",
  resource: "https://mcp.figma.com/mcp",
  issuer: "https://api.figma.com",
  authorizationUrl: "https://www.figma.com/oauth/mcp",
  tokenUrl: "https://api.figma.com/v1/oauth/token",
  registrationUrl: "https://api.figma.com/v1/oauth/mcp/register",
};

describe("Figma DCR compatibility boundary", () => {
  it("selects the pinned Hermes metadata for the official endpoint chain", () => {
    expect(figmaDcrCompatibility(official)).toEqual({
      clientName: "Claude Code", tokenEndpointAuthMethod: "client_secret_post",
    });
  });
  for (const key of Object.keys(official) as (keyof typeof official)[]) {
    for (const value of [undefined, "", "https://figma.example/mcp", `${official[key]}?extra=1`, `${official[key]}/`, official[key].replace("https:", "http:"), official[key].replace(".com", ".com.attacker.test"), official[key].replace("https://", "https://user@")]) {
      it(`refuses altered ${key}: ${String(value)}`, () => {
        expect(figmaDcrCompatibility({ ...official, [key]: value })).toBeNull();
      });
    }
  }
});
