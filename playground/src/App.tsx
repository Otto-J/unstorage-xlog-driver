import type {} from "react-dom/canary";
import type {} from "react/canary";

import { useActionState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import Markdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import { Storage, createStorage } from "unstorage";
import { xLogStorageDriver } from "unstorage-xlog-driver";

import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import "uno.css";

interface FormInterface {
  characterId: string;
  key: string;
}

let storage: Storage<string> | null = null;

const LISTENERS = new Set<() => void>();
const DATA_CACHE = new Map<string, string | null>();

async function action(previousFrom: FormInterface, formData: FormData) {
  const characterId = formData.get("characterId")?.toString() ?? "";
  const key = formData.get("key")?.toString() ?? "";
  if (
    (!Number.isNaN(Number(characterId)) &&
      previousFrom.characterId !== characterId) ||
    !storage
  )
    storage = createStorage({
      driver: xLogStorageDriver({
        characterId: Number(characterId),
        ttl: 60 * 60,
      }),
    });
  if (storage)
    DATA_CACHE.set(characterId + ":" + key, await storage.getItem(key));
  return {
    characterId,
    key,
  };
}

function CharacterId() {
  const { pending } = useFormStatus();

  return (
    <div className="flex gap-2">
      <div>
        <label htmlFor="characterId">characterId:</label>
        <input name="characterId" type="text" disabled={pending} />
      </div>
      <div>
        <label htmlFor="key">key:</label>
        <input name="key" type="text" disabled={pending} />
      </div>
      <button type="submit" disabled={pending}>
        提交
      </button>
    </div>
  );
}

function App() {
  const [state, formAction] = useActionState<FormInterface, FormData>(action, {
    characterId: "",
    key: "",
  });

  const data = useSyncExternalStore(
    (listener) => {
      LISTENERS.add(listener);
      return () => {
        LISTENERS.delete(listener);
      };
    },
    () => DATA_CACHE.get(state.characterId + ":" + state.key),
  );

  return (
    <div>
      <form action={formAction}>
        <CharacterId />
      </form>
      <Markdown
        className="prose"
        remarkPlugins={[remarkFrontmatter]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {data}
      </Markdown>
    </div>
  );
}

export default App;
