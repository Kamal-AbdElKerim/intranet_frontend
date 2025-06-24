import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "e14d42b2-4930-4cc6-83bd-87f559f9437d", 
        
        authority: "https://login.microsoftonline.com/consumers", 

        // authority: "https://login.microsoftonline.com/e7235c4c-30ca-469f-be05-feca0303f1f8", 

        redirectUri: "http://localhost:5173/",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        // console.error(message);
                        return;
                    case LogLevel.Info:
                        // console.info(message);
                        return;
                    case LogLevel.Verbose:
                        // console.debug(message);
                        return;
                    case LogLevel.Warning:
                        //  console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: ["User.Read"]
};

export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
}; 