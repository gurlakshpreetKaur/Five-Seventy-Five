import React, { useEffect, useState } from "react";
import "./AccountSaved.css";
import Poems from "../../sections/Poems/Poems.jsx";
import { db, auth } from "../../../firebase-config";
import { getDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function AccountSaved(props) {
    const [component, setComponent] = useState(null);
    const [currentUser] = useAuthState(auth);
    useEffect(() => {
        console.log("ACCOUNT SAVED");
        if (!currentUser) return;
        if (props.type == "liked")
            setComponent(<Poems filter={item => item.likedBy.includes(auth.currentUser.email)} />);
        else if (props.type == "bookmarked")
            setComponent(<Poems filter={item => item.bookmarkedBy.includes(auth.currentUser.email)} />);
        else if (props.type == "posts")
            setComponent(<Poems filter={item => item.authorEmail == auth.currentUser.email} />);
    }, []);
    return (
        <div className={"account-saved low-green-solid-bg " + props.type}>
            {component}
        </div>
    )
}

export default AccountSaved;