import React, { useEffect, useState } from "react";
import "./AccountCompose.css";
import PoemBlock from "../PoemBlock/PoemBlock.jsx";
import { auth, db } from "../../../firebase-config";
import { syllable } from 'syllable'
import { addDoc, collection, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function AccountCompose(props) {
    const [currentUser] = useAuthState(auth);

    const [title, setTitle] = useState("");
    const [firstLine, setFirstLine] = useState("");
    const [secondLine, setSecondLine] = useState("");
    const [thirdLine, setThirdLine] = useState("");
    const [time, setTime] = useState("An Unknown Time");
    const [date, setDate] = useState("An Unknown Day");
    const [error, setError] = useState(["", "", "", ""]);
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const firstLineSplit = firstLine.trim().split(" ");
        let firstLineSyllables = 0;
        for (let i = 0; i < firstLineSplit.length; i++)
            firstLineSyllables += syllable(firstLineSplit[i]);

        const secondLineSplit = secondLine.trim().split(" ");
        let secondLineSyllables = 0;
        for (let i = 0; i < secondLineSplit.length; i++)
            secondLineSyllables += syllable(secondLineSplit[i]);

        const thirdLineSplit = thirdLine.trim().split(" ");
        let thirdLineSyllables = 0;
        for (let i = 0; i < thirdLineSplit.length; i++)
            thirdLineSyllables += syllable(thirdLineSplit[i]);

        if (title.trim().length === 0) setError(prev => ["Your haiku doesn't have a title!", prev[1], prev[2], prev[3]]);
        else setError(prev => ["Nice! You've got a title :)", prev[1], prev[2], prev[3]]);
        if (firstLineSyllables !== 5) setError(prev => [prev[0], "First line has " + firstLineSyllables + ", not 5 syllables. Not a haiku :(", prev[2], prev[3]]);
        else setError(prev => [prev[0], "First line has " + firstLineSyllables + " syllables. That's progress!", prev[2], prev[3]]);
        if (secondLineSyllables !== 7) setError(prev => [prev[0], prev[1], "Second line has " + secondLineSyllables + ", not 7 syllables. Not a haiku :(", prev[3]]);
        else setError(prev => [prev[0], prev[1], "Second line has " + secondLineSyllables + " syllables. Good work!", prev[3]]);
        if (thirdLineSyllables !== 5) setError(prev => [prev[0], prev[1], prev[2], "Third line has " + thirdLineSyllables + ", not 5 syllables. Not a haiku :("]);
        else setError(prev => [prev[0], prev[1], prev[2], "Third line has " + thirdLineSyllables + " syllables. Nice!"]);
        if (firstLineSyllables === 5 && secondLineSyllables === 7 && thirdLineSyllables === 5 && title.trim().length > 0) setError(["Great! That's a haiku, which you can now preview and post :)"]);

    }, [title, firstLine, secondLine, thirdLine]);

    return (<div className="account-compose">
        <br />
        <div>
            {stage === 0 ?
                <PoemBlock
                    id="devProp_404Haiku"
                    contentEditable={true}
                    preventRedirect={true}
                    setTitle={setTitle}
                    setFirstLine={setFirstLine}
                    setSecondLine={setSecondLine}
                    setThirdLine={setThirdLine}
                    setTime={setTime}
                    setDate={setDate}
                    title={title}
                    firstLine={firstLine}
                    secondLine={secondLine}
                    thirdLine={thirdLine}
                    time={time}
                    date={date}
                />
                : stage === 1 ?
                    <PoemBlock
                        id="devProp_404Haiku"
                        title={title}
                        firstLine={firstLine}
                        secondLine={secondLine}
                        thirdLine={thirdLine}
                        haiku={firstLine + "<br>" + secondLine + "<br>" + thirdLine}
                        authorName={currentUser.displayName}
                        time={time}
                        date={date}
                        preventRedirect={true} />
                    :
                    stage === 2 && <span className="loader"></span>
            }

        </div>
        {stage < 2 &&
            <>
                {error.length > 1 && <br />}
                <p className="note">
                    {error.length === 1 ?
                        <><span className="finished">
                            {error[0]}
                        </span><br /></>
                        : error.map((item, index) =>
                            <><span className={((item.charAt(item.length - 1) === "(") || (index === 0 && (item.charAt(item.length - 1) !== ")"))) ? "error" : "finished"}>
                                {item}

                            </span><br /></>)}
                </p>
            </>
        }
        {stage < 2 && error.length === 1 && <>
            <button onClick={async () => {
                setStage(2);
                const result = await addDoc(collection(db, "haikus"), {
                    title: title,
                    haiku: firstLine + "<br>" + secondLine + "<br>" + thirdLine,
                    authorName: currentUser.displayName,
                    authorID: currentUser.uid,
                    authorEmail: currentUser.email,
                    time: time,
                    date: date,
                    likes: 0,
                    bookmarks: 0,
                    likedBy: [],
                    bookmarkedBy: []
                }).catch(console.log);
                await updateDoc(doc(db, "dev data", "poem author list"), { [result.id]: currentUser.email }).catch(console.log);
                await updateDoc(doc(db, "dev data", "author poems list"), { [currentUser.email]: result.id }).catch(console.log);
                await updateDoc(doc(db, "users", currentUser.email), { posts: arrayUnion(result.id) });
                setStage(3);
            }}>I'm Ready to Post</button> <br />
            <button className="low-green-btn" onClick={() =>
                stage === 0 ? setStage(1) : setStage(0)
            }>{stage === 0 ? "Show Me the Preview" : "Back to Composing"}</button>
        </>
        }
        {stage === 3 &&
            <>
                <p className="big-big">🐸</p>
                <span className="note yellow">
                    <p className="finished big">We've successfully posted your haiku!</p>
                </span>
                <br />
                <button className="mid-green-btn important">I want to write another</button>
            </>
        }


    </div>);
}

export default AccountCompose;