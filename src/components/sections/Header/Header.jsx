import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import "../../General.css";

import { auth, db } from "../../../firebase-config";
import { Link, Outlet } from "react-router-dom";

import { CSSTransition } from "react-transition-group";
import Modal from "../../auxiliaries/modal/Modal";
import LoginModalContent from "../../auxiliaries/login-modal-content/LoginModalContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

function Header() {
    const [currentUser] = useAuthState(auth);

    let userDataLive = null;
    let currentUserRef = null;

    if (auth.currentUser) {
        currentUserRef = doc(db, "users", auth.currentUser.email);
    }
    userDataLive = useDocumentData(currentUserRef)[0];
    const [show, setShow] = useState(false);
    const modalRef = useRef(null);
    const [modalContent, setModalContent] = useState("Log In");
    const [pfp, setPfp] = useState(require("./pfp_yellow.jpg"));

    useEffect(() => {
        if (currentUser && userDataLive) {
            if (currentUser.photoURL === "fetch") {
                setPfp(userDataLive.pfpUri);
            } else {
                setPfp(currentUser.photoURL);
            }
        } else {
            setPfp(require("./pfp_yellow.jpg"));
        }
    }, [currentUser, userDataLive]);

    return (
        <>
            <CSSTransition nodeRef={modalRef} in={show} timeout={350} classNames="modal" unmountOnExit>
                <Modal passingRef={modalRef} setShow={setShow}>
                    <LoginModalContent content={modalContent} setModalContent={setModalContent} setShow={setShow} />
                </Modal>
            </CSSTransition>

            <header className="header spaced-out">
                <h1 className="title"><Link to="/">Five-Seventy-Five</Link></h1>
                {(currentUser
                    &&
                    <Link to="/account">
                        <img className="pfp" src={pfp} alt="user's profile picture (click to navigate to account settings)" />
                    </Link>
                ) ||
                    <>
                        <img className="pfp" src={pfp} onClick={() => setShow(true)} />
                    </>
                }
            </header>
            <Outlet />
        </>
    )
}

export default Header;