import React, { useRef, useState, useEffect } from "react";
import "./ViewUserProfile.css";
import { auth, db } from "../../../firebase-config";
import { FaAddressBook, FaCheck, FaHeart, FaPlus, FaUser } from "react-icons/fa";
import Poems from "../Poems/Poems";
import { useParams } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { updateDoc, doc, getDoc, getDocs, arrayRemove, arrayUnion, query, collection, where, onSnapshot } from "firebase/firestore";
import Modal from "../../auxiliaries/modal/Modal";
import { CSSTransition } from "react-transition-group";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import LoginModalContent from "../../auxiliaries/login-modal-content/LoginModalContent";


function ViewUserProfile(props) {
    const [currentUser] = useAuthState(auth);
    const modalRefAuth = useRef();
    const [showAuth, setShowAuth] = useState(false);
    const [modalContentAuth, setModalContentAuth] = useState("Sign Up");
    const [imageSrc, setImageSrc] = useState(require('./pfp_yellow.jpg'));
    const inputElement = useRef();
    const navigate = useNavigate();
    const [notInitialLoad, setNotInitialLoad] = useState(false);
    const [userName, setUserName] = useState();
    const [userNameDummy, setUserNameDummy] = useState();
    const [about, setAbout] = useState();
    const [displayData, setDisplayData] = useState();
    const [urlId] = useState(useParams().id || false);
    const [error, setError] = useState();
    const modalRefFollowers = useRef();
    const [showFollowers, setShowFollowers] = useState(false);
    const modalRefFollowing = useRef();
    const [showFollowing, setShowFollowing] = useState(false);
    const [followersArray, setFollowersArray] = useState([]);
    const [followingArray, setFollowingArray] = useState([]);

    onSnapshot(query(collection(db, "users"), where("userName", "==", (urlId ? urlId : currentUser.displayName))),
        (snapShot) => {
            if (!snapShot) return;
            if (!snapShot.docChanges()) return;
            if (!snapShot.docChanges()[0]) return;
            if ((snapShot.docChanges()[0].type === "added" && notInitialLoad) || (snapShot.docChanges().length === 0)) return;
            const resultData = {
                id: snapShot.docs[0].id
                , ...(snapShot.docs[0].data())
            };
            setDisplayData(resultData);
            setNotInitialLoad(true);
            resultData.followersList.forEach((item) => {
                getDoc(doc(db, "users", item)).then((result) => {
                    if (result.data())
                        setFollowersArray(prev => [...prev.filter((item) => item.userName !== result.data().userName), { userName: result.data().userName, pfpUri: result.data().pfpUri }]);
                });
            });
            resultData.followingList.forEach((item) => {
                getDoc(doc(db, "users", item)).then((result) => {
                    if (result.data())
                        setFollowingArray(prev => [...prev, { userName: result.data().userName, pfpUri: result.data().pfpUri }].filter((item, index) => {
                            if (index === 0) return true;
                            if (prev[index - 1].userName === item.userName) return false;
                            return true;
                        }));
                });
            });
            if (!currentUser) return;
            if (resultData.id !== currentUser.email) return;
            setUserName(resultData.userName);
            setUserNameDummy(resultData.userName);
            setImageSrc(resultData.pfpUri);
            setAbout(resultData.about);
        });

    useEffect(() => {
        if (!urlId) return;
        getDocs(query(collection(db, "users"), where("userName", "==", (urlId || currentUser.email)))).then((result) => {
            if (result.docs.length === 0) navigate("/error");
        });
    }, [urlId, currentUser, navigate]);

    useEffect(() => {
        if (!currentUser || (userName === currentUser.userName) || !userName) return;
        (async () => {
            await updateDoc(doc(db, "users", currentUser.email), { userName: userName });
            await updateDoc(doc(db, "dev data", "users"), { usernames: arrayRemove(currentUser.displayName) });
            await updateProfile(currentUser, { displayName: userName });
            await updateDoc(doc(db, "dev data", "users"), { usernames: arrayUnion(userName) });

            const thisPersonsDocData = (await getDoc(doc(db, "users", currentUser.email))).data();
            const thisPersonsPoems = thisPersonsDocData.posts;
            for (let i = 0; i < thisPersonsPoems.length; i++) {
                await updateDoc(doc(db, "haikus", thisPersonsPoems[i]), { authorName: userName });
            }
        })();
    }, [userName, currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        if (!about) return;
        const updateAbout = async () => await updateDoc(doc(db, "users", currentUser.email), { about: about });
        updateAbout();
    }, [about, currentUser]);

    const updatePfp = async (change) => {
        const reader = new FileReader();
        reader.readAsDataURL(change.target.files[0]);
        reader.onload = async (readerLoad) => {
            const readerResult = readerLoad.target.result;
            let image = document.createElement("img");
            image.src = readerResult;
            image.onload = async (imgLoad) => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                if (imgLoad.target.height < imgLoad.target.width) {
                    canvas.width = imgLoad.target.width;
                    canvas.height = imgLoad.target.width;
                    const posFromTop = (imgLoad.target.width - imgLoad.target.height) / 2;
                    context.drawImage(imgLoad.target, 0, posFromTop);
                    const getX = Math.random() * imgLoad.target.width;
                    const getY = (posFromTop + imgLoad.target.height) * Math.random();
                    context.fillStyle = 'rgba(' + context.getImageData(getX, getY, 1, 1).data[0] + ", "
                        + context.getImageData(getX, getY, 1, 1).data[1] + ", "
                        + context.getImageData(getX, getY, 1, 1).data[2] + ", "
                        + context.getImageData(getX, getY, 1, 1).data[3] + ")";
                    context.fillRect(0, 0, canvas.width, posFromTop);
                    context.fillRect(0, canvas.height - posFromTop, canvas.width, posFromTop);
                } else {
                    canvas.width = imgLoad.target.height;
                    canvas.height = imgLoad.target.height;
                    const posFromLeft = (imgLoad.target.height - imgLoad.target.width) / 2;
                    context.drawImage(imgLoad.target, posFromLeft, 0);
                    const getX = (posFromLeft + imgLoad.target.width) * Math.random();
                    const getY = Math.random() * imgLoad.target.height;
                    context.fillStyle = 'rgba(' + context.getImageData(getX, getY, 1, 1).data[0] + ", "
                        + context.getImageData(getX, getY, 1, 1).data[1] + ", "
                        + context.getImageData(getX, getY, 1, 1).data[2] + ", "
                        + context.getImageData(getX, getY, 1, 1).data[3] + ")";
                    context.fillRect(0, 0, posFromLeft, canvas.height);
                    context.fillRect(canvas.width - posFromLeft, 0, posFromLeft, canvas.height);
                }
                const imageDataUri = context.canvas.toDataURL("image/jpeg", 0.5);
                setImageSrc(imageDataUri);
                await updateDoc(doc(db, "users", currentUser.email), { pfpUri: imageDataUri });
                await updateProfile(currentUser, { photoURL: "fetch" });
            }
        };
    }

    const handleUsernameInput = async (input) => {
        setUserNameDummy(input.target.value);
        if (input.target.value.trim() === "") return;
        const match = await getDocs(query(collection(db, "users"),
            where("userName", "==", input.target.value)));
        if ((match.docs.length > 0) && (match.docs[0].data().email !== currentUser.email)) {
            setError("Username taken :(");
            return;
        }
        if (input.target.value.includes(" ") || input.target.value.includes("/")) {
            setError("Username must not contain spaces or slashes.");
            setUserNameDummy(userName);
            return;
        }
        setUserName(input.target.value);
        setError("");
    }

    const addFollower = () => {
        if (!currentUser) {
            setShowAuth(true);
            return;
        }
        if (displayData.followersList.includes(currentUser.email)) {
            (async () => {
                updateDoc(doc(db, "users", displayData.id), { followersList: arrayRemove(currentUser.email) });
                updateDoc(doc(db, "users", currentUser.email), { followingList: arrayRemove(displayData.id) });
            })();
        } else {
            (async () => {
                updateDoc(doc(db, "users", displayData.id), { followersList: arrayUnion(currentUser.email) });
                updateDoc(doc(db, "users", currentUser.email), { followingList: arrayUnion(displayData.id) });
            })();
        }
    }

    useEffect(() => {
    }, [displayData]);

    return (displayData &&
        <>
            <CSSTransition nodeRef={modalRefAuth} in={showAuth} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={modalRefAuth} setShow={setShowAuth}>
                    <LoginModalContent content={modalContentAuth} setModalContent={setModalContentAuth} setShow={setShowAuth} />
                </Modal>
            </CSSTransition>
            <CSSTransition nodeRef={modalRefFollowers} in={showFollowers} timeout={350} classNames="modal" unmountOnExit >
                <Modal passingRef={modalRefFollowers} setShow={setShowFollowers} >
                    <h2>Followers</h2>
                    {/* <br /> */}
                    {followersArray ?
                        followersArray.map((item, index) =>
                            <React.Fragment key={item + index}>
                                <span onClick={() => window.open("/user/" + item.userName)} className="followers-following-data">
                                    <img src={item.pfpUri} alt={item.userName + "'s account (click to navigate)"} />
                                    <p>{item.userName}</p>
                                </span>
                            </React.Fragment>)
                        : <span className="loader yellow"></span>}
                </Modal>
            </CSSTransition>
            <CSSTransition nodeRef={modalRefFollowing} in={showFollowing} timeout={350} classNames="modal" unmountOnExit >
                <Modal passingRef={modalRefFollowing} setShow={setShowFollowing} >
                    <h2>Following</h2>
                    {/* <br /> */}
                    {followingArray ?
                        followingArray.map((item, index) =>
                            <React.Fragment key={item + index}>
                                <span onClick={() => window.open("/user/" + item.userName)} className="followers-following-data">
                                    <img src={item.pfpUri} alt="" />
                                    <p>{item.userName}</p>
                                </span>
                            </React.Fragment>)
                        : <span className="loader yellow"></span>}
                </Modal>
            </CSSTransition>
            <div className="view-user-profile">
                <div className="person-data">
                    <div>
                        {props.contentEditable && <input type="file" ref={inputElement} hidden onChange={updatePfp} />}
                        <img src={props.contentEditable ? imageSrc : displayData.pfpUri} className={"pfp " + (props.contentEditable ? "editable" : "")} onClick={() =>
                            inputElement && inputElement.current.click()
                        } alt={props.contentEditable ? "your profile picture (click to change your profile picture)" : "user's profile picture"} />
                        <br />
                        {(props.contentEditable &&
                            <textarea
                                className="username"
                                rows={1}
                                minLength={3}
                                maxLength={25}
                                onInput={handleUsernameInput}
                                onBlur={() => { setUserNameDummy(userName); setError() }}
                                value={userNameDummy}></textarea>
                        ) || <>
                                <p className="username">{displayData.userName}</p>
                                {(!currentUser) ? <button className="low-green-bg" onClick={addFollower}>
                                    <FaUser /> <FaPlus />
                                </button>
                                    : <button className={(displayData.followersList.includes(currentUser.email)) ? "low-green-bg" : ""} onClick={addFollower}>
                                        <FaUser /> {(displayData.followersList.includes(currentUser.email)) ? <FaCheck /> : <FaPlus />}
                                    </button>}
                            </>}
                        <div className="support-data">
                            <div>
                                <FaHeart /> <p>{displayData ? (displayData.totalLikes || 0) : 0}</p>
                            </div>
                            <div onClick={() => setShowFollowers(true)}>
                                <FaUser /> <p>{displayData ? (displayData.followersList.length || 0) : 0}</p>
                            </div>
                            <div onClick={() => setShowFollowing(true)}>
                                <FaAddressBook /> <p>{displayData ? (displayData.followingList.length || 0) : 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="about">
                        {(props.contentEditable &&
                            <textarea className="editable"
                                rows={3}
                                minLength={1}
                                maxLength={50}
                                onInput={(input) => setAbout(input.target.value)}
                                onBlur={() => !about && setAbout("I like haikus :)")}
                                value={about}></textarea>
                        ) ||
                            <p>{displayData.about}</p>
                        }
                    </div>
                    <p className="toShowError">{error}</p>
                </div>
                <div className="person-posts">
                    {displayData && <div className={"account-saved low-green-solid-bg "}>
                        <Poems filter={(it) => it.authorEmail === displayData.id} />
                    </div>}
                </div>
            </div>
        </>
    )
}

export default ViewUserProfile;