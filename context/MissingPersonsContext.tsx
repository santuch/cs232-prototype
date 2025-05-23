"use client";

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { MissingPerson } from "@/lib/api";
import useSWR, { SWRConfig } from "swr";

const API_URL = "https://v8vxzw8638.execute-api.us-east-1.amazonaws.com/default/get_missingDatabase";

// Custom fetcher with error handling
// Custom API error with additional properties
class ApiError extends Error {
    info: any = null;
    status: number = 0;
    
    constructor(message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    
    if (!response.ok) {
        const error = new ApiError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        error.info = await response.json();
        error.status = response.status;
        throw error;
    }
    
    return response.json();
};

interface MissingPersonsContextType {
    missingPersons: MissingPerson[];
    loading: boolean;         // Initial loading state
    fetching: boolean;        // Subsequent fetching/revalidation state
    error: string | null;
    refetch: () => void;
    isValidating: boolean;
    lastUpdated: Date | null; // Last time data was successfully updated
}

const MissingPersonsContext = createContext<MissingPersonsContextType>({
    missingPersons: [],
    loading: true,
    fetching: false,
    error: null,
    refetch: () => {},
    isValidating: false,
    lastUpdated: null,
});

export const useMissingPersons = () => useContext(MissingPersonsContext);

export function MissingPersonsProvider({ children }: { children: ReactNode }) {
    // Track initial load vs subsequent data fetches
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
    const { 
        data: missingPersons = [], 
        error, 
        isLoading, 
        isValidating, 
        mutate 
    } = useSWR<MissingPerson[]>(API_URL, fetcher, {
        revalidateOnFocus: true,     // Auto revalidate when window gets focused
        revalidateOnReconnect: true, // Auto revalidate when browser regains network connection
        refreshWhenOffline: false,   // Don't refresh when offline
        refreshInterval: 0,          // Disable auto refresh by default (can be enabled if needed)
        shouldRetryOnError: true,    // Auto retry on error
        errorRetryCount: 3,          // Retry 3 times on error
        dedupingInterval: 5000,      // Dedupe requests within 5 seconds
        focusThrottleInterval: 5000, // Throttle focus revalidation
        onSuccess: () => {
            // Update the last successful data fetch timestamp
            setLastUpdated(new Date());
        }
    });

    // Format the error message to be user-friendly
    const errorMessage = error ? "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง" : null;
    
    // Distinguish between initial loading and subsequent data fetches
    // loading: true during initial data load, false afterwards
    // fetching: true during any data loading/revalidation, including initial
    const loading = isLoading;
    const fetching = isValidating;

    return (
        <SWRConfig value={{ 
            provider: () => new Map(), // Enable local cache for better performance
            suspense: false  // Disable suspense mode as we're handling loading states manually
        }}>
            <MissingPersonsContext.Provider
                value={{
                    missingPersons: missingPersons || [],
                    loading,
                    fetching,
                    error: errorMessage,
                    refetch: () => mutate(),
                    isValidating,
                    lastUpdated
                }}
            >
                {children}
            </MissingPersonsContext.Provider>
        </SWRConfig>
    );
}
