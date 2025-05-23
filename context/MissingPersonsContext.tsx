"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { MissingPerson } from "@/lib/api";

interface MissingPersonsContextType {
    missingPersons: MissingPerson[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const MissingPersonsContext = createContext<MissingPersonsContextType>({
    missingPersons: [],
    loading: true,
    error: null,
    refetch: async () => {},
});

export const useMissingPersons = () => useContext(MissingPersonsContext);

export function MissingPersonsProvider({ children }: { children: ReactNode }) {
    const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                "https://v8vxzw8638.execute-api.us-east-1.amazonaws.com/default/get_missingDatabase"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            setMissingPersons(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching missing persons:", err);
            setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <MissingPersonsContext.Provider
            value={{
                missingPersons,
                loading,
                error,
                refetch: fetchData,
            }}
        >
            {children}
        </MissingPersonsContext.Provider>
    );
}
