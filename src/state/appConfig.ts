import { create } from 'zustand';

const INIT_CONFIG = {
  API_GATEWAY_ENDPOINT: 'https://t7n4nm7yp1.execute-api.us-east-1.amazonaws.com/qa',
  COGNITO_REGION: 'us-east-1',
  COGNITO_USER_POOL_ID: 'us-east-1_pdZJyLnkU',
  COGNITO_USER_POOL_WEB_CLIENT_ID: '35m0kbcael9s31ps7ptbotm8ar',
};

export interface ApplicationConfig {
  API_GATEWAY_ENDPOINT: string;
  COGNITO_REGION: string;
  COGNITO_USER_POOL_ID: string;
  COGNITO_USER_POOL_WEB_CLIENT_ID: string;
}

export interface Config {
  config: ApplicationConfig | null;
  configError: boolean;
  loadConfig: () => void;
}

export const useAppConfig = create<Config>((set) => ({
  config: null,
  configError: false,
  loadConfig: () => {
    setTimeout(() => {
      set({ config: INIT_CONFIG, configError: false });
    }, 500);
  },
}));
