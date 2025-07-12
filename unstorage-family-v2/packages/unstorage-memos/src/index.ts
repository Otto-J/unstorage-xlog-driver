import { defineDriver, type Driver } from "unstorage";
import {
  baseConfigSchema,
  getList,
  type IGetListOptions,
  type ICommonOptions,
} from "./memos";

export const MemosStorageDriver: (options: ICommonOptions) => Driver = defineDriver((options: ICommonOptions) => {
  const opt = baseConfigSchema.safeParse(options);
  if (!opt.success) {
    throw new Error(opt.error.errors[0].message);
  }

  return {
    name: "memos-custom-driver",
    options,
    async hasItem(key, _opts) {
      return true;
    },
    async getItem(key, _opts) {
      return null;
    },
    // async setItem(key, value, _opts) {},
    // async removeItem(key, _opts) {},
    async getKeys(base, opt) {
      opt = opt as IGetListOptions;
      // console.log(222, opt);
      const res = await getList({ ...options, ...(opt as IGetListOptions) });

      return res;
    },
    // async clear(base, _opts) {},
    // async dispose() {},
    // async watch(callback) {},
  };
});
