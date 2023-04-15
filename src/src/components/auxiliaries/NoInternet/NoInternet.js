import React from "react";
import "./NoInternet.css";

function NoInternet(props) {
    console.log("NO INT");
    return (
        <div className="no-internet">
            <span className="note yellow">
                <p className="finished big">🐸</p>
                <br />
                <p className="finished big">No Internet :(</p>
            </span>
            <br />
            <button className="mid-green-btn important" onClick={() => {
                window.location.reload();
            }}>Reload</button>
        </div>
    )
}

export default NoInternet;