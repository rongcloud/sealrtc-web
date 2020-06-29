import { CombinedVueInstance } from 'vue/types/vue';

declare global {
  type Root = CombinedVueInstance<Vue, object, object, object, Record<never, any>>;

  const COMMIT_ID: string;

  const DEMO_VERSION: string;

  const RongRTC: {
    Resolution: { [key: string]: string }
  };

  const RongSeal: {
    getDataFromVue: Function | null;
  };
}
