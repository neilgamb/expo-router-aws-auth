import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { CognitoIdToken, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { useRouter, useSearchParams } from 'expo-router';

const config = {
  config: {
    GATEWAY_API_ENDPOINT: 'https://t7n4nm7yp1.execute-api.us-east-1.amazonaws.com/qa',
    COGNITO_REGION: 'us-east-1',
    COGNITO_USER_POOL_ID: 'us-east-1_ZLOgvbDEE',
    COGNITO_USER_POOL_WEB_CLIENT_ID: '44g1gnaev6suhscl9h1aur4pjf',
  },
  configLoaded: true,
  configError: false,
};

export async function getCurrentSession(): Promise<CognitoUserSession> {
  return await Auth.currentSession();
}

export async function signIn(username: string): Promise<CognitoUser> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await Auth.signIn(username);
}

export async function answerCustomChallenge(user: CognitoUser, code: string): Promise<CognitoUser> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await Auth.sendCustomChallengeAnswer(user, code);
}

export async function authenticateUser(username: string, code: string): Promise<CognitoIdToken | undefined> {
  const user = await signIn(username);
  const authenticatedUser = await answerCustomChallenge(user, code);
  return authenticatedUser.getSignInUserSession()?.getIdToken();
}

export function getHeadersWithToken(token: string): { headers: { [key: string]: string } } {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export async function getResourceToken(username: string, code: string): Promise<void> {
  const user = await signIn(username);
  await answerCustomChallenge(user, code);
  try {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    return authenticatedUser.getSignInUserSession().getIdToken().getJwtToken();
  } catch (error) {
    throw new Error(error);
  }
}

export interface IAuthContext {
  headers: { [key: string]: unknown };
  idToken: CognitoIdToken | undefined;
  authLoaded: boolean;
  isAuthenticated: boolean;
  authenticationError: boolean;
  sessionExpired: boolean;
}

// This hook can be used to access the user info.
export function useAuth() {
  return React.useContext(AuthContext);
}

export const AuthContext = React.createContext<IAuthContext>({
  idToken: undefined,
  headers: {},
  authLoaded: false,
  isAuthenticated: false,
  authenticationError: false,
  sessionExpired: false,
});

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticationError, setAuthenticationError] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [headers, setHeaders] = useState<{ [key: string]: unknown }>({});
  const [idToken, setIdToken] = useState<CognitoIdToken | undefined>(undefined);
  const [sessionExpired, setSessionExpired] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // useProtectedRoute(isAuthenticated);

  useEffect(() => {
    const hubListenerCancelToken = Hub.listen('auth', (authMessage) => {
      // AWS Amplify auth status events: https://docs.amplify.aws/lib/auth/auth-events/q/platform/js/
      if (authMessage.payload.event === 'tokenRefresh_failure') {
        setSessionExpired(true);
      }
    });
    return () => {
      hubListenerCancelToken();
    };
  }, []);

  useEffect(() => {
    if (!config.configError && config.configLoaded && config.config) {
      try {
        Amplify.configure({
          Auth: {
            region: config.config.COGNITO_REGION,
            userPoolId: config.config.COGNITO_USER_POOL_ID,
            userPoolWebClientId: config.config.COGNITO_USER_POOL_WEB_CLIENT_ID,
            authenticationFlowType: 'CUSTOM_AUTH',
          },
        });

        if (!isAuthenticated) {
          getCurrentSession()
            .then((authSession) => {
              console.log(authSession);
              if (authSession) {
                // Everything is fine
                setHeaders(getHeadersWithToken(authSession.getIdToken().getJwtToken()));
                setIdToken(authSession.getIdToken());
                setIsAuthenticated(true);
                setAuthLoaded(true);
              }
            })
            .catch(async () => {
              // Should throw when no session exists or is expired.
              const { authCode, animalOwnerSmsNumber } = searchParams;

              if (authCode && animalOwnerSmsNumber) {
                // Run custom auth flow
                const value = await getResourceToken(animalOwnerSmsNumber, authCode);
                console.log(value);
                // Attempt auth
                // const username = `${pimsType}#${orgId}#${subOrgId}#`;
                // authenticateUser(username, authCode)
                //   .then((idToken) => {
                //     if (idToken) {
                //       setIsAuthenticated(true);
                //       setHeaders(getHeadersWithToken(idToken.getJwtToken()));
                //       setIdToken(idToken);
                //       setAuthLoaded(true);
                //       router.setParams({});
                //     } else {
                //       console.error('Authentication failed.');
                //       setAuthenticationError(true);
                //       setAuthLoaded(true);
                //     }
                //   })
                //   .catch((e) => {
                //     // Cognito was configured, but authentication failed.
                //     console.error('Something went wrong.', e);
                //     setAuthenticationError(true);
                //     setAuthLoaded(true);
                //   });
              } else {
                // Don't have required parameters
                console.error('Required parameters not provided.');
                setAuthenticationError(true);
                setAuthLoaded(true);
              }
            });
        }
      } catch (e) {
        // Configuration failed
        setAuthenticationError(true);
        setAuthLoaded(true);
        console.error('Something went REALLY wrong.', e);
      }
    }
  }, [searchParams, isAuthenticated, authenticationError, headers, idToken, router]);

  // Render the children
  return (
    <AuthContext.Provider
      value={{ idToken, headers, authLoaded, isAuthenticated, authenticationError, sessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  );
}
