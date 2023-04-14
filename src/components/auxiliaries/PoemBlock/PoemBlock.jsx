import React, { useState, useRef, useEffect } from "react";
import "./PoemBlock.css";
import "../../General.css";
import { FaHeart, FaBookmark, FaShareAlt, FaTrash } from "react-icons/fa";
import { CSSTransition } from "react-transition-group";
import { doc, updateDoc, increment, arrayRemove, arrayUnion, deleteDoc, getDocs, query, collection, where } from "firebase/firestore";
import { db, auth } from "../../../firebase-config";
import { Link } from "react-router-dom";
import Modal from "../modal/Modal";
import LoginModalContent from "../login-modal-content/LoginModalContent";
import { FaClipboard } from "react-icons/fa";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";


function PoemBlock(props) {
    const [currentUser] = useAuthState(auth);

    const [showAuth, setShowAuth] = useState(false);
    const modalRefAuth = useRef(null);
    const [modalContentAuth, setModalContentAuth] = useState("Sign Up");

    const [showShare, setShowShare] = useState(false);
    const modalRefShare = useRef(null);

    const [showDelete, setShowDelete] = useState(false);
    const modalRefDelete = useRef(null);

    const [pauseLike, setPauseLike] = useState(false);
    const [pauseBookmark, setPauseBookmark] = useState(false);

    const [ifShare, setIfShare] = useState("");
    const [idToUse] = useState((props.id ?? "devProp_404Haiku"))
    const shareLink = window.location + "poem/" + idToUse;
    const userDocumentRef = doc(db, "haikus", idToUse);
    const [documentLive] = useDocumentData(userDocumentRef);

    const handleLike = () => {
        if (!currentUser) {
            setShowAuth(true);
            return;
        }
        if (pauseLike || props.contentEditable) return;
        likeThis();
        setPauseLike(true);
    }

    let likeThis = async () => {
        if (!documentLive) return;
        if (documentLive.likedBy.includes(currentUser.email)) {
            await updateDoc(userDocumentRef, { likes: increment(-1), likedBy: arrayRemove(currentUser.email) });
            await updateDoc(doc(db, "users", documentLive.authorEmail), { totalLikes: increment(-1) });
            await updateDoc(doc(db, "users", currentUser.email), { liked: arrayRemove(idToUse) });
        } else {
            await updateDoc(userDocumentRef, { likes: increment(1), likedBy: arrayUnion(currentUser.email) });
            await updateDoc(doc(db, "users", documentLive.authorEmail), { totalLikes: increment(1) });
            await updateDoc(doc(db, "users", currentUser.email), { liked: arrayRemove(idToUse) });
        }
        setPauseLike(false);
    }

    const handleBookmark = () => {
        if (!auth.currentUser) {
            setShowAuth(true);
            return;
        }
        if (pauseBookmark || props.contentEditable) return;
        bookmarkThis();
        setPauseBookmark(true);
    }

    let bookmarkThis = async () => {
        if (!documentLive) return;
        if (documentLive.bookmarkedBy.includes(currentUser.email)) {
            await updateDoc(userDocumentRef, { bookmarks: increment(-1), bookmarkedBy: arrayRemove(currentUser.email) });
            await updateDoc(doc(db, "users", currentUser.email), { bookmarked: arrayRemove(idToUse) });
        } else {
            await updateDoc(userDocumentRef, { bookmarks: increment(1), bookmarkedBy: arrayUnion(currentUser.email) });
            await updateDoc(doc(db, "users", currentUser.email), { bookmarked: arrayUnion(idToUse) });
        }
        setPauseBookmark(false);
    }

    const shareThis = () => {
        if (props.contentEditable) return;
        setShowShare(true)
    }

    useEffect(() => {
        if (!showShare) setTimeout(() => {
            setIfShare("");
        }, 350);
    }, [showShare]);

    const deleteThis = async () => {
        await updateDoc(doc(db, "users", documentLive.authorEmail), { posts: arrayRemove(idToUse), totalLikes: increment((-1 * documentLive.likes)) });
        getDocs(query(collection(db, "users"), where("liked", "array-contains", idToUse))).then((result) => {
            result.forEach(async (item) => {
                updateDoc(doc(db, "users", item.id), { liked: arrayRemove(idToUse) });
            });
        });
        getDocs(query(collection(db, "users"), where("bookmarked", "array-contains", idToUse))).then((result) => {
            result.forEach(async (item) => {
                updateDoc(doc(db, "users", item.id), { bookmarked: arrayRemove(idToUse) });
            });
        });
        await deleteDoc(doc(db, "haikus", idToUse));
    }

    const getFullCurrentDate = () =>
        new Date().getDay() + ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][(new Date().getDay()) % 10] + " " +
        ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][new Date().getMonth()] +
        " " + new Date().getFullYear();

    const getFullCurrentTime = () => new Date().getHours() + ":" + new Date().getMinutes();


    return ((documentLive) ?
        <>
            <CSSTransition nodeRef={modalRefShare} in={showShare} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={modalRefShare} setShow={setShowShare}>
                    <h2>Share</h2>
                    <p className="white small">{ifShare}</p>
                    <input type="text" disabled="true" value={shareLink} className="link white" />
                    <i className="link" onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        setIfShare("Link copied to clipboard!");
                    }}><FaClipboard /></i>
                </Modal>
            </CSSTransition>

            <CSSTransition nodeRef={modalRefAuth} in={showAuth} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={modalRefAuth} setShow={setShowAuth}>
                    <LoginModalContent content={modalContentAuth} setModalContent={setModalContentAuth} setShow={setShowAuth} />
                </Modal>
            </CSSTransition>

            <CSSTransition nodeRef={modalRefDelete} in={showDelete} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={modalRefDelete} setShow={setShowDelete}>
                    <h2>Confirm Delete</h2>
                    <hr />
                    <p className="confirm-delete-text">Are you sure you want to delete '{documentLive.title}'?
                        <br />
                        Once deleted, a post can't be restored, all your likes gained from the post will be lost too.
                    </p>
                    <button className="wine-btn" onClick={deleteThis}>Delete</button>
                </Modal>
            </CSSTransition>

            <article className={"poem-block "} onDoubleClick={handleLike}>
                {currentUser && (currentUser.email === documentLive.authorEmail) && <button className="delete-btn" onClick={async () => {
                    setShowDelete(true);
                }}><FaTrash /></button>}
                <Link to={"/poem/" + idToUse} onClick={click => props.preventRedirect && click.preventDefault()}>
                    {!props.contentEditable ? <h3>{props.title ?? documentLive.title}</h3>
                        : <textarea
                            className="editable-textarea-title"
                            rows={1}
                            onChange={(change) => props.setTitle(change.target.value)}
                            placeholder="My Haiku's Title" value={props.title} />
                    }
                    <hr />
                    <br />
                    {props.contentEditable ?
                        <>
                            <input
                                className="editable-textarea-lines"
                                onChange={(change) => props.setFirstLine(change.target.value)}
                                placeholder="This is my first line"
                                value={props.firstLine}
                            />
                            <br />
                            <input
                                className="editable-textarea-lines"
                                onChange={(change) => props.setSecondLine(change.target.value)}
                                placeholder="And this is my second line"
                                value={props.secondLine}
                            />
                            <br />
                            <input
                                className="editable-textarea-lines"
                                onChange={(change) => props.setThirdLine(change.target.value)}
                                placeholder="Lastly, my third line"
                                value={props.thirdLine}
                            />
                            <br />
                        </>
                        : (props.haiku ?? documentLive.haiku).split("<br>").map((item, index) =>
                            <React.Fragment key={item + index + "frag"}>
                                <span>
                                    {item}
                                </span>
                                <br />
                            </React.Fragment>)}
                    <br />
                </Link>
                <footer className="footer">
                    <div className="support">
                        <span>
                            <span className={"sup-icon " + (currentUser && documentLive.likedBy.includes(currentUser.email) ? "heart-done" : "heart")} onClick={handleLike} >
                                <FaHeart />
                                <p>{documentLive.likes}</p>
                            </span>
                            <br />
                            <span className={"sup-icon " + (currentUser && documentLive.bookmarkedBy.includes(currentUser.email) ? "bookmark-done" : "bookmark")} onClick={handleBookmark}>
                                <FaBookmark />
                                <p>{documentLive.bookmarks}</p>
                            </span>
                            <br />
                            <span className="sup-icon share" onClick={shareThis}>
                                <FaShareAlt />
                            </span>
                        </span>
                    </div>
                    <div className="credits">
                        <p>{props.contentEditable ? currentUser.displayName :
                            props.authorName ??
                            (<Link to={!documentLive.devProp ? ("/user/" + documentLive.authorName) : "/user/Five-Seventy-Five"
                            }>{documentLive.authorName}</Link>)}</p>
                        {props.contentEditable ?
                            <>
                                <p>
                                    <select value={props.time} onChange={(change) => props.setTime(change.target.value)}>
                                        <option value={getFullCurrentTime()}>At {getFullCurrentTime()}</option>
                                        <option value={"An Unknown Time"}>At An Unknown Time</option>
                                    </select>
                                    <br />
                                    <select value={props.date} onChange={(change) => props.setDate(change.target.value)}>
                                        <option value={getFullCurrentDate()}>On {getFullCurrentDate()}</option>
                                        <option value={"An Unknown Day"}>On An Unknown Day</option>
                                    </select>
                                </p>
                                <br />
                            </>
                            :
                            <>
                                <p>At {props.time ?? documentLive.time} <br /> On {props.date ?? documentLive.date}</p>
                                {((((!props.title || props.contentEditable) && !documentLive.devProp) || (props.title && !props.devProp)) && <br />)}
                                {(props.title ? props.devProp : true) && documentLive.devProp && <p><br /><em>Posted by Five-Seventy-Five</em></p>}
                            </>
                        }
                    </div>
                </footer>
            </article>
        </>
        : <></>
    )
}

export default PoemBlock;