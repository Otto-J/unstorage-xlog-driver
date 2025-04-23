import { createStorage } from "unstorage";
import { xLogStorageDriver } from ".";

const storage = createStorage({
  driver: xLogStorageDriver({
    characterId: "23",
  }),
});
