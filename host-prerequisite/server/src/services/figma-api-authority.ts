import type { Request } from "express";
import type { PluginInvocationScope, WorkerHostCallContext, PluginApiRequestInput } from "@paperclipai/plugin-sdk";
import { forbidden } from "../errors.js";
import type { FigmaProjectAuthority } from "./figma-project-transaction.js";

// Object identity is local to the host. Nothing in either map is serialized.
type Capture = { authority: FigmaProjectAuthority; request: PluginApiRequestInput };
const envelopes = new WeakMap<object, Capture>();
const invocations = new WeakMap<object, Capture & { active: () => boolean }>();

export function captureFigmaApiAuthority(
  envelope: object, actor: Request["actor"], companyId: string, projectId: string | undefined,
): void {
  if (!projectId || !["board", "agent"].includes(actor.type)) return;
  envelopes.set(envelope, { authority: structuredClone({ actor, companyId, projectId }),
    request: structuredClone(envelope) as PluginApiRequestInput });
}

/** Native UI bridge only. Scope selectors remain untrusted until the existing
 * project transaction checks the original board actor. No worker-selected route
 * or actor can become authority; agents use the scoped API/run policy path.
 */
export function captureFigmaUiAuthority(
  envelope: { key: string; params?: unknown }, actor: Request["actor"],
  companyId: string | null | undefined, apiActor: PluginApiRequestInput["actor"],
  method: "getData" | "performAction",
): void {
  if (actor.type !== "board" || !companyId) return;
  const params = envelope.params;
  if (!params || typeof params !== "object" || Array.isArray(params)) return;
  const input = params as Record<string, unknown>;
  if (typeof input.projectId !== "string") return;
  const allowed = method === "getData" ? ["designs.list"] : ["designs.mutate", "designs.verify"];
  if (!allowed.includes(envelope.key)) return;
  const request: PluginApiRequestInput = {
    routeKey: envelope.key, method: method === "getData" ? "GET" : "POST", path: "/",
    params: { projectId: input.projectId, ...(typeof input.designId === "string" ? { designId: input.designId } : {}) },
    query: {}, headers: {}, companyId, actor: apiActor,
    body: envelope.key === "designs.verify" ? { expectedRevision: input.expectedRevision } : input.command ?? null,
  };
  envelopes.set(envelope, { authority: structuredClone({ actor, companyId, projectId: input.projectId }),
    request: structuredClone(request) });
}

export function bindFigmaApiAuthority(
  envelope: unknown, scope: PluginInvocationScope, active: () => boolean,
): void {
  if (!envelope || typeof envelope !== "object") return;
  const captured = envelopes.get(envelope);
  envelopes.delete(envelope); // one host invocation per captured envelope
  if (!captured || captured.authority.companyId !== scope.companyId) return;
  invocations.set(scope, { ...captured, active });
}

export function resolveFigmaApiAuthority(context?: WorkerHostCallContext): {
  authority: FigmaProjectAuthority; request: PluginApiRequestInput; assertActive: () => void;
} {
  const entry = context?.invocationScope && !context.invalidInvocationScope
    ? invocations.get(context.invocationScope) : undefined;
  const assertActive = () => {
    if (!entry?.active()) throw forbidden("Design invocation is unavailable");
  };
  assertActive();
  return { authority: structuredClone(entry!.authority), request: structuredClone(entry!.request), assertActive };
}
