import * as MockAPI from "./api";
import * as RealAPI from "./realApi";

// ✅ Read persisted mode from localStorage (safe check for SSR)
let useMock: boolean;

if (typeof window !== "undefined") {
    const saved = localStorage.getItem("useMock");
    if (saved === "true" || saved === "false") {
        useMock = saved === "true"; // use saved preference
    } else {
        // default: mock in dev, real in prod
        useMock = process.env.NODE_ENV === "development";
    }
} else {
    // During SSR (Next.js server side)
    useMock = process.env.NODE_ENV === "development";
}

export const getAPI = () => (useMock ? MockAPI : RealAPI);

export const setAPIMode = (mock: boolean) => {
    useMock = mock;
    if (typeof window !== "undefined") {
        localStorage.setItem("useMock", mock.toString());
    }
    console.log(`🔄 Switched to ${mock ? "Mock" : "Real"} API`);
};

export const isMockMode = () => useMock;
