import { useEffect, useState } from 'react';
import { setUser } from '../utils/auth';

const MainWrapper = ({ children }) => {
    // Initialize the 'loading' state variable and set its initial value to 'true'
    const [loading, setLoading] = useState(true);

    // Define a useEffect hook to handle side effects after component mounting
    useEffect(() => {
        // Define an asynchronous function 'handler'
        const handler = async () => {
            try {
                await setUser();
            } catch (error) {
                console.error("MainWrapper auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };
        
        // Call the 'handler' function immediately after the component is mounted
        handler();
    }, []);

    // Render content conditionally based on the 'loading' state
    return <>{loading ? null : children}</>;
};

export default MainWrapper;
