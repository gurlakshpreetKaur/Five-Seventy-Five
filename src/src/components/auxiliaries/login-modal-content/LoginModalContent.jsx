import React, { useEffect, useState } from "react";

import { auth, db } from "../../../firebase-config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc, getDocs, query, collection, where } from "firebase/firestore";
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

import "../../General.css";

import "./loginModalContent.css";

function LoginModalContent(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userName, setuserName] = useState("");
    const [stage, setStage] = useState(0);
    const [contentsToDisplay, setContentsToDisplay] = useState(null);

    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(error);
    }, [error]);

    // useEffect(() => {
    // console.log(stage, "IS THE STAGE", props.content);
    // }, [stage]);

    useEffect(() => {
        if (stage == 0 && props.content == "Log In") {
            setContentsToDisplay(
                <>
                    <input placeholder="Enter your email..." type="email" onChange={change => { setEmail(change.target.value); }} value={email} />
                    <input placeholder="Enter your password..." type="password" onChange={change => setPassword(change.target.value)} value={password} />

                    <br />
                    <p className={error && error.charAt(error.length - 1) == "!" ? "toShowError mid-green" : "toShowError"}>{error}</p>
                    <button className="highlight-btn" onClick={async () => {
                        if (email.trim() == "") {
                            setError("You need to enter an email, so that we can send you a password reset email :)");
                            return;
                        }
                        try {
                            await sendPasswordResetEmail(auth, email);
                            setError("Successfully sent password resent email!");
                        } catch (error) {
                            console.log(error.code)
                            switch (error.code) {
                                case "auth/invalid-email": setError("The email is invalid, enter a valid email"); break;
                                case "auth/user-not-found": setError("Account does not exist (yet), sign up first :)"); break;
                                case "auth/too-many-requests": setError("We've received too many requests from your device, please try again later. 🤖🧑‍💻"); break;
                                case "auth/internal-error": setError("There was an internal error, please try again later :("); break;
                                default: setError("There was an error. Please try again later or report the error via email."); break;
                            }
                        }

                    }}>
                        Forgot My Password :(
                    </button>
                    <br />
                    <button onClick={async click => {
                        setStage(1);
                        const emailTrim = email.trim();
                        try {
                            const signedInUser = await signInWithEmailAndPassword(auth, emailTrim, password);
                            if (signedInUser.user.emailVerified) {
                                window.location = "/account";
                                return;
                            }
                            await sendEmailVerification(signedInUser);
                            auth.signOut();
                            throw ({ code: "auth/email-not-verified" });
                        } catch (error) {
                            console.log("CAUGHT ERR", error);
                            switch (error.message) {
                                case "auth/email-not-verified": setError("You must verify your email before logging in, check your inbox :)"); break;
                                case "auth/user-not-found": setError("Account does not exist (yet), sign up first :)"); break;
                                case "auth/wrong-password": setError("That's the wrong password :|"); break;
                                case "auth/too-many-requests": setError("We've received too many requests from your device, please try again later. 🤖🧑‍💻"); break;
                                case "auth/internal-error": setError("There was an internal error, please try again later :("); break;
                                default: setError("There was an error. Please try again later or report the error via email."); break;
                            }
                            setStage(0);
                        }
                    }}>Login</button>
                    <br />
                    <button className="highlight-btn" onClick={click => {
                        props.setShow(false);
                        setTimeout(() => {
                            setEmail("");
                            setPassword("");
                            props.setModalContent("Sign Up");
                            props.setShow(true);
                        }, 1000);
                    }}>Sign Up Instead</button>
                </>);
        } else if (stage == 0 && props.content == "Sign Up") {
            setContentsToDisplay(
                <>
                    <input placeholder="Enter a username..." type="text" onChange={change => setuserName(change.target.value)} value={userName} />
                    <input placeholder="Enter your email..." type="email" onChange={change => setEmail(change.target.value)} value={email} />
                    <input placeholder="Enter your password..." type="password" onChange={change => setPassword(change.target.value)} value={password} />
                    <input placeholder="Confirm password..." type="password" onChange={change => setConfirmPassword(change.target.value)} value={confirmPassword} />
                    <br />
                    {error ? <p className={error && error.charAt(error.length - 1) == ")" ? "toShowError mid-green" : "toShowError"}>{error}</p> : <p className="gen-mess">By signing up, you consent to our use of your above entered information, and that you are older than or 13 years old.</p>}
                    <button onClick={async click => {
                        console.log("about to sign up");
                        const emailTrim = email.trim();
                        const userNameTrim = userName.trim();
                        const userNamesMatch = await getDocs(query(collection(db, "users"), where("userName", "==", userNameTrim)));
                        setStage(1);
                        try {
                            if (!userName) throw { code: "auth/null-username" };
                            if (userNamesMatch.docs.length > 0) throw { code: "auth/username-taken" };
                            if (userNameTrim.includes(" ") || userNameTrim.includes("/")) throw { code: "auth/invalid-username" };
                            if (emailTrim == "") throw { code: "auth/invalid-email" };
                            if (password != confirmPassword) throw { code: "auth/passwords-dont-match" };
                            console.log("passed tests");
                            const avatar = createAvatar(identicon, {
                                seed: userNameTrim,
                                backgroundColor: ["d1d4f9", "b6e3f4", "fdfd96", "fdca96", "96fdca", "fdca96", "96fdfd", "fd96c9"],
                                rowColor: ["00acc1", "1e88e5", "5e35b1"]
                            });
                            const svg = avatar.toDataUriSync();
                            await createUserWithEmailAndPassword(auth, emailTrim, password);
                            await sendEmailVerification(auth.currentUser);
                            setError("A verification email has been sent, check your inbox :)");
                            setStage(0);
                            await updateProfile(auth.currentUser, { displayName: userNameTrim, photoURL: svg });
                            await setDoc(doc(db, "users", emailTrim), {
                                email: emailTrim,
                                userName: userNameTrim,
                                liked: [],
                                bookmarked: [],
                                pfpUri: svg,
                                totalLikes: 0,
                                followers: 0,
                                followersList: [],
                                about: "I like haikus :)",
                                followingList: [],
                                posts: []
                            });
                            auth.signOut();
                        } catch (error) {
                            console.log(JSON.stringify(error), error.code);
                            switch (error.code) {
                                case "auth/email-aready-exists": setError("Email is already signed up! Try logging in."); break;
                                case "auth/email-already-in-use": setError("Email is already signed up! Try logging in."); break;
                                case "auth/internal-error": setError("There was an internal error, please try again later :("); break;
                                case "auth/invalid-email": setError("That's an invalid email!"); break;
                                case "auth/invalid-password": setError("That's an invalid password, maybe you need to add more digits to it."); break;
                                case "auth/weak-password": setError("That password is weak! You need to create a more secure password"); break;
                                case "auth/null-username": setError("Your username is empty! You need a username to create an account."); break;
                                case "auth/passwords-dont-match": setError("Passwords don't match! Check if you re-entered your password correctly."); break;
                                case "auth/username-taken": setError("Username is already in user by someone else. Come up with another username!"); break;
                                case "auth/too-many-requests": setError("We've received too many requests from your device, please try again later. 🤖🧑‍💻"); break;
                                case "auth/invalid-username": setError("Username can't contain any spaces or slashes."); break;
                                default: setError("There was an error. Please try again later or report the error via email."); break;
                            }
                            setStage(0);
                        }
                        console.log(email, password, confirmPassword, userName);
                    }}>Sign Me Up!</button>
                    <br />
                    <button className="highlight-btn" onClick={() => {
                        console.log(props.content);
                        props.setShow(false);
                        setTimeout(() => {
                            setEmail("");
                            setPassword("");
                            setConfirmPassword("");
                            setuserName("");
                            props.setModalContent("Log In");
                            props.setShow(true);
                        }, 1000)
                    }}>Log In Instead</button>
                </>)
        } else if (stage == 1) {
            setContentsToDisplay(
                <>
                    <br /><br />
                    <span className="loader yellow"></span>
                    <br /><br /><br /><br />
                </>)
        } else if (stage == 2) {
            setContentsToDisplay(
                <>

                    <br />
                    <h4 className="yellow">Login successful! Welcome aboard :)</h4>
                    <br />
                    <br />

                </>);
        }
    }, [stage, email, password, confirmPassword, userName, error]);

    return <div className="login-modal"><h2>{props.content}</h2><hr />{contentsToDisplay}</div>;
}

export default LoginModalContent;