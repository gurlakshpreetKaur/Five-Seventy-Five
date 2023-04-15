import React, { useEffect, useState } from "react";
import './Poems.css';
import "../../General.css";
import PoemBlock from "../../auxiliaries/PoemBlock/PoemBlock.jsx";

import { auth, db } from "../../../firebase-config";
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { doc, collection } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function Poems(props) {
    const [currentUser] = useAuthState(auth);

    const [userDataLive] = useDocument(currentUser ? doc(db, "users", currentUser.email) : false);

    const [haikuslive] = useCollection(collection(db, "haikus"), { idField: 'id' });
    const [showWhat, setShowWhat] = useState(<span className="loader yellow"></span>);

    const [classToSet, setClassToSet] = useState("nothing-here");

    useEffect(() => {
        if (!haikuslive) return;
        const getAndSetData = async () => {
            let haikus = (haikuslive.docs.map((item) => ({ id: item.id, ...item.data() })));;
            if (props.filter) haikus = haikus.filter(props.filter);
            if (haikus.length > 0) {
                setClassToSet("");
                setShowWhat(haikus.map((item, index) =>
                    <div key={item.id}>
                        <PoemBlock
                            key={item.id + index}
                            id={item.id}
                        />
                    </div>));
                return;
            }
            setClassToSet("nothing-here");
            setShowWhat(<div className="nothing-here">
                <PoemBlock id="devProp_nothingHere" />
            </div>);
        }
        getAndSetData();
    }, [haikuslive, userDataLive]);

    return (
        <section className={"poems " + classToSet}>
            {showWhat}
        </section>
    );
}

export default Poems;