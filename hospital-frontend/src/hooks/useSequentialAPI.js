// src/hooks/useSequentialAPI.js
import { useState, useCallback } from 'react';

export const useSequentialAPI = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [progress, setProgress] = useState(0);

    // Thực hiện các API calls tuần tự
    const executeSequential = useCallback(async (apiCalls) => {
        setLoading(true);
        setError(null);
        setResults([]);
        setProgress(0);

        const callResults = [];

        try {
            for (let i = 0; i < apiCalls.length; i++) {
                const { name, apiFunction, params, dependencies } = apiCalls[i];

                // Tạo biến mới để lưu params đã được xử lý
                let processedParams = params;

                // Check dependencies
                if (dependencies) {
                    const dependencyResult = callResults.find(r => r.name === dependencies);
                    if (!dependencyResult || !dependencyResult.success) {
                        throw new Error(`Dependency ${dependencies} failed or not found`);
                    }
                    // Pass dependency data to current call
                    if (typeof params === 'function') {
                        processedParams = params(dependencyResult.data);
                    }
                }

                console.log(`Executing ${name}...`);

                // Thực hiện API call và đợi kết quả
                const result = await apiFunction(processedParams);

                callResults.push({
                    name,
                    data: result.data,
                    success: true,
                    timestamp: new Date().toISOString()
                });

                console.log(`${name} completed successfully`);

                // Cập nhật progress và results
                setProgress(((i + 1) / apiCalls.length) * 100);
                setResults([...callResults]);

                // Optional delay between calls
                if (i < apiCalls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return callResults;

        } catch (err) {
            const errorResult = {
                name: apiCalls[callResults.length]?.name || 'Unknown',
                error: err.response?.data?.message || err.message,
                success: false,
                timestamp: new Date().toISOString()
            };

            callResults.push(errorResult);
            setResults([...callResults]);
            setError(err.response?.data?.message || err.message);

            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Thực hiện batch calls (song song nhưng có giới hạn)
    const executeBatched = useCallback(async (apiCalls, batchSize = 2) => {
        setLoading(true);
        setError(null);
        setResults([]);
        setProgress(0);

        const allResults = [];

        try {
            for (let i = 0; i < apiCalls.length; i += batchSize) {
                const batch = apiCalls.slice(i, i + batchSize);

                const batchPromises = batch.map(async ({ name, apiFunction, params }) => {
                    try {
                        const result = await apiFunction(params);
                        return {
                            name,
                            data: result.data,
                            success: true,
                            timestamp: new Date().toISOString()
                        };
                    } catch (err) {
                        return {
                            name,
                            error: err.response?.data?.message || err.message,
                            success: false,
                            timestamp: new Date().toISOString()
                        };
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                allResults.push(...batchResults);

                setResults([...allResults]);
                setProgress((allResults.length / apiCalls.length) * 100);

                console.log(`Batch ${Math.floor(i / batchSize) + 1} completed`);
            }

            return allResults;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setResults([]);
        setProgress(0);
    }, []);

    return {
        loading,
        error,
        results,
        progress,
        executeSequential,
        executeBatched,
        reset
    };
};
