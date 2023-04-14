import React, { useEffect, useState } from "react";
import "./Poem.css";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase-config";
import PoemBlock from "../../auxiliaries/PoemBlock/PoemBlock";

function Poem(props) {
    const { id } = useParams();
    const [idToUse, setIdToUse] = useState(id);
    useEffect(() => {
        (async () => {
            try {
                const docData = (await getDoc(doc(db, "haikus", id))).data();
                if (!docData) setIdToUse("devProp_404Haiku");
            } catch {
                setIdToUse("devProp_404Haiku");
            }
        })();
    }, [id]);

    return (
        <section className="poem">
            <div className="centered-div">
                <PoemBlock id={idToUse} />
                {(!id) && <p>This page is a dead end, the URL you entered is invalid :(
                    <br /><br />Enjoy this 404 haiku in the meanwhile! (sarcasm)</p>}
            </div>
        </section>
    );
}

export default Poem;