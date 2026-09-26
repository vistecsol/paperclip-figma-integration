/**
 * Hermes compatibility only; this metadata is not a claim of vendor endorsement.
 * Keep all credential storage, binding, PKCE and refresh in tool-access.ts.
 */
export function figmaDcrCompatibility(input: {
  serverUrl: unknown;
  issuer?: string | null;
  resource?: string | null;
  authorizationUrl: string;
  tokenUrl: string;
  registrationUrl?: string | null;
}): { clientName: string; tokenEndpointAuthMethod: "client_secret_post" } | null {
  // Exact URLs deliberately exclude lookalikes, alternate ports, query strings,
  // userinfo and servers merely named "Figma". No configurable identity override.
  if (
    input.serverUrl !== "https://mcp.figma.com/mcp" ||
    input.resource !== "https://mcp.figma.com/mcp" ||
    input.issuer !== "https://api.figma.com" ||
    input.authorizationUrl !== "https://www.figma.com/oauth/mcp" ||
    input.tokenUrl !== "https://api.figma.com/v1/oauth/token" ||
    input.registrationUrl !== "https://api.figma.com/v1/oauth/mcp/register"
  ) return null;
  return { clientName: "Claude Code", tokenEndpointAuthMethod: "client_secret_post" };
}
