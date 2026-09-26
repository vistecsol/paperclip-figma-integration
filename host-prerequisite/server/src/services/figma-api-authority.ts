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
