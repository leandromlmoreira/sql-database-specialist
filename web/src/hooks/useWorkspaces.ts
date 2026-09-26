import { useEffect, useState } from "preact/hooks";
import { openWorkspace, refreshSchema, sqliteVersion, type Workspace } from "../lib/engine";
import type { Positions } from "../lib/layout";
import { workspaceSpecs } from "../lib/workspaces";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>({});
  const [positions, setPositions] = useState<Record<string, Positions>>({});
  const [version, setVersion] = useState("");
  const [bootError, setBootError] = useState<string | null>(null);
  const booting = Object.keys(workspaces).length === 0 && !bootError;

  useEffect(() => {
    Promise.all([sqliteVersion(), ...workspaceSpecs.map(openWorkspace)])
      .then(([engineVersion, ...opened]) => {
        setVersion(engineVersion as string);
        const list = opened as Workspace[];
        setWorkspaces(Object.fromEntries(list.map((workspace) => [workspace.spec.id, workspace])));
      })
      .catch((error: unknown) => setBootError(error instanceof Error ? error.message : String(error)));
  }, []);

  const refresh = (id: string) => {
    const current = workspaces[id];
    if (!current) return;
    const next = refreshSchema(current);
    setWorkspaces((all) => ({ ...all, [id]: next }));
  };

  const reset = async (id: string) => {
    const spec = workspaceSpecs.find((item) => item.id === id);
    if (!spec) return;
    const fresh = await openWorkspace(spec);
    setWorkspaces((current) => {
      current[id]?.db.close();
      return { ...current, [id]: fresh };
    });
  };

  const storePositions = (id: string, next: Positions | null) =>
    setPositions((current) => {
      const { [id]: _previous, ...rest } = current;
      return next ? { ...rest, [id]: next } : rest;
    });

  return { workspaces, positions, version, booting, bootError, refresh, reset, storePositions };
}
