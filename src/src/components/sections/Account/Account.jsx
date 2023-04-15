import React, { useEffect, useState, useRef } from "react";
import "./Account.css";
import "../../General.css";
import { auth } from "../../../firebase-config";
import AccountCompose from "../../auxiliaries/AccountCompose/AccountCompose";
import AccountSaved from "../../auxiliaries/AccountSaved/AccountSaved";
import ViewUserProfile from "../ViewUserProfile/ViewUserProfile";
import { updatePassword } from "firebase/auth";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Poems from "../Poems/Poems";
import { CSSTransition } from "react-transition-group";
import Modal from "../../auxiliaries/modal/Modal";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

function Account() {
    const [currentUser] = useAuthState(auth);
    const navigate = useNavigate();

    const [showNavBar, setShowNavBar] = useState(true);
    const [navBarIcon, setNavBarIcon] = useState(<FaArrowLeft />);

    const changePasswordModalRef = useRef(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");
    const [reenterNewPasswordInput, setReenterNewPasswordInput] = useState("");

    const confirmLogOutModalRef = useRef(null);
    const [showConfirmLogOutModal, setShowConfirmLogOutModal] = useState(false);

    const optionalBasedComponents = {
        "profile": <ViewUserProfile contentEditable={true} />,
        "compose": <AccountCompose />,
        "liked": (<span style={{ height: "100%" }}><span style={{ height: "100%" }}><span style={{ height: "100%" }}>
            <div className={"account-saved low-green-solid-bg liked"}>
                <Poems filter={(item) =>
                    item.likedBy.includes(auth.currentUser.email)
                } />
            </div>
        </span></span></span>),
        "bookmarked": <span style={{ height: "100%" }}><AccountSaved type="bookmarked" /></span>,
        "posts": <span style={{ height: "100%" }}><span style={{ height: "100%" }}><AccountSaved type="posts" /></span></span>,
    }

    const [contentToDisplay, setContentToDisplay] = useState(optionalBasedComponents["profile"]);

    const handleClick = (click) => {
        const newOpt = click.target.innerHTML.toLowerCase();
        document.querySelector(".opt-selected").classList.remove("opt-selected");
        click.target.classList.add("opt-selected");
        const component = optionalBasedComponents[newOpt];
        setShowNavBar(false);
        setContentToDisplay(component);
    }

    useEffect(() => {
        if (showNavBar) {
            setTimeout(() => {
                setNavBarIcon(<FaArrowLeft />);
            }, 400);
        }
        else {
            setTimeout(() => {
                setNavBarIcon(<FaArrowRight />);
            }, 400);
        }
    }, [showNavBar]);

    return (
        <>
            <CSSTransition nodeRef={confirmLogOutModalRef} in={showConfirmLogOutModal} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={confirmLogOutModalRef} setShow={setShowConfirmLogOutModal} className="log-out-modal">
                    <h2>Confirm Log-Out</h2>
                    <hr />
                    <p className="white">Are you sure you want to log-out?</p>
                    <span>
                        <button className="wine-btn" onClick={() => {
                            auth.signOut();
                            navigate("/");

                        }}>Log-Out</button>
                        <button className="low-green-btn less-rounded" onClick={() => setShowConfirmLogOutModal(false)}>Cancel</button>
                    </span>
                </Modal>
            </CSSTransition>
            <CSSTransition nodeRef={changePasswordModalRef} in={showChangePasswordModal} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={changePasswordModalRef} setShow={setShowChangePasswordModal} className="mid-green-bg">
                    <h2>Change Password</h2>
                    <hr />
                    <input type="password" placeholder="Enter a new password..." onChange={(change) => setNewPasswordInput(change.target.value)} value={newPasswordInput} />
                    <input type="password" placeholder="Re-enter new password..." onChange={(change) => setReenterNewPasswordInput(change.target.value)} value={reenterNewPasswordInput} />
                    <p className={changePasswordError.charAt(changePasswordError.length - 1) === "!" ? "toShowError mid-green" : "toShowError"}>{changePasswordError}</p>
                    <button onClick={async () => {
                        try {
                            if (newPasswordInput !== reenterNewPasswordInput) throw { code: "auth/passwords-dont-match" };
                            await updatePassword(currentUser, newPasswordInput);
                            setNewPasswordInput("");
                            setReenterNewPasswordInput("");
                            setChangePasswordError("Password successfully changed!");
                        } catch (error) {
                            switch (error.code) {
                                case "auth/internal-error": setChangePasswordError("There was an internal error, please try again later :("); break;
                                case "auth/invalid-password": setChangePasswordError("That's an invalid password, maybe you need to add more digits to it."); break;
                                case "auth/weak-password": setChangePasswordError("That password is weak! You need to create a more secure password."); break;
                                case "auth/passwords-dont-match": setChangePasswordError("Passwords don't match! Check if you re-entered your password correctly."); break;
                                case "auth/too-many-requests": setChangePasswordError("We've received too many requests from your device, please try again later. 🤖🧑‍💻"); break;
                                case "auth/requires-recent-login": setChangePasswordError("The password of a user is sensetive user, hence we need a recent login. Please log out, and log in again."); break;
                                default: setChangePasswordError("There was an error. Please try again later or report the error via email."); break;
                            }
                        }
                    }}>Change Password</button>
                </Modal>
            </CSSTransition>
            <section className="account">
                <nav className={!showNavBar ? "hidden" : ""}>
                    <button className="hide-btn" onClick={() => { setShowNavBar(prev => !prev) }}>
                        {navBarIcon}
                    </button>
                    <div className={"functions"}>
                        <span onClick={handleClick}>Compose</span>
                        <span onClick={handleClick}>Liked</span>
                        <span onClick={handleClick}>Bookmarked</span>
                        <span onClick={handleClick}>Posts</span>
                    </div>

                    <div className="settings">
                        <span onClick={handleClick} className="opt-selected">Profile</span>
                        <span onClick={() => {
                            setShowChangePasswordModal(true);
                            setShowNavBar(false);
                        }}>Change Password</span>
                        <span onClick={() => {
                            setShowConfirmLogOutModal(true);
                        }} className="wine-btn">Log Out</span>
                    </div>
                </nav>
                <div className="account-selected">
                    {contentToDisplay}
                </div>
            </section>
        </>
    );
}

export default Account;