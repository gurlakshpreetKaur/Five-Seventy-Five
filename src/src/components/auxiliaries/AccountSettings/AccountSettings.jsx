import React from "react";
import "./AccountSettings.css";
import { db, auth } from "../../../firebase-config";
import { useAuthState } from "react-firebase-hooks/auth";

function AccountSettings(props) {
    const [currentUser] = useAuthState(auth);
    return (
        <div className="account-settings">
            <div>
                <h3>Preferences</h3>
                <hr />
                <label htmlFor="theme-select">Theme: </label>
                <select id="theme-select">
                    <option>Five-Seventy-Five Signature</option>
                    <option>Dark Mode</option>
                    <option>Light Mode</option>
                </select>
                <br />
                <br />
            </div>
            <div>

                <h3>Reset Password</h3>
                <hr />
                {/* <br /> */}
                <input type="password" placeholder="Enter current password..." />
                <input type="password" placeholder="Create a new password..." />
                <input type="password" placeholder="Re-enter new password..." />
                <br />
                {/* <br /> */}
                <button className="mid-green-btn important">Change Password</button>
            </div>



            <div>
                <h3>Change E-Mail Address</h3>
                <hr />
                <input type="email" placeholder={currentUser.email + "..."} />
                <button className="mid-green-btn important">Change E-Mail Password</button>
            </div>
            <div>

                <h3>Shut-Down Account</h3>
                <hr />
                <button className="wine-btn">Deactivate Account</button>
                <br />
                <button className="wine-btn">Permanently Delete Account</button>
            </div>


        </div>
    )
}

export default AccountSettings;