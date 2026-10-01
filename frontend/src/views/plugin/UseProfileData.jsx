import React, { useState, useEffect } from "react";
import apiInstance from "../../utils/axios";
import UserData from "../plugin/UserData";

function UseProfileData() {
    const [profile, setProfile] = useState(null);
    const userData = UserData();

    const fetchProfile = async () => {
        if (!userData?.user_id) return;

        try {
            const res = await apiInstance.get(
                `user/profile/${userData.user_id}/`
            );

            console.log("PROFILE DATA:", res.data);

            setProfile(res.data);

        } catch (error) {
            console.error("Profile fetch error:", error);
        }
    };

    // Initial profile fetch
    useEffect(() => {
        fetchProfile();
    }, [userData?.user_id]);

    // Listen for profile updates
    useEffect(() => {
        const handleProfileUpdate = (event) => {

            // Agar Settings se updated profile mila hai
            if (event.detail) {
                console.log(
                    "UPDATED PROFILE RECEIVED:",
                    event.detail
                );

                setProfile((prev) => ({
                    ...prev,
                    ...event.detail,
                }));
            } else {
                // Fallback: API se dobara fetch
                fetchProfile();
            }
        };

        window.addEventListener(
            "profileUpdated",
            handleProfileUpdate
        );

        return () => {
            window.removeEventListener(
                "profileUpdated",
                handleProfileUpdate
            );
        };

    }, [userData?.user_id]);

    return profile;
}

export default UseProfileData;