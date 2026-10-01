import React, { useEffect, useState } from "react";

// This functional component, GetCurrentAddress, is responsible for retrieving and displaying the user's current address based on their geolocation coordinates.

function GetCurrentAddress() {
    const [add, setAdd] = useState(() => {
        try {
            const cached = localStorage.getItem("cached_user_address");
            return cached ? JSON.parse(cached) : { country: "India" };
        } catch (e) {
            return { country: "India" };
        }
    });

    useEffect(() => {
        if (localStorage.getItem("cached_user_address")) {
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude, longitude } = pos.coords;
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2500);

                    fetch(url, { signal: controller.signal })
                        .then(res => res.json())
                        .then(data => {
                            clearTimeout(timeoutId);
                            if (data?.address) {
                                setAdd(data.address);
                                localStorage.setItem("cached_user_address", JSON.stringify(data.address));
                            }
                        })
                        .catch(() => {});
                },
                () => {},
                { timeout: 3000, maximumAge: 86400000 }
            );
        }
    }, []);

    return add;
}

// Export the GetCurrentAddress component for use in other parts of the application.
export default GetCurrentAddress;
