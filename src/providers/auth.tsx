import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { useRouter, useSearchParams } from 'expo-router';

const config = {
  GATEWAY_API_ENDPOINT: 'https://t7n4nm7yp1.execute-api.us-east-1.amazonaws.com/qa',
  COGNITO_REGION: 'us-east-1',
  COGNITO_USER_POOL_ID: 'us-east-1_ZLOgvbDEE',
  COGNITO_USER_POOL_WEB_CLIENT_ID: '44g1gnaev6suhscl9h1aur4pjf',
};

export const getCurrentSession = async () => {
  try {
    return await Auth.currentSession();
  } catch (error) {
    return null;
  }
};

export async function signIn(username: string): Promise<CognitoUser> {
  return (await Auth.signIn(username)) as CognitoUser;
}

export async function answerCustomChallenge(user: CognitoUser, code: string): Promise<CognitoUser> {
  return (await Auth.sendCustomChallengeAnswer(user, code)) as CognitoUser;
}

export function getHeadersWithToken(token: string): { headers: { [key: string]: string } } {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export async function getResourceToken(username: string, code: string) {
  const user = await signIn(username);
  await answerCustomChallenge(user, code);
  try {
    const authenticatedUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
    return authenticatedUser?.getSignInUserSession()?.getIdToken().getJwtToken();
  } catch (error) {
    throw new Error(error);
  }
}

export interface IAuthContext {
  headers: { [key: string]: unknown };
  authLoaded: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

// This hook can be used to access the user info.
export function useAuth() {
  return React.useContext(AuthContext);
}

export const AuthContext = React.createContext<IAuthContext>({
  headers: {},
  authLoaded: false,
  isAuthenticated: false,
  sessionExpired: false,
});

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [headers, setHeaders] = useState<{ [key: string]: unknown }>({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

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
    // If the user is authenticated, don't need to auth again
    if (isAuthenticated) {
      return;
    }

    try {
      Amplify.configure({
        Auth: {
          region: config.COGNITO_REGION,
          userPoolId: config.COGNITO_USER_POOL_ID,
          userPoolWebClientId: config.COGNITO_USER_POOL_WEB_CLIENT_ID,
          authenticationFlowType: 'CUSTOM_AUTH',
        },
      });

      if (!isAuthenticated) {
        // Returns current sessions from Cognito if they exist, otherwise throws returns null
        getCurrentSession()
          // Using an async func in .then() ensures we can await inner promises and not let
          // getCurrentSession() run past any required steps
          .then(async (session) => {
            // If we have a session, set the headers and set isAuthenticated to true
            if (session) {
              const headers = getHeadersWithToken(session.getIdToken().getJwtToken());
              setHeaders(headers);
              setIsAuthenticated(true);
            } else {
              const { authCode, animalOwnerSmsNumber } = searchParams;
              // If we have auth code and sms number query params
              if (authCode && animalOwnerSmsNumber) {
                // Run custom auth flow
                const value = (await getResourceToken(animalOwnerSmsNumber, authCode)) as string;
                // Set bearer token for api requests
                const headers = getHeadersWithToken(value);
                setHeaders(headers);
                setIsAuthenticated(true);
              }
            }
          })
          .catch((error) => {
            setIsAuthenticated(false);
            console.log(error);
          })
          .finally(() => {
            // Auth being loaded is a true/false value independent of whether the user is authenticated
            setTimeout(() => {
              // todo: remove this timeout, warning, UI is jerky without it
              setAuthLoaded(true);
            }, 500);
          });
      }
    } catch (e) {
      // AWS Amplify Configuration failed
      setAuthLoaded(true);
      console.error('Something went REALLY wrong.', e);
      // setAuthenticationError(true);
    }
  }, [searchParams, isAuthenticated, headers, router]);

  // Render the children
  return (
    <AuthContext.Provider
      value={{
        headers,
        authLoaded,
        isAuthenticated,
        sessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
