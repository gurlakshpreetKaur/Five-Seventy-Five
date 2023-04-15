import React, { useEffect, useState } from "react";
import Header from "../sections/Header/Header";
import Footer from "../sections/Footer/Footer";
import Poems from "../sections/Poems/Poems";
import Account from "../sections/Account/Account";
import { Routes, Route } from "react-router-dom";
import NoInternet from "../auxiliaries/NoInternet/NoInternet";

import { useAuthState } from 'react-firebase-hooks/auth';

import './App.css';
import "../General.css"
import Poem from "../sections/Poem/Poem";

import { auth, db } from "../../firebase-config";
import { getDoc, doc } from "firebase/firestore";
import ViewUserProfile from "../sections/ViewUserProfile/ViewUserProfile";

function App() {
  const [user] = useAuthState(auth);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkIsOnline = async () => {
      try {
        await getDoc(doc(db, "users", "gurlakshpreetkaur@gmail.com"));
        setIsOnline(true);
        return;
      } catch {
        setIsOnline(false);
      }
      setIsOnline(false);
    }
    const checkIsOnlineInterval = setInterval(checkIsOnline, 5000);
    return (() => {
      clearInterval(checkIsOnlineInterval);
    }
    );
  }, []);

  return (
    <>
      <Header />
      <div className="scroll-div">
        <main>
          {isOnline ?
            <Routes>
              <Route path="*" element={<Poem />} />
              <Route path="/" element={<Poems filter={(item) => !item.hide} />} />
              <Route path="/poems" element={<Poems filter={(item) => !item.hide} />} />
              <Route path="/poem/:id" element={<Poem />} />
              {(user && <Route path="/account" element={<Account />} />)}
              <Route path="/user/:id" element={<ViewUserProfile />} />
            </Routes> : <NoInternet />}
          <Footer />
        </main>
      </div>
    </>
  )
}

export default App;